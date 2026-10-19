export function getEnquiryHref(projectSlug?: string): string {
    return projectSlug ? `/?project=${encodeURIComponent(projectSlug)}#contact` : "/#contact";
}
