import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site-config";
import { businessSchema } from "@/lib/seo";
import { serializeJsonLd } from "@/lib/utils";
import "./globals.css";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap"
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Kitchens and wardrobes in South Yorkshire | Broncel Furniture",
        template: "%s | Broncel Furniture"
    },
    description:
        "Fitted kitchens and wardrobes in South Yorkshire, made with 25 years of carpentry experience. View our work and ask for a free quote.",
    authors: [{ name: "Bespoke Broncel Furniture" }],
    robots: {
        index: true,
        follow: true
    }
};

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
                <script type="application/ld+json">{serializeJsonLd(businessSchema)}</script>
                <a
                    href="#main-content"
                    className="text-brand-dark fixed top-2 left-2 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-3 focus:translate-y-0"
                >
                    Skip to content
                </a>
                <Header />
                <main id="main-content" tabIndex={-1}>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
