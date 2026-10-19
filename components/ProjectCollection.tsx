import { Breadcrumbs } from "./Breadcrumbs";
import { ContactAction } from "./ContactAction";
import { ProjectList } from "./ProjectList";
import { ProjectNavigation } from "./ProjectNavigation";
import { ServiceInformation } from "./ServiceInformation";
import { getAllPastWork } from "@/lib/data/past-work";
import { services } from "@/lib/data/services";
import type { WorkFilter } from "@/lib/types";

export function ProjectCollection({ current }: { current: WorkFilter }) {
    const allProjects = getAllPastWork();
    const items = current === "all" ? allProjects : allProjects.filter(item => item.category === current);
    const service = current === "all" ? undefined : services[current];
    const counts = {
        all: allProjects.length,
        kitchen: allProjects.filter(item => item.category === "kitchen").length,
        wardrobe: allProjects.filter(item => item.category === "wardrobe").length
    };
    const title = service?.name ?? "All projects";

    return (
        <section
            id="project-collection"
            aria-labelledby="collection-title"
            className="bg-brand-light px-4 pt-24 pb-8 sm:px-8 sm:pt-28 lg:px-16"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mb-3">
                    <Breadcrumbs
                        tone="light"
                        items={
                            service
                                ? [
                                      { name: "Home", href: "/" },
                                      { name: "All projects", href: "/work" },
                                      { name: service.name, href: service.path }
                                  ]
                                : [
                                      { name: "Home", href: "/" },
                                      { name: "All projects", href: "/work" }
                                  ]
                        }
                    />
                </div>
                <div className="mb-4 flex items-center justify-between gap-4 text-white">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h1 id="collection-title" className="text-2xl leading-tight font-semibold sm:text-3xl">
                            {title}
                        </h1>
                        {current === "all" && <p className="text-sm text-white">The complete collection</p>}
                    </div>
                    {service && (
                        <ServiceInformation
                            name={service.name}
                            introduction={service.introduction}
                            sections={service.sections}
                        />
                    )}
                </div>
                <ProjectNavigation current={current} counts={counts} />
                <h2 className="sr-only">Completed projects</h2>
                <ProjectList key={current} items={items} />
                <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/20 pt-6 text-white sm:flex-row sm:items-center">
                    <p className="text-sm">Have a project in mind?</p>
                    <ContactAction className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-white">
                        Ask for a free quote
                    </ContactAction>
                </div>
            </div>
        </section>
    );
}
