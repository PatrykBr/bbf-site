interface RateLimitEntry {
    count: number;
    expiresAt: number;
}

const entries = new Map<string, RateLimitEntry>();
const MAX_KEYS = 5_000;

export const RATE_LIMIT_SCHEMA = [
    `CREATE TABLE IF NOT EXISTS contact_rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
    )`,
    "CREATE INDEX IF NOT EXISTS contact_rate_limits_expiry ON contact_rate_limits (expires_at)"
];

export async function initializeRateLimit() {
    await executeStatements(RATE_LIMIT_SCHEMA.map(sql => ({ sql })));
}

export async function checkRateLimit(identifier: string, limit = 5, windowMs = 60 * 60 * 1000) {
    const url = process.env.TURSO_DATABASE_URL?.trim();
    const token = process.env.TURSO_AUTH_TOKEN?.trim();
    if (!url && !token && process.env.NODE_ENV !== "production") {
        return checkInMemoryRateLimit(identifier, limit, windowMs);
    }
    const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
    const key = `bbf:contact:${environment}:${identifier}`;
    // Use the database clock so all application processes share the same window.
    const now = "CAST(unixepoch('subsec') * 1000 AS INTEGER)";
    const rows = await executeStatements([
        { sql: `DELETE FROM contact_rate_limits WHERE expires_at <= ${now}` },
        {
            sql: `INSERT INTO contact_rate_limits (key, count, expires_at)
                VALUES (?, 1, ${now} + ?)
                ON CONFLICT (key) DO UPDATE SET
                    count = CASE WHEN expires_at <= ${now} THEN 1 ELSE count + 1 END,
                    expires_at = CASE WHEN expires_at <= ${now} THEN excluded.expires_at ELSE expires_at END
                RETURNING count, expires_at - ${now}`,
            args: [
                { type: "text", value: key },
                { type: "integer", value: String(windowMs) }
            ]
        }
    ]);
    const count = Number(rows?.[0]?.[0]?.value);
    const ttl = Number(rows?.[0]?.[1]?.value);
    if (!Number.isSafeInteger(count) || count < 1 || !Number.isSafeInteger(ttl) || ttl < 0) {
        throw new Error("The shared contact rate limit returned an invalid result.");
    }

    return {
        success: count <= limit,
        remaining: Math.max(0, limit - count),
        resetIn: Math.max(1, Math.ceil(ttl / 1000)),
        limit
    };
}

async function executeStatements(statements: { sql: string; args?: { type: string; value: string }[] }[]) {
    const url = process.env.TURSO_DATABASE_URL?.trim();
    const token = process.env.TURSO_AUTH_TOKEN?.trim();
    if (!url || !token) throw new Error("The shared contact rate limit is not configured.");

    const endpoint = new URL("/v2/pipeline", url.replace(/^libsql:/, "https:"));
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            requests: [...statements.map(stmt => ({ type: "execute", stmt })), { type: "close" }]
        }),
        signal: AbortSignal.timeout(3000),
        cache: "no-store"
    });
    if (!response.ok) throw new Error("The shared contact rate limit is unavailable.");

    const { results } = (await response.json()) as {
        results?: { type: string; response?: { result?: { rows?: { value: string }[][] } } }[];
    };
    if (
        !Array.isArray(results) ||
        results.length !== statements.length + 1 ||
        results.some(result => result?.type !== "ok")
    ) {
        throw new Error("The shared contact rate limit returned an invalid result.");
    }
    return results[statements.length - 1]?.response?.result?.rows;
}

function checkInMemoryRateLimit(identifier: string, limit: number, windowMs: number) {
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
