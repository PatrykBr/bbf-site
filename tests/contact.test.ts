import assert from "node:assert/strict";
import { test } from "bun:test";
import { validateContactForm } from "../lib/contact.ts";

const valid = { name: "Jane Smith", email: "jane@example.com", message: "Please quote for a fitted kitchen." };

test("accepts a valid enquiry and optional UK phone number", () => {
    assert.equal(validateContactForm(valid).isValid, true);
    assert.equal(validateContactForm({ ...valid, phone: "+44 (0)7523 706742" }).isValid, true);
});

test("rejects empty fields, invalid emails, and overlong messages", () => {
    assert.deepEqual(Object.keys(validateContactForm({ name: " ", email: "no-at-sign", message: "short" }).errors), [
        "name",
        "email",
        "message"
    ]);
    assert.ok(validateContactForm({ ...valid, message: "x".repeat(5001) }).errors.message);
});

test("rejects control characters in email headers", () => {
    assert.ok(validateContactForm({ ...valid, name: "Jane\r\nBcc: someone@example.com" }).errors.name);
    assert.ok(validateContactForm({ ...valid, email: "jane@example.com\r\n" }).errors.email);
});
