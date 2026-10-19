import { ProjectCollection } from "@/components/ProjectCollection";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
    title: "Kitchen and wardrobe projects",
    description:
        "Browse our completed fitted kitchens, wardrobes and dressing rooms. Compare cabinet styles, storage layouts and finishes, then ask about your own project.",
    path: "/work"
});

export default function WorkPage() {
    return <ProjectCollection current="all" />;
}
