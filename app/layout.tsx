import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap"
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://broncelfurniture.com"),
    title: {
        default: "Bespoke Broncel Furniture | Building Your Dream",
        template: "%s | Bespoke Broncel Furniture"
    },
    description:
        "Building your dream furniture in South Yorkshire. Custom-made wardrobes and kitchens crafted with exceptional craftsmanship and attention to detail.",
    keywords: [
        "bespoke furniture",
        "custom wardrobes",
        "fitted kitchens",
        "South Yorkshire",
        "handmade furniture",
        "Broncel Furniture"
    ],
    authors: [{ name: "Bespoke Broncel Furniture" }],
    openGraph: {
        type: "website",
        locale: "en_GB",
        siteName: "Bespoke Broncel Furniture",
        title: "Bespoke Broncel Furniture | Building Your Dream",
        description: "Custom-made wardrobes and kitchens crafted with exceptional craftsmanship.",
        images: [
            {
                url: "/hero-bg.webp",
                width: 1200,
                height: 630,
                alt: "Bespoke Broncel Furniture"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Bespoke Broncel Furniture",
        description: "Custom-made wardrobes and kitchens crafted with exceptional craftsmanship.",
        images: ["/hero-bg.webp"]
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
                <PostHogProvider>{children}</PostHogProvider>
            </body>
        </html>
    );
}
