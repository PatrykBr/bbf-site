import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PostHogProvider } from "@/components/PostHogProvider";

const poppins = Poppins({
    variable: "--font-poppins",
    weight: ["300", "500", "600", "700"],
    subsets: ["latin"],
    display: "swap",
    preload: true,
    fallback: ["system-ui", "arial"]
});

export const metadata: Metadata = {
    metadataBase: new URL("https://www.broncelfurniture.com"),
    title: {
        default: "Bespoke Broncel Furniture | Custom Furniture in South Yorkshire",
        template: "%s | Bespoke Broncel Furniture"
    },
    description:
        "Expert custom furniture makers serving South Yorkshire and surrounding areas. Specializing in bespoke kitchens, wardrobes, and custom furniture. Get a free quote today!",
    keywords: [
        "bespoke furniture",
        "custom furniture",
        "handmade furniture",
        "custom kitchens",
        "built-in wardrobes",
        "South Yorkshire furniture",
        "Sheffield furniture maker",
        "Rotherham furniture maker",
        "Doncaster furniture maker",
        "Barnsley furniture maker",
        "Yorkshire furniture maker",
        "bespoke broncel furniture",
        "broncel furniture gallery",
        "custom wardrobes yorkshire",
        "bespoke kitchens sheffield"
    ],
    authors: [{ name: "Broncel Furniture" }],
    creator: "Broncel Furniture",
    publisher: "Broncel Furniture",
    formatDetection: {
        email: false,
        address: false,
        telephone: false
    },
    alternates: {
        canonical: "https://www.broncelfurniture.com"
    },
    // Next.js 16 manifest support
    manifest: "/manifest.json",
    // PWA icons
    icons: {
        icon: "/icon.tsx",
        apple: "/apple-icon.png"
    },
    openGraph: {
        title: "Bespoke Broncel Furniture | Custom Furniture in South Yorkshire",
        description:
            "Expert custom furniture makers serving South Yorkshire and surrounding areas. Specializing in bespoke kitchens, wardrobes, and custom furniture. Get a free quote today!",
        url: "https://www.broncelfurniture.com/",
        siteName: "Bespoke Broncel Furniture",
        images: [
            {
                url: "https://www.broncelfurniture.com/hero-background.webp",
                width: 1920,
                height: 1080,
                alt: "Bespoke Broncel Furniture - Custom Furniture in South Yorkshire"
            }
        ],
        locale: "en_GB",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Bespoke Broncel Furniture | Custom Furniture in South Yorkshire",
        description:
            "Expert custom furniture makers serving South Yorkshire and surrounding areas. Specializing in bespoke kitchens, wardrobes, and custom furniture. Get a free quote today!",
        images: ["https://www.broncelfurniture.com/hero-background.webp"]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    },
    verification: {
        google: "your-google-verification-code-here" // Add your Google Search Console verification
    },
    category: "Home and Construction Business"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        name: "Bespoke Broncel Furniture",
        image: "https://www.broncelfurniture.com/logo.webp",
        "@id": "https://www.broncelfurniture.com",
        url: "https://www.broncelfurniture.com",
        telephone: "+447523706742",
        email: "broncelfurniture@gmail.com",
        address: {
            "@type": "PostalAddress",
            addressRegion: "South Yorkshire",
            addressCountry: "GB"
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: 53.3811,
            longitude: -1.4701
        },
        description:
            "Expert custom furniture makers serving South Yorkshire and surrounding areas. Specializing in bespoke kitchens, wardrobes, and custom furniture.",
        areaServed: [
            { "@type": "City", name: "Sheffield" },
            { "@type": "City", name: "Rotherham" },
            { "@type": "City", name: "Doncaster" },
            { "@type": "City", name: "Barnsley" },
            { "@type": "AdministrativeArea", name: "South Yorkshire" },
            { "@type": "AdministrativeArea", name: "Yorkshire and the Humber" }
        ],
        priceRange: "££",
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "17:00"
        },
        sameAs: ["https://www.facebook.com/broncelfurniture"],
        makesOffer: [
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Custom Kitchen Design and Installation",
                    areaServed: "South Yorkshire and surrounding areas"
                }
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Built-in Wardrobe Design and Installation",
                    areaServed: "South Yorkshire and surrounding areas"
                }
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Bespoke Furniture Manufacturing",
                    areaServed: "South Yorkshire and surrounding areas"
                }
            }
        ]
    };

    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(organizationSchema)
                    }}
                />
            </head>
            <body className={`${poppins.variable} antialiased`}>
                <PostHogProvider>
                    <Header />
                    {children}
                    <Footer />
                </PostHogProvider>
            </body>
        </html>
    );
}
