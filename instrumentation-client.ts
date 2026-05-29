import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://t.broncelfurniture.com";
const POSTHOG_ENABLE_LOCAL = process.env.NEXT_PUBLIC_POSTHOG_ENABLE_LOCAL === "true";
let posthogInitialized = false;

function initPostHog() {
    if (posthogInitialized || !POSTHOG_KEY) {
        return;
    }

    if (process.env.NODE_ENV === "development" && !POSTHOG_ENABLE_LOCAL) {
        return;
    }

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        ui_host: "https://eu.posthog.com",
        defaults: "2026-01-30",
        advanced_disable_flags: true,
        disable_session_recording: true,
        disable_surveys: true,
        disable_product_tours: true,
        disable_web_experiments: true,
        disable_external_dependency_loading: true
    });

    posthogInitialized = true;
}

initPostHog();

export function onRouterTransitionStart() {
    initPostHog();

    if (!posthogInitialized) {
        return;
    }

    posthog.capture("$pageleave");
}
