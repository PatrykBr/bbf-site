import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PostHogProvider } from "@/components/PostHogProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.broncelfurniture.com"),
  title: "Bespoke Broncel Furniture | Custom Furniture in South Yorkshire",
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
  ],
  authors: [{ name: "Broncel Furniture" }],
  creator: "Broncel Furniture",
  publisher: "Broncel Furniture",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Bespoke Broncel Furniture | Custom Furniture in South Yorkshire",
    description:
      "Expert custom furniture makers serving South Yorkshire and surrounding areas. Specializing in bespoke kitchens, wardrobes, and custom furniture. Get a free quote today!",
    url: "https://www.broncelfurniture.com/",
    siteName: "Bespoke Broncel Furniture",
    images: [
      {
        url: "https://i.ibb.co/2M0ZGqZ/icon.jpg",
        width: 1200,
        height: 630,
        alt: "Bespoke Broncel Furniture - Custom Furniture in South Yorkshire",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bespoke Broncel Furniture | Custom Furniture in South Yorkshire",
    description:
      "Expert custom furniture makers serving South Yorkshire and surrounding areas. Specializing in bespoke kitchens, wardrobes, and custom furniture. Get a free quote today!",
    images: ["https://i.ibb.co/2M0ZGqZ/icon.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
  },
  other: {
    "json-ld": [
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        name: "Bespoke Broncel Furniture",
        image: "https://i.ibb.co/2M0ZGqZ/icon.jpg",
        "@id": "https://www.broncelfurniture.com",
        url: "https://www.broncelfurniture.com",
        telephone: "+44 7523 706742",
        description:
          "Expert custom furniture makers serving South Yorkshire and surrounding areas. Specializing in bespoke kitchens, wardrobes, and custom furniture.",
        areaServed: [
          { "@type": "City", name: "Sheffield" },
          { "@type": "City", name: "Rotherham" },
          { "@type": "City", name: "Doncaster" },
          { "@type": "City", name: "Barnsley" },
          { "@type": "AdministrativeArea", name: "South Yorkshire" },
          { "@type": "AdministrativeArea", name: "Yorkshire and the Humber" },
        ],
        priceRange: "££",
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "17:00",
        },
        sameAs: ["https://www.facebook.com/broncelfurniture"],
        makesOffer: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Kitchen Design and Installation",
              areaServed: "South Yorkshire and surrounding areas",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Built-in Wardrobe Design and Installation",
              areaServed: "South Yorkshire and surrounding areas",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Bespoke Furniture Manufacturing",
              areaServed: "South Yorkshire and surrounding areas",
            },
          },
        ],
      }),
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
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
