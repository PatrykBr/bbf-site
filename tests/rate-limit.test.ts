import assert from "node:assert/strict";
import { afterEach, setSystemTime, test } from "bun:test";
import { checkRateLimit } from "../lib/rate-limit.ts";

afterEach(() => setSystemTime());

test("permits the configured number of requests, then blocks", async () => {
    assert.equal((await checkRateLimit("limit", 2, 60_000)).remaining, 1);
    assert.equal((await checkRateLimit("limit", 2, 60_000)).remaining, 0);
    assert.equal((await checkRateLimit("limit", 2, 60_000)).success, false);
    assert.equal((await checkRateLimit("other", 2, 60_000)).success, true);
});

test("resets at the exact window boundary", async () => {
    setSystemTime(100_000);
    await checkRateLimit("boundary", 1, 1000);
    setSystemTime(101_000);
    assert.equal((await checkRateLimit("boundary", 1, 1000)).success, true);
});

test("a shorter window does not expire another client's longer window", async () => {
    setSystemTime(200_000);
    await checkRateLimit("long", 1, 60_000);
    setSystemTime(202_000);
    await checkRateLimit("short", 1, 1000);
    assert.equal((await checkRateLimit("long", 1, 60_000)).success, false);
});

test("a full rate-limit map keeps active limits", () => {
    const now = Date.now() + 100_000;
    setSystemTime(now);
    for (let index = 0; index < 5000; index++) checkRateLimit(`capacity-${index}`, 1, 60_000);
    assert.equal(checkRateLimit("overflow", 1, 60_000).success, false);
    assert.equal(checkRateLimit("capacity-0", 1, 60_000).success, false);
    setSystemTime(now + 60_000);
    assert.equal(checkRateLimit("overflow", 1, 60_000).success, true);
});
