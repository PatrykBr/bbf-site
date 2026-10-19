import type { ShareMethod, ImageOrientation } from "./types.ts";
import { getSiteUrl } from "./site-config.ts";

// Keep links on the current site and record which share option brought the visit.
export function getShareUrl(itemSlug: string, shareMethod: ShareMethod, origin?: string): string {
    const pathname = `/work/${itemSlug}`;
    const itemUrl = origin ? new URL(pathname, origin).href : getSiteUrl(pathname);
    const utmParams = new URLSearchParams({
        utm_source: shareMethod,
        utm_medium: "social",
        utm_campaign: "past_work_share"
    });

    return `${itemUrl}?${utmParams.toString()}`;
}

export function getFacebookShareUrl(itemSlug: string, origin?: string): string {
    const shareUrl = getShareUrl(itemSlug, "facebook", origin);
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

export function getWhatsAppShareUrl(itemSlug: string, itemName: string, origin?: string): string {
    const shareUrl = getShareUrl(itemSlug, "whatsapp", origin);
    const message = `${itemName} by Bespoke Broncel Furniture. ${shareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Escape < so JSON-LD cannot close its script tag.
 */
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function getAspectRatioClass(orientation: ImageOrientation = "landscape"): string {
    switch (orientation) {
        case "portrait":
            return "aspect-3/4";
        case "square":
            return "aspect-square";
        case "landscape":
        default:
            return "aspect-4/3";
    }
}

// Use UTC so a visitor's time zone cannot change the displayed completion date.
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
