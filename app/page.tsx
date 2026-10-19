import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { WorkGrid } from "@/components/WorkGrid";
import { getAllPastWork } from "@/lib/data/past-work";
import { companyInfo } from "@/lib/data/contact";
import { createPageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-config";
import { serializeJsonLd } from "@/lib/utils";

export const metadata = createPageMetadata({
    title: "Kitchens and wardrobes in South Yorkshire",
    description:
        "We make fitted kitchens and wardrobes in South Yorkshire, with 25 years of carpentry experience. Contact us for a free quote.",
    path: ""
});

export default function Home() {
    const pastWork = getAllPastWork();

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": getSiteUrl("/#website"),
        name: companyInfo.name,
        url: getSiteUrl()
    };

    return (
        <>
            <script type="application/ld+json">{serializeJsonLd(websiteSchema)}</script>
            <Hero />
            <WorkGrid items={pastWork} />
            <ContactSection />
            <AboutSection />
        </>
    );
}
