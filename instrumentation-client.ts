import posthog from "posthog-js";
import { analyticsEnabled } from "./lib/posthog";

if (analyticsEnabled) {
    try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!.trim(), {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://t.broncelfurniture.com",
            ui_host: "https://eu.posthog.com",
            defaults: "2026-08-30",
            advanced_disable_flags: true,
            disable_session_recording: true,
            disable_surveys: true,
            disable_product_tours: true,
            disable_web_experiments: true,
            disable_external_dependency_loading: true
        });
    } catch {
        // Optional analytics must not prevent hydration.
    }
}
