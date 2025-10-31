import { imageData } from "@/data/images";
import { processImages } from "@/utils/imageUtils";

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.broncelfurniture.com";
    const processedImages = processImages(imageData);

    const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${processedImages
    .map(
        image => `  <url>
    <loc>${baseUrl}/work?image=${image.slug}</loc>
    <image:image>
      <image:loc>${baseUrl}${image.src}</image:loc>
      <image:caption>${
          image.description || `${image.name} - ${image.category} custom furniture by Bespoke Broncel Furniture`
      }</image:caption>
      <image:title>${image.name}</image:title>
      <image:geo_location>South Yorkshire, United Kingdom</image:geo_location>
      <image:license>${baseUrl}/terms</image:license>
    </image:image>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

    return new Response(imageSitemap, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600"
        }
    });
}
