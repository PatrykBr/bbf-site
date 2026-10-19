export async function onRequestError(
    err: Error & { digest?: string },
    request: { headers: { cookie?: string | string[] } }
) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { getPostHogServer } = await import("./lib/posthog-server");
        const posthog = getPostHogServer();

        if (!posthog) {
            return;
        }

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
                    if (typeof postHogData?.distinct_id === "string") distinctId = postHogData.distinct_id;
                } catch {
                    // Invalid analytics cookies should not affect error reporting.
                }
            }
        }

        await posthog.captureExceptionImmediate(err, distinctId);
    }
}
