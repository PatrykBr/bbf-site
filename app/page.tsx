import { Suspense } from "react";
import { Metadata } from "next";
import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import Work from "@/components/Work";
import About from "@/components/About";

export const metadata: Metadata = {
    title: "Bespoke Broncel Furniture | Custom Kitchens & Wardrobes Yorkshire",
    description:
        "South Yorkshire's premier custom furniture makers. Handcrafted bespoke kitchens, fitted wardrobes & unique furniture pieces. 25 years experience. Free quotes. Serving Sheffield, Rotherham, Doncaster & Barnsley.",
    alternates: {
        canonical: "https://www.broncelfurniture.com"
    },
    openGraph: {
        title: "Bespoke Broncel Furniture | Custom Kitchens & Wardrobes Yorkshire",
        description:
            "South Yorkshire's premier custom furniture makers. Handcrafted bespoke kitchens, fitted wardrobes & unique furniture pieces. 25 years experience.",
        url: "https://www.broncelfurniture.com",
        type: "website",
        images: [
            {
                url: "https://www.broncelfurniture.com/hero-background.webp",
                width: 1920,
                height: 1080,
                alt: "Bespoke furniture craftsmanship by Broncel Furniture Yorkshire"
            }
        ]
    }
};

export default function Home() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.broncelfurniture.com"
            }
        ]
    };
    return (
        <div className="min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <Hero />
            <Suspense fallback={<WorkFallback />}>
                <Work />
            </Suspense>
            <About />
            <Contact />
        </div>
    );
}

function WorkFallback() {
    return (
        <section id="work" className="bg-secondary py-16">
            <div className="container mx-auto px-4">
                <h2 className="mb-12 text-center text-4xl font-bold text-white">Our Work</h2>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-pulse text-center">
                        <div className="text-2xl text-white">Loading gallery...</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
