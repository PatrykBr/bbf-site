"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { ReactNode } from "react";
import type { SharePastWorkEvent, ClickPastWorkEvent, ShareMethod, WorkCategory } from "./types";

/**
 * PostHog provider wrapper component
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
    return <PHProvider client={posthog}>{children}</PHProvider>;
}

/**
 * Hook to track analytics events
 */
export function useAnalytics() {
    const posthogClient = usePostHog();

    /**
     * Track when user shares a past work item
     */
    const trackSharePastWork = (workId: string, category: WorkCategory, shareMethod: ShareMethod) => {
        const event: SharePastWorkEvent = {
            work_id: workId,
            category,
            share_method: shareMethod,
            timestamp: new Date().toISOString()
        };

        try {
            posthogClient?.capture("share_past_work", event);

            if (process.env.NODE_ENV === "development") {
                console.log("[Analytics] share_past_work:", event);
            }
        } catch (error) {
            console.error("[Analytics] Failed to track share event:", error);
        }
    };

    /**
     * Track when user clicks to view a past work item
     */
    const trackClickPastWork = (workId: string, category: WorkCategory) => {
        const event: ClickPastWorkEvent = {
            work_id: workId,
            category,
            timestamp: new Date().toISOString()
        };

        try {
            posthogClient?.capture("click_past_work", event);

            if (process.env.NODE_ENV === "development") {
                console.log("[Analytics] click_past_work:", event);
            }
        } catch (error) {
            console.error("[Analytics] Failed to track click event:", error);
        }
    };

    return {
        trackSharePastWork,
        trackClickPastWork
    };
}
