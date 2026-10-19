import type { ContactFormData } from "./types.ts";

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validateContactForm(data: ContactFormData): {
    isValid: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};
    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone?.trim() || "";
    const message = data.message.trim();

    if (!name) {
        errors.name = "Enter your name";
    } else if (/[\r\n\u0000]/.test(data.name)) {
        errors.name = "Enter your name on one line";
    } else if (name.length < 2) {
        errors.name = "Your name must have at least 2 characters";
    } else if (name.length > 80) {
        errors.name = "Name must be 80 characters or fewer";
    }

    if (!email) {
        errors.email = "Enter your email address";
    } else if (email.length > 254) {
        errors.email = "Email must be 254 characters or fewer";
    } else if (/[\r\n\u0000]/.test(data.email) || !isValidEmail(email)) {
        errors.email = "Enter a valid email address";
    }

    if (phone) {
        if (phone.length > 30) {
            errors.phone = "Phone number must be 30 characters or fewer";
        } else if (!/^[0-9+()\-\s]+$/.test(phone)) {
            errors.phone = "Enter a valid phone number";
        }
    }

    if (!message) {
        errors.message = "Enter a message";
    } else if (message.length < 10) {
        errors.message = "Your message must have at least 10 characters";
    } else if (message.length > 5000) {
        errors.message = "Message must be 5000 characters or fewer";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
