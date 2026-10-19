import assert from "node:assert/strict";
import { afterAll, beforeAll, test } from "bun:test";
import { startNextServer } from "./helpers/next-server.ts";

const emails: { subject: string; reply_to: string; html: string; text: string }[] = [];
let deliveryFails = false;
let mail: ReturnType<typeof Bun.serve>;
let site: Awaited<ReturnType<typeof startNextServer>>;
let unconfigured: Awaited<ReturnType<typeof startNextServer>>;
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
    site = await startNextServer("start", {
        RESEND_API_KEY: "re_local_fixture",
        RESEND_BASE_URL: mailUrl,
        CONTACT_IP_HEADER: "x-test-client-ip"
    });
    unconfigured = await startNextServer("start", { RESEND_BASE_URL: mailUrl });
}, 30_000);

afterAll(async () => {
    await Promise.all([site?.stop(), unconfigured?.stop(), mail?.stop(true)]);
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
    assert.equal(emails.length, 1);
});

test("fast submissions receive a retry error", async () => {
    const response = await post({ ...valid, _formRenderedAt: Date.now() });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "TOO_FAST");
    assert.equal(emails.length, 1);
});

test("invalid request formats, oversized bodies and invalid fields are rejected", async () => {
    assert.equal((await post(valid, { "content-type": "text/plain" })).status, 415);
    for (const body of ["{", "[]", "null"]) assert.equal((await post(body)).status, 400);
    assert.equal((await post("x".repeat(11_000))).status, 413);
    const response = await post({ ...valid, email: "bad" });
    assert.equal(response.status, 400);
    assert.ok((await response.json()).fieldErrors.email);
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
