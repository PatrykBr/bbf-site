import { PostHog } from "posthog-node";

let posthogInstance: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_POSTHOG_ENABLE_LOCAL !== "true") return null;
    const posthogKey = process.env.POSTHOG_KEY?.trim() || process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();

    if (!posthogKey) {
        return null;
    }

    if (!posthogInstance) {
        posthogInstance = new PostHog(posthogKey, {
            host: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://t.broncelfurniture.com",
            flushAt: 1,
            flushInterval: 0
        });
    }

    return posthogInstance;
}
