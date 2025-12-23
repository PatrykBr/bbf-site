export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        // Import server-side instrumentation only in Node.js runtime
        await import("./lib/posthog-server");
    }
}

export async function onRequestError(
    err: Error & { digest?: string },
    request: { headers: { cookie?: string | string[] } },
    _context: unknown
) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { getPostHogServer } = await import("./lib/posthog-server");
        const posthog = getPostHogServer();

        let distinctId: string | undefined;

        if (request.headers.cookie) {
            const cookieString = Array.isArray(request.headers.cookie)
                ? request.headers.cookie.join("; ")
                : request.headers.cookie;

            const postHogCookieMatch = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/);

            if (postHogCookieMatch?.[1]) {
                try {
                    const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
                    const postHogData = JSON.parse(decodedCookie);
                    distinctId = postHogData.distinct_id;
                } catch (e) {
                    console.error("Error parsing PostHog cookie:", e);
                }
            }
        }

        await posthog.captureException(err, distinctId);
    }
}
