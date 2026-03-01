import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let posthogInitialized = false;

function initPostHog() {
    if (posthogInitialized || !POSTHOG_KEY) {
        return;
    }

    posthog.init(POSTHOG_KEY, {
        api_host: "/ph",
        ui_host: "https://eu.posthog.com",
        defaults: "2026-01-30"
    });

    posthogInitialized = true;
}

initPostHog();

export function onRouterTransitionStart(_url: string, _navigationType: "push" | "replace" | "traverse") {
    void _url;
    void _navigationType;

    initPostHog();

    if (!posthogInitialized) {
        return;
    }

    posthog.capture("$pageleave");
}
