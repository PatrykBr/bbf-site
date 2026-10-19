interface RateLimitEntry {
    count: number;
    expiresAt: number;
}

const entries = new Map<string, RateLimitEntry>();
const MAX_KEYS = 5_000;

export function checkRateLimit(identifier: string, limit = 5, windowMs = 60 * 60 * 1000) {
    const now = Date.now();
    let entry = entries.get(identifier);

    if (!entry || entry.expiresAt <= now) {
        // Remove expired entries when the map reaches its limit.
        if (entries.size >= MAX_KEYS) {
            for (const [key, value] of entries) {
                if (value.expiresAt <= now) entries.delete(key);
            }
        }

        if (!entries.has(identifier) && entries.size >= MAX_KEYS) {
            // Keep active limits so new client identifiers cannot reset existing quotas.
            const expiresAt = Math.min(...Array.from(entries.values(), value => value.expiresAt));
            return { success: false, remaining: 0, resetIn: Math.ceil((expiresAt - now) / 1000), limit };
        }

        entry = { count: 0, expiresAt: now + windowMs };
        entries.set(identifier, entry);
    }

    const success = entry.count < limit;
    if (success) entry.count++;

    return {
        success,
        remaining: Math.max(0, limit - entry.count),
        resetIn: Math.ceil((entry.expiresAt - now) / 1000),
        limit
    };
}
