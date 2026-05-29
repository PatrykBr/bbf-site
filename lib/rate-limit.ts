interface RateLimitEntry {
    count: number;
    firstRequest: number;
    lastSeen: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_IN_MEMORY_KEYS = 5_000;

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
    limit: number;
    source: "memory";
}

function windowSeconds(windowMs: number): number {
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
            resetIn: windowSeconds(windowMs),
            limit: maxRequests,
            source: "memory"
        };
    }

    if (now - entry.firstRequest > windowMs) {
        rateLimitMap.set(identifier, { count: 1, firstRequest: now, lastSeen: now });
        return {
            success: true,
            remaining: maxRequests - 1,
            resetIn: windowSeconds(windowMs),
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

export async function checkRateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 60 * 60 * 1000
): Promise<RateLimitResult> {
    return checkInMemoryRateLimit(identifier, maxRequests, windowMs);
}
