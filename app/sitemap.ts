import { imageData } from "../data/images";
import { processImages } from "../utils/imageUtils";

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://bespokebroncelfurniture.com";

  // Process images to generate slugs
  const processedImages = processImages(imageData);

  // Create image sitemap entries
  const imageEntries = processedImages.map((image) => ({
    url: `${baseUrl}/work?image=${image.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
    // Add image-specific sitemap tags
    images: [
      {
        loc: `${baseUrl}${image.src}`,
        title: `${image.name} | Bespoke Broncel Furniture`,
        caption:
          image.description ||
          `${image.name} - ${image.category} custom furniture by Bespoke Broncel Furniture`,
        geo_location: "Yorkshire, United Kingdom",
        license: "https://bespokebroncelfurniture.com/image-license",
      },
    ],
  }));

  // Main pages
  const routes = ["", "/work", "/about", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  }));

  return [...routes, ...imageEntries];
}
