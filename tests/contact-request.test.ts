import assert from "node:assert/strict";
import { afterEach, test } from "bun:test";
import { getRateLimitIdentifier, parseContactBody } from "../lib/contact-request.ts";
import { buildEmailHtml, buildEmailText } from "../lib/contact-email.ts";

const request = (body: string, headers = {}) =>
    new Request("http://localhost/api/contact", { method: "POST", body, headers });

const originalEnv = { ...process.env };
afterEach(() => {
    process.env = { ...originalEnv };
});

test("rejects malformed JSON and non-object payloads", async () => {
    for (const body of ["{", "null", "[]", "42", '"text"']) {
        assert.deepEqual(await parseContactBody(request(body)), { success: false, code: "INVALID_JSON" });
    }
});

test("rejects oversized UTF-8 bodies when Content-Length is missing or incorrect", async () => {
    for (const headers of [{}, { "content-length": "1" }]) {
        assert.deepEqual(await parseContactBody(request('"' + "é".repeat(10) + '"', headers), 20), {
            success: false,
            code: "BODY_TOO_LARGE"
        });
    }
});

test("cancels oversized chunked bodies before reading the rest", async () => {
    let reads = 0;
    let cancelled = false;
    const body = new ReadableStream(
        {
            pull(controller) {
                reads++;
                controller.enqueue(new Uint8Array(100));
            },
            cancel() {
                cancelled = true;
            }
        },
        { highWaterMark: 0 }
    );
    const streamed = new Request("http://localhost", { method: "POST", body, duplex: "half" } as RequestInit);
    assert.deepEqual(await parseContactBody(streamed, 50), { success: false, code: "BODY_TOO_LARGE" });
    assert.equal(reads, 1);
    assert.equal(cancelled, true);
});

test("accepts exact-size JSON and sanitizes unexpected field types", async () => {
    const result = await parseContactBody(request('{"name":42}'), 11);
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.name, "");
});

test("accepts messages at the form limit after UTF-8 encoding and JSON escaping", async () => {
    for (const message of ["家".repeat(5000), "\u0001".repeat(5000)]) {
        const result = await parseContactBody(request(JSON.stringify({ message })));
        assert.equal(result.success, true);
        if (result.success) assert.equal(result.data.message, message);
    }
});

test("untrusted IP headers and user agents share one rate limit", () => {
    process.env.VERCEL = "";
    process.env.CONTACT_IP_HEADER = "";
    const a = getRateLimitIdentifier(new Headers({ "x-forwarded-for": "1.2.3.4", "user-agent": "one" }));
    const b = getRateLimitIdentifier(new Headers({ "x-forwarded-for": "5.6.7.8", "user-agent": "two" }));
    assert.equal(a, b);
});

test("Vercel's overwritten header identifies clients without exposing IP addresses", () => {
    process.env.VERCEL = "1";
    const key = getRateLimitIdentifier(new Headers({ "x-vercel-forwarded-for": "1.2.3.4" }));
    assert.match(key, /^[a-f0-9]{64}$/);
    assert.notEqual(key, getRateLimitIdentifier(new Headers({ "x-vercel-forwarded-for": "5.6.7.8" })));
});

test("email HTML escapes customer content while plain text preserves it", () => {
    const body = {
        name: 'Jane <&> "Smith"',
        email: "jane@example.com",
        phone: "+44 7523 706742",
        message: "<script>alert('x')</script>\nPlease quote."
    };
    const html = buildEmailHtml(body);
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(html.includes("&quot;Smith&quot;"));
    assert.ok(buildEmailText(body).includes(body.message));
    assert.ok(buildEmailText(body).includes(body.phone));
});
