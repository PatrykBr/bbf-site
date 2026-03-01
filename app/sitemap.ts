import type { MetadataRoute } from "next";
import { getAllPastWork } from "@/lib/data/past-work";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
    const allWork = getAllPastWork();

    const workPages = allWork.map(item => ({
        url: `${SITE_URL}/work/${item.slug}`,
        lastModified: new Date(item.createdAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        images: item.images.map(img => `${SITE_URL}${img.url}`)
    }));

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 1.0
        },
        ...workPages
    ];
}
