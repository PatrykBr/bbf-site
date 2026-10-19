import assert from "node:assert/strict";
import { afterAll, afterEach, beforeEach, setSystemTime, test } from "bun:test";
import { checkRateLimit, initializeRateLimit } from "../lib/rate-limit.ts";
import { startRateLimitServer } from "./helpers/rate-limit-server.ts";

const originalEnv = { ...process.env };
const turso = startRateLimitServer();
beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "test" };
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
    turso.state.unavailable = false;
    turso.state.invalidResult = false;
    turso.state.statementFails = false;
    turso.state.now = undefined;
    turso.db.exec("DELETE FROM contact_rate_limits");
});
afterAll(() => turso.stop());

function useTurso() {
    process.env.TURSO_DATABASE_URL = turso.url;
    process.env.TURSO_AUTH_TOKEN = "fixture-token";
}
afterEach(() => {
    setSystemTime();
    process.env = { ...originalEnv };
});

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

test("a full rate-limit map keeps active limits", async () => {
    const now = Date.now() + 100_000;
    setSystemTime(now);
    for (let index = 0; index < 5000; index++) await checkRateLimit(`capacity-${index}`, 1, 60_000);
    assert.equal((await checkRateLimit("overflow", 1, 60_000)).success, false);
    assert.equal((await checkRateLimit("capacity-0", 1, 60_000)).success, false);
    setSystemTime(now + 60_000);
    assert.equal((await checkRateLimit("overflow", 1, 60_000)).success, true);
});

test("production refuses submissions without shared rate-limit credentials", async () => {
    process.env = { ...process.env, NODE_ENV: "production" };
    await assert.rejects(checkRateLimit("unconfigured"), /not configured/);
});

test("Turso permits only the configured quota across concurrent requests", async () => {
    useTurso();
    const results = await Promise.all(Array.from({ length: 12 }, () => checkRateLimit("concurrent")));
    assert.equal(results.filter(result => result.success).length, 5);
    assert.equal(results.filter(result => !result.success).length, 7);
    assert.equal((await checkRateLimit("other")).success, true);
    assert.equal((await checkRateLimit("concurrent")).remaining, 0);
});

test("Turso keeps the first request's expiry and resets at the window boundary", async () => {
    useTurso();
    setSystemTime(1_000_000);
    assert.equal((await checkRateLimit("expiry", 1, 60_000)).resetIn, 60);
    setSystemTime(1_030_000);
    assert.equal((await checkRateLimit("expiry", 1, 60_000)).resetIn, 30);
    setSystemTime(1_060_000);
    assert.equal((await checkRateLimit("expiry", 1, 60_000)).success, true);
});

test("Turso uses its clock when the application clock differs", async () => {
    useTurso();
    turso.state.now = 2_000_000;
    setSystemTime(100_000);
    await checkRateLimit("clock", 1, 60_000);
    setSystemTime(9_000_000);
    assert.equal((await checkRateLimit("clock", 1, 60_000)).success, false);
    turso.state.now += 60_000;
    assert.equal((await checkRateLimit("clock", 1, 60_000)).success, true);
});

test("Turso keeps quotas separate for each deployment environment", async () => {
    useTurso();
    process.env.VERCEL_ENV = "production";
    await checkRateLimit("environment", 1);
    process.env.VERCEL_ENV = "preview";
    assert.equal((await checkRateLimit("environment", 1)).success, true);
    process.env.VERCEL_ENV = "production";
    assert.equal((await checkRateLimit("environment", 1)).success, false);
});

test("Turso removes expired counters and retains active counters", async () => {
    useTurso();
    setSystemTime(3_000_000);
    await checkRateLimit("short", 1, 1000);
    await checkRateLimit("long", 1, 60_000);
    setSystemTime(3_001_000);
    await checkRateLimit("new");
    assert.equal(
        turso.db.query<{ total: number }, []>("SELECT count(*) AS total FROM contact_rate_limits").get()?.total,
        2
    );
    assert.equal((await checkRateLimit("long", 1, 60_000)).success, false);
});

test("Turso binds client identifiers as SQL parameters", async () => {
    useTurso();
    await checkRateLimit("'); DROP TABLE contact_rate_limits; --", 1);
    assert.equal((await checkRateLimit("normal", 1)).success, true);
});

test("database setup can run more than once without resetting quotas", async () => {
    useTurso();
    await checkRateLimit("setup", 1);
    await initializeRateLimit();
    await initializeRateLimit();
    assert.equal((await checkRateLimit("setup", 1)).success, false);
});

test("configured Turso failures never fall back to a process-local quota", async () => {
    useTurso();
    turso.state.unavailable = true;
    await assert.rejects(checkRateLimit("unavailable"), /unavailable/);
    turso.state.unavailable = false;
    turso.state.invalidResult = true;
    await assert.rejects(checkRateLimit("invalid"), /invalid result/);
    turso.state.invalidResult = false;
    turso.state.statementFails = true;
    await assert.rejects(checkRateLimit("sql-error"), /invalid result/);
    turso.state.statementFails = false;
    process.env.TURSO_AUTH_TOKEN = "incorrect-token";
    await assert.rejects(checkRateLimit("unauthorized"), /unavailable/);
    delete process.env.TURSO_AUTH_TOKEN;
    await assert.rejects(checkRateLimit("partial-configuration"), /not configured/);
});
