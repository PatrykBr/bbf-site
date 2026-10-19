import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, serializeJsonLd } from "@/lib/utils";
import { getPastWorkBySlug, getAllPastWorkSlugs, getAllPastWork } from "@/lib/data/past-work";
import { getSiteUrl } from "@/lib/site-config";
import { ShareButtons } from "@/components/ShareButtons";
import { ProjectGallery } from "./ProjectGallery";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageIntro } from "@/components/PageIntro";
import { ContactAction } from "@/components/ContactAction";
import { services } from "@/lib/data/services";
import { BUSINESS_ID, createPageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
    return getAllPastWorkSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const item = getPastWorkBySlug(slug);
    if (!item) notFound();
    return createPageMetadata({
        title: item.name,
        description: item.description,
        path: `/work/${slug}`,
        type: "article",
        image: item.images[0]
    });
}

export default async function WorkDetailPage({ params }: PageProps<"/work/[slug]">) {
    const { slug } = await params;
    const item = getPastWorkBySlug(slug);
    if (!item) notFound();

    const service = services[item.category];
    const allWork = getAllPastWork();
    const currentIndex = allWork.findIndex(work => work.slug === slug);
    const previous = allWork[currentIndex - 1];
    const next = allWork[currentIndex + 1];
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "@id": getSiteUrl(`/work/${slug}#gallery`),
        url: getSiteUrl(`/work/${slug}`),
        name: item.name,
        description: item.description,
        image: item.images.map(image => ({
            "@type": "ImageObject",
            url: getSiteUrl(image.url),
            name: item.name,
            description: image.alt,
            creator: { "@id": BUSINESS_ID }
        })),
        creator: { "@id": BUSINESS_ID },
        dateCreated: item.createdAt,
        genre: item.category === "kitchen" ? "Kitchen" : "Wardrobe"
    };

    return (
        <>
            <script type="application/ld+json">{serializeJsonLd(jsonLd)}</script>
            <PageIntro
                title={item.name}
                description={item.description}
                breadcrumbs={
                    <Breadcrumbs
                        tone="light"
                        items={[
                            { name: "Home", href: "/" },
                            { name: "Our work", href: "/work" },
                            { name: item.name, href: `/work/${item.slug}` }
                        ]}
                    />
                }
            >
                <ContactAction
                    projectSlug={item.slug}
                    className="text-brand-dark inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold shadow-md hover:bg-gray-100 focus-visible:outline-white"
                >
                    Ask about this project
                </ContactAction>
            </PageIntro>
            <section
                id="gallery"
                aria-label="Project photographs and details"
                className="bg-brand-light px-4 py-6 sm:px-8 sm:py-8 lg:px-16"
            >
                <div className="mx-auto grid max-w-7xl items-start gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <ProjectGallery
                            images={item.images}
                            projectName={item.name}
                            projectSlug={item.slug}
                            workId={item.id}
                            category={item.category}
                        />
                    </div>
                    <div className="rounded-xl bg-white p-5 sm:p-6">
                        <h2 className="text-brand-dark mb-5 text-xl font-semibold">Project details</h2>
                        <dl className="space-y-5 text-sm">
                            <div>
                                <dt className="text-brand-dark font-semibold">Category</dt>
                                <dd className="mt-1">
                                    <Link
                                        href={service.path}
                                        className="text-brand-dark inline-flex min-h-8 items-center underline underline-offset-4"
                                    >
                                        {service.name}
                                    </Link>
                                </dd>
                            </div>
                            {item.details.map(detail => (
                                <div key={detail.label}>
                                    <dt className="text-brand-dark font-semibold">{detail.label}</dt>
                                    <dd className="mt-1 leading-relaxed text-gray-600">{detail.value}</dd>
                                </div>
                            ))}
                            <div>
                                <dt className="text-brand-dark font-semibold">Completed</dt>
                                <dd className="mt-1 text-gray-600">{formatDate(item.createdAt)}</dd>
                            </div>
                        </dl>
                        <div className="mt-6 border-t border-gray-200 pt-5">
                            <h3 className="text-brand-dark mb-3 text-sm font-semibold">Share this project</h3>
                            <ShareButtons item={item} />
                        </div>
                    </div>
                </div>
            </section>
            <div className="px-4 py-6 text-white sm:px-8 sm:py-8 lg:px-16">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <p className="max-w-2xl text-sm leading-relaxed text-white/85">{service.enquiry}</p>
                        <ContactAction
                            projectSlug={item.slug}
                            className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-white"
                        >
                            Ask about this project
                        </ContactAction>
                    </div>
                    <nav
                        aria-label="More projects"
                        className="mt-6 flex items-center justify-between gap-4 border-t border-white/20 pt-5 text-sm font-semibold"
                    >
                        {previous ? (
                            <Link
                                href={`/work/${previous.slug}`}
                                className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-white"
                            >
                                Previous project
                            </Link>
                        ) : (
                            <span />
                        )}
                        <Link
                            href="/work"
                            className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-white"
                        >
                            All projects
                        </Link>
                        {next ? (
                            <Link
                                href={`/work/${next.slug}`}
                                className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-white"
                            >
                                Next project
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
}
