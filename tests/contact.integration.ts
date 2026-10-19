import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, test } from "bun:test";
import { startNextServer } from "./helpers/next-server.ts";
import { startRateLimitServer } from "./helpers/rate-limit-server.ts";

const emails: { subject: string; reply_to: string; html: string; text: string }[] = [];
let deliveryFails = false;
let mail: ReturnType<typeof Bun.serve>;
let site: Awaited<ReturnType<typeof startNextServer>>;
let unconfigured: Awaited<ReturnType<typeof startNextServer>>;
let rateLimit: ReturnType<typeof startRateLimitServer>;
let client = 1;
const valid = {
    name: " Jane Smith ",
    email: " jane@example.com ",
    message: " Please quote for <kitchen> cabinets. "
};
const post = (body: unknown, headers = {}) =>
    fetch(`${site.url}/api/contact`, {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
        headers: { "content-type": "application/json", "x-test-client-ip": `192.0.2.${client++}`, ...headers }
    });

beforeAll(async () => {
    mail = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        async fetch(request) {
            emails.push(await request.json());
            return Response.json(
                deliveryFails ? { name: "application_error", message: "Fixture failure" } : { id: "fixture-email" },
                { status: deliveryFails ? 500 : 200 }
            );
        }
    });
    const mailUrl = mail.url.origin;
    rateLimit = startRateLimitServer();
    const rateLimitEnv = { TURSO_DATABASE_URL: rateLimit.url, TURSO_AUTH_TOKEN: "fixture-token" };
    site = await startNextServer("start", {
        ...rateLimitEnv,
        RESEND_API_KEY: "re_local_fixture",
        RESEND_BASE_URL: mailUrl,
        CONTACT_IP_HEADER: "x-test-client-ip"
    });
    unconfigured = await startNextServer("start", { ...rateLimitEnv, RESEND_BASE_URL: mailUrl });
}, 30_000);

afterAll(async () => {
    await Promise.all([site?.stop(), unconfigured?.stop(), mail?.stop(true), rateLimit?.stop()]);
});

beforeEach(() => {
    emails.length = 0;
    deliveryFails = false;
    rateLimit.state.unavailable = false;
});

test("valid submissions reach the mail provider with normalized, escaped content", async () => {
    const response = await post(valid);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
    assert.equal(emails.length, 1);
    assert.equal(emails[0].subject, "Furniture enquiry from Jane Smith");
    assert.equal(emails[0].reply_to, "jane@example.com");
    assert.ok(emails[0].html.includes("&lt;kitchen&gt;"));
    assert.ok(emails[0].text.includes("<kitchen>"));
});

test("honeypot submissions never reach the mail provider", async () => {
    assert.equal((await post({ ...valid, _honeypot: "spam" })).status, 200);
    assert.equal(emails.length, 0);
});

test("fast submissions receive a retry error", async () => {
    const response = await post({ ...valid, _formRenderedAt: Date.now() });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "TOO_FAST");
    assert.equal(emails.length, 0);
});

test("invalid request formats, oversized bodies and invalid fields are rejected", async () => {
    assert.equal((await post(valid, { "content-type": "text/plain" })).status, 415);
    for (const body of ["{", "[]", "null"]) assert.equal((await post(body)).status, 400);
    assert.equal((await post("x".repeat(33_000))).status, 413);
    const response = await post({ ...valid, email: "bad" });
    assert.equal(response.status, 400);
    assert.ok((await response.json()).fieldErrors.email);
});

test("project enquiries include known references and ignore unknown references", async () => {
    const project = "navy-blue-shaker-kitchen";
    const projectResponse = await post({ ...valid, projectSlug: project });
    assert.equal(projectResponse.status, 200);
    const projectEmail = emails.at(-1)!;
    assert.ok(projectEmail.text.includes("Project reference: Navy blue Shaker kitchen"));
    assert.ok(projectEmail.html.includes(`/work/${project}`));

    const unknownResponse = await post({ ...valid, projectSlug: "<script>unknown</script>" });
    assert.equal(unknownResponse.status, 200);
    assert.ok(!emails.at(-1)!.text.includes("Project reference:"));
    assert.ok(!emails.at(-1)!.html.includes("<script>"));
});

test("full-length Unicode and JSON-escaped messages reach the mail provider", async () => {
    for (const message of ["家".repeat(5000), '"\\\n'.repeat(1666)]) {
        const response = await post({ ...valid, message });
        assert.equal(response.status, 200);
        assert.ok(emails.at(-1)!.text.includes(message.trim()));
    }
});

test("provider failures return a 502 response", async () => {
    deliveryFails = true;
    const response = await post(valid);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
});

test("the sixth request is blocked with retry headers", async () => {
    for (let count = 0; count < 5; count++)
        assert.equal((await post({ _honeypot: "bot" }, { "x-test-client-ip": "198.51.100.1" })).status, 200);
    const response = await post(valid, { "x-test-client-ip": "198.51.100.1" });
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("x-ratelimit-remaining"), "0");
    assert.ok(Number(response.headers.get("retry-after")) > 0);
});

test("a missing email API key returns a configuration error", async () => {
    const response = await fetch(`${unconfigured.url}/api/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(valid)
    });
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error, "RESEND_NOT_CONFIGURED");
});

test("a shared rate-limit outage returns 503 and never sends an email", async () => {
    rateLimit.state.unavailable = true;
    const response = await post(valid);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, "RATE_LIMIT_UNAVAILABLE");
    assert.equal(emails.length, 0);
});

test("separate application processes share one quota", async () => {
    const headers = { "content-type": "application/json", "x-test-client-ip": "198.51.100.42" };
    const secondEnv = {
        TURSO_DATABASE_URL: rateLimit.url,
        TURSO_AUTH_TOKEN: "fixture-token",
        CONTACT_IP_HEADER: "x-test-client-ip"
    };
    let second = await startNextServer("start", secondEnv);
    try {
        const responses = await Promise.all(
            Array.from({ length: 12 }, (_, index) =>
                fetch(`${index % 2 ? site.url : second.url}/api/contact`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ _honeypot: "fixture" })
                })
            )
        );
        assert.equal(responses.filter(response => response.status === 200).length, 5);
        assert.equal(responses.filter(response => response.status === 429).length, 7);
        assert.equal(emails.length, 0);
        await second.stop();
        second = await startNextServer("start", secondEnv);
        assert.equal(
            (
                await fetch(`${second.url}/api/contact`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ _honeypot: "fixture" })
                })
            ).status,
            429
        );
    } finally {
        await second.stop();
    }
});
