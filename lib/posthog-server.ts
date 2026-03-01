import { PostHog } from "posthog-node";

let posthogInstance: PostHog | null = null;

function getPostHogKey(): string | null {
    return process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY || null;
}

export function getPostHogServer(): PostHog | null {
    const posthogKey = getPostHogKey();

    if (!posthogKey) {
        return null;
    }

    if (!posthogInstance) {
        posthogInstance = new PostHog(posthogKey, {
            host: "https://eu.i.posthog.com",
            flushAt: 1,
            flushInterval: 0
        });
    }

    return posthogInstance;
}
