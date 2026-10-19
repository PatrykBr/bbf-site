"use client";

import posthog from "posthog-js";
import type {
    SharePastWorkEvent,
    ClickPastWorkEvent,
    ViewPastWorkEvent,
    ShareMethod,
    WorkCategory,
    ViewSource
} from "./types";

function capture(eventName: string, event: Record<string, unknown>) {
    if (
        !process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
        (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_POSTHOG_ENABLE_LOCAL !== "true")
    )
        return;
    try {
        posthog.capture(eventName, event);
    } catch {
        // Optional telemetry must not interrupt browsing or sharing.
    }
}

export function trackSharePastWork(workId: string, category: WorkCategory, shareMethod: ShareMethod) {
    capture("share_past_work", {
        work_id: workId,
        category,
        share_method: shareMethod,
        timestamp: new Date().toISOString()
    } satisfies SharePastWorkEvent);
}

export function trackClickPastWork(workId: string, category: WorkCategory) {
    capture("click_past_work", {
        work_id: workId,
        category,
        timestamp: new Date().toISOString()
    } satisfies ClickPastWorkEvent);
}

export function trackViewPastWork(workId: string, category: WorkCategory, viewSource: ViewSource) {
    capture("view_past_work", {
        work_id: workId,
        category,
        view_source: viewSource,
        timestamp: new Date().toISOString()
    } satisfies ViewPastWorkEvent);
}
