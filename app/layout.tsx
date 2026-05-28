import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { PostHogProvider } from "@/lib/posthog";
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
        default: "Bespoke Fitted Kitchens & Wardrobes in South Yorkshire | Broncel Furniture",
        template: "%s | Bespoke Broncel Furniture"
    },
    description:
        "Custom-made fitted kitchens and wardrobes in South Yorkshire. 25 years of carpentry experience. View our portfolio and get a free quote.",
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
        title: "Bespoke Fitted Kitchens & Wardrobes in South Yorkshire | Broncel Furniture",
        description:
            "Custom-made fitted kitchens and wardrobes in South Yorkshire. 25 years of experience. View our portfolio.",
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
            "Custom-made fitted kitchens and wardrobes in South Yorkshire. 25 years of experience. View our portfolio.",
        images: [getSiteUrl("/hero-bg.webp")]
    },
    robots: {
        index: true,
        follow: true
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} font-sans antialiased`}>
                <MotionProvider>
                    <PostHogProvider>{children}</PostHogProvider>
                </MotionProvider>
            </body>
        </html>
    );
}
