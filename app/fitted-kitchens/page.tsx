import { ServicePage } from "@/components/ServicePage";
import { services } from "@/lib/data/services";
import { createPageMetadata } from "@/lib/seo";

const service = services.kitchen;

export const metadata = createPageMetadata({
    title: service.heading,
    description: service.description,
    path: service.path,
    image: service.image
});

export default function KitchensPage() {
    return <ServicePage category="kitchen" />;
}
