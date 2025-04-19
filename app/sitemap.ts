import { imageData } from "../data/images";

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://bespokebroncelfurniture.com";

  // Create image sitemap entries
  const imageEntries = imageData.map((image) => ({
    url: `${baseUrl}/work?image=${image.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
    // Add image-specific sitemap tags
    images: [
      {
        loc: image.src,
        title: image.name,
        caption: `${image.name} - ${image.category} custom furniture by Bespoke Broncel Furniture`,
        geo_location: "United Kingdom",
        license: "https://bespokebroncelfurniture.com/image-license",
      },
    ],
  }));

  // Main pages
  const routes = ["", "/work", "/about", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  }));

  return [...routes, ...imageEntries];
}
