export type ImageOrientation = "landscape" | "portrait" | "square";

export interface WorkImage {
    url: string;
    alt: string;
    orientation?: ImageOrientation; // Defaults to "landscape".
}

export type WorkCategory = "wardrobe" | "kitchen";

export interface PastWorkItem {
    id: string;
    name: string;
    category: WorkCategory;
    isFeatured: boolean;
    description: string;
    details: { label: string; value: string }[];
    images: [WorkImage, ...WorkImage[]];
    createdAt: string; // ISO 8601 date.
    slug: string;
}

export interface ContactInfo {
    phone: string;
    email: string;
    facebook: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

export type WorkFilter = "all" | WorkCategory;

export type ShareMethod = "facebook" | "whatsapp" | "copy";

export type ViewSource = "click" | "navigation" | "gallery";

export interface ContactApiResponse {
    success: boolean;
    message: string;
    error?: string;
    fieldErrors?: Record<string, string>;
}
