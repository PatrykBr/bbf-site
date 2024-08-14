import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bespoke Broncel Furniture",
  description: "Bespoke made furniture made on demand. Get a free quote now!",
  other: {
    "theme-color": "#0e370d",
    "color-scheme": "dark only",
    "og:url": "https://broncelfurniture.com",
    "og:type": "website",
    "og:title": "Bespoke Broncel Furniture",
    "og:description":
      "Bespoke made furniture made on demand. Get a free quote now!",
    "og:image": "https://i.ibb.co/2M0ZGqZ/icon.jpg",

    "twitter:card": "summary_large_image",
    "twitter:domain": "broncelfurniture.com",
    "twitter:url": "https://broncelfurniture.com",
    "twitter:title": "Bespoke Broncel Furniture",
    "twitter:description":
      "Bespoke made furniture made on demand. Get a free quote now!",
    "twitter:image": "https://i.ibb.co/2M0ZGqZ/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bff_light_green font-poppins">
        {children}
      </body>
    </html>
  );
}
