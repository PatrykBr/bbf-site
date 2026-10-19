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

export interface SharePastWorkEvent {
    work_id: string;
    category: WorkCategory;
    share_method: ShareMethod;
    timestamp: string;
}

export interface ClickPastWorkEvent {
    work_id: string;
    category: WorkCategory;
    timestamp: string;
}

export type ViewSource = "click" | "navigation" | "gallery";

export interface ViewPastWorkEvent {
    work_id: string;
    category: WorkCategory;
    view_source: ViewSource;
    timestamp: string;
}

export interface ContactApiResponse {
    success: boolean;
    message: string;
    error?: string;
    fieldErrors?: Record<string, string>;
}
