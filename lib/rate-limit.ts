interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(
    () => {
        const now = Date.now();
        const windowMs = 60 * 60 * 1000; // 1 hour
        for (const [key, entry] of rateLimitMap.entries()) {
            if (now - entry.firstRequest > windowMs) {
                rateLimitMap.delete(key);
            }
        }
    },
    5 * 60 * 1000
);

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // seconds until reset
}

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 60 * 60 * 1000 // 1 hour default
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    if (!entry) {
        // First request from this identifier
        rateLimitMap.set(identifier, { count: 1, firstRequest: now });
        return { success: true, remaining: maxRequests - 1, resetIn: Math.ceil(windowMs / 1000) };
    }

    // Check if window has expired
    if (now - entry.firstRequest > windowMs) {
        // Reset the window
        rateLimitMap.set(identifier, { count: 1, firstRequest: now });
        return { success: true, remaining: maxRequests - 1, resetIn: Math.ceil(windowMs / 1000) };
    }

    // Window still active
    if (entry.count >= maxRequests) {
        const resetIn = Math.ceil((entry.firstRequest + windowMs - now) / 1000);
        return { success: false, remaining: 0, resetIn };
    }

    // Increment count
    entry.count++;
    const resetIn = Math.ceil((entry.firstRequest + windowMs - now) / 1000);
    return { success: true, remaining: maxRequests - entry.count, resetIn };
}
