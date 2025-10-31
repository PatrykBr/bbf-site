export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export const validateContactForm = (formData: ContactFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
        errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
        errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
        errors.email = "Email is invalid";
    }

    if (!formData.message.trim()) {
        errors.message = "Message is required";
    }

    return errors;
};
