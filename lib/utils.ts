import { ShareMethod, ImageOrientation } from "./types";
import { getSiteUrl } from "./site-config";

/**
 * Generate UTM-tagged share URLs
 */
export function getShareUrl(itemSlug: string, shareMethod: ShareMethod): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : getSiteUrl();

    const itemUrl = `${baseUrl}/work/${itemSlug}`;
    const utmParams = new URLSearchParams({
        utm_source: shareMethod,
        utm_medium: "social",
        utm_campaign: "past_work_share"
    });

    return `${itemUrl}?${utmParams.toString()}`;
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(itemSlug: string): string {
    const shareUrl = getShareUrl(itemSlug, "facebook");
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(itemSlug: string, itemName: string): string {
    const shareUrl = getShareUrl(itemSlug, "whatsapp");
    const message = `Check out this ${itemName} by Bespoke Broncel Furniture: ${shareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Open a third-party URL safely in a new tab
 */
export function openExternalUrl(url: string): void {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (newWindow) {
        newWindow.opener = null;
    }
}

/**
 * Copy link to clipboard
 */
export async function copyToClipboard(itemSlug: string): Promise<boolean> {
    try {
        const shareUrl = getShareUrl(itemSlug, "copy");
        await navigator.clipboard.writeText(shareUrl);
        return true;
    } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        return false;
    }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate contact form
 */
export function validateContactForm(data: { name: string; email: string; phone?: string; message: string }): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};
    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone?.trim() || "";
    const message = data.message.trim();

    if (!name) {
        errors.name = "Name is required";
    } else if (name.length < 2) {
        errors.name = "Name must be at least 2 characters";
    } else if (name.length > 80) {
        errors.name = "Name must be 80 characters or fewer";
    }

    if (!email) {
        errors.email = "Email is required";
    } else if (email.length > 254) {
        errors.email = "Email must be 254 characters or fewer";
    } else if (!isValidEmail(email)) {
        errors.email = "Please enter a valid email address";
    }

    if (phone) {
        if (phone.length > 30) {
            errors.phone = "Phone number must be 30 characters or fewer";
        } else if (!/^[0-9+()\-\s]+$/.test(phone)) {
            errors.phone = "Please enter a valid phone number";
        }
    }

    if (!message) {
        errors.message = "Message is required";
    } else if (message.length < 10) {
        errors.message = "Message must be at least 10 characters";
    } else if (message.length > 5000) {
        errors.message = "Message must be 5000 characters or fewer";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
/**
 * Get aspect ratio class based on image orientation
 */
export function getAspectRatioClass(orientation: ImageOrientation = "landscape"): string {
    switch (orientation) {
        case "portrait":
            return "aspect-[3/4]";
        case "square":
            return "aspect-square";
        case "landscape":
        default:
            return "aspect-[4/3]";
    }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
