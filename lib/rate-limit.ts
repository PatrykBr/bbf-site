import { createHash } from "crypto";

interface RateLimitEntry {
    count: number;
    firstRequest: number;
    lastSeen: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_IN_MEMORY_KEYS = 5_000;
const UPSTASH_TIMEOUT_MS = 2_000;

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
    limit: number;
    source: "memory" | "upstash";
}

function nowSeconds(windowMs: number): number {
    return Math.ceil(windowMs / 1000);
}

function pruneInMemoryStore(now: number, windowMs: number) {
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now - entry.firstRequest > windowMs) {
            rateLimitMap.delete(key);
        }
    }

    if (rateLimitMap.size <= MAX_IN_MEMORY_KEYS) {
        return;
    }

    const sortedByLastSeen = [...rateLimitMap.entries()].toSorted((a, b) => a[1].lastSeen - b[1].lastSeen);
    const overflowCount = rateLimitMap.size - MAX_IN_MEMORY_KEYS;

    for (let index = 0; index < overflowCount; index++) {
        const entry = sortedByLastSeen[index];
        if (entry) {
            rateLimitMap.delete(entry[0]);
        }
    }
}

function checkInMemoryRateLimit(identifier: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    pruneInMemoryStore(now, windowMs);

    const entry = rateLimitMap.get(identifier);

    if (!entry) {
        rateLimitMap.set(identifier, { count: 1, firstRequest: now, lastSeen: now });
        return {
            success: true,
            remaining: maxRequests - 1,
            resetIn: nowSeconds(windowMs),
            limit: maxRequests,
            source: "memory"
        };
    }

    if (now - entry.firstRequest > windowMs) {
        rateLimitMap.set(identifier, { count: 1, firstRequest: now, lastSeen: now });
        return {
            success: true,
            remaining: maxRequests - 1,
            resetIn: nowSeconds(windowMs),
            limit: maxRequests,
            source: "memory"
        };
    }

    entry.lastSeen = now;

    if (entry.count >= maxRequests) {
        const resetIn = Math.ceil((entry.firstRequest + windowMs - now) / 1000);
        return {
            success: false,
            remaining: 0,
            resetIn,
            limit: maxRequests,
            source: "memory"
        };
    }

    entry.count += 1;
    const resetIn = Math.ceil((entry.firstRequest + windowMs - now) / 1000);

    return {
        success: true,
        remaining: maxRequests - entry.count,
        resetIn,
        limit: maxRequests,
        source: "memory"
    };
}

async function upstashCommand(command: string[]): Promise<number | null> {
    const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!baseUrl || !token) {
        return null;
    }

    const encodedCommand = command.map(value => encodeURIComponent(value)).join("/");
    const commandUrl = `${baseUrl.replace(/\/+$/, "")}/${encodedCommand}`;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), UPSTASH_TIMEOUT_MS);

    try {
        const response = await fetch(commandUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: "no-store",
            signal: abortController.signal
        });

        if (!response.ok) {
            return null;
        }

        const payload = (await response.json()) as { result?: unknown };

        if (typeof payload.result === "number") {
            return payload.result;
        }

        if (typeof payload.result === "string") {
            const parsedNumber = Number(payload.result);
            return Number.isFinite(parsedNumber) ? parsedNumber : null;
        }

        return null;
    } catch {
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function checkUpstashRateLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
): Promise<RateLimitResult | null> {
    const hashedIdentifier = createHash("sha256").update(identifier).digest("hex");
    const key = `bbf:rate_limit:${hashedIdentifier}`;

    const currentCount = await upstashCommand(["incr", key]);
    if (currentCount === null) {
        return null;
    }

    if (currentCount === 1) {
        await upstashCommand(["pexpire", key, String(windowMs)]);
    }

    const remaining = Math.max(0, maxRequests - currentCount);
    const ttlMs = await upstashCommand(["pttl", key]);
    const resetIn = ttlMs && ttlMs > 0 ? Math.ceil(ttlMs / 1000) : nowSeconds(windowMs);

    return {
        success: currentCount <= maxRequests,
        remaining,
        resetIn,
        limit: maxRequests,
        source: "upstash"
    };
}

export async function checkRateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 60 * 60 * 1000
): Promise<RateLimitResult> {
    const distributedResult = await checkUpstashRateLimit(identifier, maxRequests, windowMs);

    if (distributedResult) {
        return distributedResult;
    }

    return checkInMemoryRateLimit(identifier, maxRequests, windowMs);
}
