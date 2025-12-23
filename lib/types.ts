/**
 * Core type definitions for Bespoke Broncel Furniture
 */

// Work item image orientation for masonry layout
export type ImageOrientation = "landscape" | "portrait" | "square";

// Work item image
export interface WorkImage {
    url: string;
    alt: string;
    orientation?: ImageOrientation; // defaults to "landscape" if not specified
}

// Work item category
export type WorkCategory = "wardrobe" | "kitchen";

// Past work item schema
export interface PastWorkItem {
    id: string;
    name: string;
    category: WorkCategory;
    isFeatured: boolean;
    description: string;
    images: WorkImage[];
    createdAt: string; // ISO date string
    slug: string;
}

// Contact information format
export interface ContactInfo {
    phone: string;
    whatsapp: string;
    email: string;
    facebook: string;
}

// Contact form data
export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

// Contact form validation errors
export interface ContactFormErrors {
    name?: string;
    email?: string;
    message?: string;
}

// Filter types for work gallery
export type WorkFilter = "all" | "wardrobe" | "kitchen";

// Share method types
export type ShareMethod = "facebook" | "whatsapp" | "copy";

// PostHog event payloads
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

// API response types
export interface ContactApiResponse {
    success: boolean;
    message: string;
    error?: string;
}

// Pagination state
export interface PaginationState {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
}
