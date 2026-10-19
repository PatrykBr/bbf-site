import type { Metadata } from "next";
import { businessHours, companyInfo, contactInfo } from "./data/contact";
import { getSiteUrl } from "./site-config";

export const BUSINESS_ID = getSiteUrl("/#business");

export function createPageMetadata({
    title,
    description,
    path,
    image = { url: "/hero-bg.webp", alt: "Fitted furniture by Bespoke Broncel Furniture" },
    type = "website"
}: {
    title: string;
    description: string;
    path: string;
    image?: { url: string; alt: string };
    type?: "website" | "article";
}): Metadata {
    const pageTitle = `${title} | Broncel Furniture`;
    const url = getSiteUrl(path);
    const pageImage = { url: getSiteUrl(image.url), alt: image.alt };

    return {
        title: { absolute: pageTitle },
        description,
        alternates: { canonical: url },
        openGraph: {
            title: pageTitle,
            description,
            type,
            url,
            siteName: companyInfo.name,
            locale: "en_GB",
            images: [pageImage]
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description,
            images: [pageImage]
        }
    };
}

export const businessSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": BUSINESS_ID,
    name: companyInfo.name,
    description: companyInfo.description,
    telephone: contactInfo.phone.replace(/\s/g, ""),
    email: contactInfo.email,
    url: getSiteUrl(),
    logo: getSiteUrl("/logo.webp"),
    image: getSiteUrl("/hero-bg.webp"),
    sameAs: [contactInfo.facebook],
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer enquiries",
        telephone: contactInfo.phone.replace(/\s/g, ""),
        email: contactInfo.email,
        hoursAvailable: businessHours.schema
    },
    areaServed: { "@type": "AdministrativeArea", name: "South Yorkshire, England" }
};
