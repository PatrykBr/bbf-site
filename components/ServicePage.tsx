import { ProjectCollection } from "./ProjectCollection";
import { services } from "@/lib/data/services";
import { BUSINESS_ID } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-config";
import type { WorkCategory } from "@/lib/types";
import { serializeJsonLd } from "@/lib/utils";

export function ServicePage({ category }: { category: WorkCategory }) {
    const service = services[category];
    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": getSiteUrl(`${service.path}#service`),
        name: service.heading,
        serviceType: service.name,
        description: service.description,
        url: getSiteUrl(service.path),
        image: getSiteUrl(service.image.url),
        provider: { "@id": BUSINESS_ID },
        areaServed: { "@type": "AdministrativeArea", name: "South Yorkshire, England" }
    };

    return (
        <>
            <script type="application/ld+json">{serializeJsonLd(schema)}</script>
            <ProjectCollection current={category} />
        </>
    );
}
