import type { MetadataRoute } from "next";
import { getAllPastWork } from "@/lib/data/past-work";
import { services } from "@/lib/data/services";
import { getSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
    const allWork = getAllPastWork();

    const workPages = allWork.map(item => ({
        url: getSiteUrl(`/work/${item.slug}`),
        images: item.images.map(img => getSiteUrl(img.url))
    }));

    return [
        { url: getSiteUrl() },
        { url: getSiteUrl("/work") },
        ...Object.values(services).map(service => ({ url: getSiteUrl(service.path) })),
        ...workPages
    ];
}
