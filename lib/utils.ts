import { ShareMethod } from "./types";

/**
 * Generate UTM-tagged share URLs
 */
export function getShareUrl(itemSlug: string, shareMethod: ShareMethod): string {
    const baseUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || "https://broncelfurniture.co.uk";

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
export function validateContactForm(data: { name: string; email: string; message: string }): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
        errors.name = "Name is required";
    } else if (data.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
    }

    if (!data.email.trim()) {
        errors.email = "Email is required";
    } else if (!isValidEmail(data.email)) {
        errors.email = "Please enter a valid email address";
    }

    if (!data.message.trim()) {
        errors.message = "Message is required";
    } else if (data.message.trim().length < 10) {
        errors.message = "Message must be at least 10 characters";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    // Already formatted or return as-is
    if (phone.includes(" ")) return phone;

    // Format UK mobile: +447523706742 -> +44 7523 706742
    if (phone.startsWith("+44")) {
        const digits = phone.slice(3);
        return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return phone;
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

/**
 * Slugify text
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

/**
 * Class name utility for conditional classes
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
    return classes.filter(Boolean).join(" ");
}
