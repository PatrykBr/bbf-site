"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { ReactNode, useCallback } from "react";
import type {
    SharePastWorkEvent,
    ClickPastWorkEvent,
    ViewPastWorkEvent,
    ShareMethod,
    WorkCategory,
    ViewSource
} from "./types";

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

    const capture = useCallback(
        (eventName: string, event: Record<string, unknown>) => {
            try {
                posthogClient?.capture(eventName, event);

                if (process.env.NODE_ENV === "development") {
                    console.log(`[Analytics] ${eventName}:`, event);
                }
            } catch (error) {
                console.error(`[Analytics] Failed to track ${eventName}:`, error);
            }
        },
        [posthogClient]
    );

    const trackSharePastWork = useCallback(
        (workId: string, category: WorkCategory, shareMethod: ShareMethod) => {
            capture("share_past_work", {
                work_id: workId,
                category,
                share_method: shareMethod,
                timestamp: new Date().toISOString()
            } satisfies SharePastWorkEvent);
        },
        [capture]
    );

    const trackClickPastWork = useCallback(
        (workId: string, category: WorkCategory) => {
            capture("click_past_work", {
                work_id: workId,
                category,
                timestamp: new Date().toISOString()
            } satisfies ClickPastWorkEvent);
        },
        [capture]
    );

    const trackViewPastWork = useCallback(
        (workId: string, category: WorkCategory, viewSource: ViewSource) => {
            capture("view_past_work", {
                work_id: workId,
                category,
                view_source: viewSource,
                timestamp: new Date().toISOString()
            } satisfies ViewPastWorkEvent);
        },
        [capture]
    );

    return {
        trackSharePastWork,
        trackClickPastWork,
        trackViewPastWork
    };
}
