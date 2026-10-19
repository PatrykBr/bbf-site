"use client";

import posthog from "posthog-js";
import type { ShareMethod, WorkCategory, ViewSource } from "./types";

export const analyticsEnabled = Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() &&
    (process.env.NODE_ENV !== "development" || process.env.NEXT_PUBLIC_POSTHOG_ENABLE_LOCAL === "true")
);

function capture(eventName: string, event: Record<string, unknown>) {
    if (!analyticsEnabled) return;
    try {
        posthog.capture(eventName, event);
    } catch {
        // Optional telemetry must not interrupt browsing or sharing.
    }
}

export function captureException(error: unknown) {
    if (!analyticsEnabled) return;
    try {
        posthog.captureException(error);
    } catch {
        // Error reporting must not prevent the error page from rendering.
    }
}

export function trackSharePastWork(workId: string, category: WorkCategory, shareMethod: ShareMethod) {
    capture("share_past_work", {
        work_id: workId,
        category,
        share_method: shareMethod,
        timestamp: new Date().toISOString()
    });
}

export function trackClickPastWork(workId: string, category: WorkCategory) {
    capture("click_past_work", {
        work_id: workId,
        category,
        timestamp: new Date().toISOString()
    });
}

export function trackViewPastWork(workId: string, category: WorkCategory, viewSource: ViewSource) {
    capture("view_past_work", {
        work_id: workId,
        category,
        view_source: viewSource,
        timestamp: new Date().toISOString()
    });
}

export type ContactMethod = "enquiry" | "phone" | "whatsapp" | "email" | "facebook";

export function trackContactClick(method: ContactMethod, projectSlug?: string) {
    capture("contact_click", { method, ...(projectSlug && { project_slug: projectSlug }) });
}

export function trackEnquiryResult(result: "success" | "error", projectSlug?: string) {
    capture("enquiry_result", { result, ...(projectSlug && { project_slug: projectSlug }) });
}
