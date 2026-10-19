import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

import { MotionProvider } from "@/components/MotionProvider";
import { SITE_URL, getSiteUrl } from "@/lib/site-config";
import "./globals.css";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap"
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Fitted kitchens and wardrobes in South Yorkshire | Broncel Furniture",
        template: "%s | Bespoke Broncel Furniture"
    },
    description:
        "Fitted kitchens and wardrobes in South Yorkshire, made with 25 years of carpentry experience. View our work and ask for a free quote.",
    keywords: [
        "bespoke furniture",
        "custom wardrobes",
        "fitted kitchens",
        "South Yorkshire",
        "handmade furniture",
        "Broncel Furniture"
    ],
    alternates: {
        canonical: SITE_URL
    },
    authors: [{ name: "Bespoke Broncel Furniture" }],
    openGraph: {
        type: "website",
        locale: "en_GB",
        siteName: "Bespoke Broncel Furniture",
        title: "Fitted kitchens and wardrobes in South Yorkshire | Broncel Furniture",
        description:
            "We make fitted kitchens and wardrobes in South Yorkshire, with 25 years of carpentry experience. See our completed projects.",
        images: [
            {
                url: getSiteUrl("/hero-bg.webp"),
                width: 1200,
                height: 630,
                alt: "Bespoke Broncel Furniture"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Bespoke Broncel Furniture",
        description:
            "We make fitted kitchens and wardrobes in South Yorkshire, with 25 years of carpentry experience. See our completed projects.",
        images: [getSiteUrl("/hero-bg.webp")]
    },
    robots: {
        index: true,
        follow: true
    }
};

// Match the mobile browser toolbar to the page background.
export const viewport: Viewport = {
    themeColor: "#0e370d"
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body className={`${poppins.variable} font-sans antialiased`}>
                <MotionProvider>{children}</MotionProvider>
            </body>
        </html>
    );
}
