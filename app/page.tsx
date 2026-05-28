import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { WorkGrid } from "@/components/WorkGrid";
import { getAllPastWork } from "@/lib/data/past-work";
import { getSiteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
    title: "Bespoke Broncel Furniture | Custom Kitchens & Wardrobes | South Yorkshire",
    description:
        "Custom-made fitted kitchens and wardrobes in South Yorkshire. 25 years of carpentry experience. Contact us for a free quote.",
    alternates: {
        canonical: getSiteUrl()
    },
    openGraph: {
        title: "Bespoke Broncel Furniture | Custom Kitchens & Wardrobes",
        description:
            "Custom-made fitted kitchens and wardrobes in South Yorkshire. 25 years of carpentry experience.",
        type: "website",
        url: getSiteUrl(),
        images: [{ url: getSiteUrl("/hero-bg.webp") }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Bespoke Broncel Furniture | Custom Kitchens & Wardrobes",
        description:
            "Custom-made fitted kitchens and wardrobes in South Yorkshire. 25 years of carpentry experience.",
        images: [getSiteUrl("/hero-bg.webp")]
    }
};

export default function Home() {
    const pastWork = getAllPastWork(true);

    const localBusinessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Bespoke Broncel Furniture",
        description: "Custom-made fitted kitchens and wardrobes in South Yorkshire. 25 years of carpentry experience.",
        telephone: "+447523706742",
        email: "broncelfurniture@gmail.com",
        address: {
            "@type": "PostalAddress",
            addressRegion: "South Yorkshire",
            addressCountry: "GB"
        },
        url: getSiteUrl(),
        image: getSiteUrl("/hero-bg.webp"),
        sameAs: ["https://www.facebook.com/BespokeBroncelFurniture"],
        priceRange: "££",
        openingHours: "Mo-Fr 09:00-17:00",
        areaServed: {
            "@type": "Place",
            name: "South Yorkshire, England"
        }
    };

    return (
        <>
            <Header />
            <main>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
                />
                <Hero />
                <WorkGrid items={pastWork} />
                <AboutSection />
                <ContactSection />
            </main>
            <Footer />
        </>
    );
}
