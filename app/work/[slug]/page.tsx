import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FallbackImage } from "@/components/FallbackImage";
import { getPastWorkBySlug, getAllPastWorkSlugs, getAllPastWork } from "@/lib/data/past-work";
import { formatDate, serializeJsonLd } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site-config";
import { ShareButtons } from "@/components/ShareButtons";
import { ProjectGallery } from "./ProjectGallery";

export async function generateStaticParams() {
    const slugs = getAllPastWorkSlugs();
    return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const item = getPastWorkBySlug(slug);

    if (!item) {
        return {
            title: "Project not found"
        };
    }

    const categoryLabel = item.category === "wardrobe" ? "Wardrobe" : "Kitchen";

    return {
        title: item.name,
        description: item.description,
        alternates: {
            canonical: getSiteUrl(`/work/${slug}`)
        },
        openGraph: {
            title: `${item.name} | Bespoke Broncel Furniture`,
            description: item.description,
            type: "article",
            images: [
                {
                    url: getSiteUrl(item.images[0].url),
                    alt: item.images[0].alt
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: item.name,
            description: item.description,
            images: [getSiteUrl(item.images[0].url)]
        },
        keywords: [`custom ${categoryLabel.toLowerCase()}`, "bespoke furniture", item.name, "South Yorkshire"]
    };
}

export default async function WorkDetailPage({ params }: PageProps<"/work/[slug]">) {
    const { slug } = await params;
    const item = getPastWorkBySlug(slug);

    if (!item) {
        notFound();
    }

    const categoryLabel = item.category === "wardrobe" ? "Wardrobe" : "Kitchen";
    const allWork = getAllPastWork();
    const currentIndex = allWork.findIndex(w => w.slug === slug);
    const prevItem = currentIndex > 0 ? allWork[currentIndex - 1] : null;
    const nextItem = currentIndex < allWork.length - 1 ? allWork[currentIndex + 1] : null;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        name: item.name,
        description: item.description,
        image: item.images.map(img => ({
            "@type": "ImageObject",
            url: getSiteUrl(img.url),
            name: item.name,
            description: img.alt,
            creator: {
                "@type": "Organization",
                name: "Bespoke Broncel Furniture"
            }
        })),
        creator: {
            "@type": "Organization",
            name: "Bespoke Broncel Furniture",
            url: getSiteUrl()
        },
        dateCreated: item.createdAt,
        genre: categoryLabel
    };

    return (
        <>
            <Header />
            <main className="bg-white pt-20">
                <script type="application/ld+json">{serializeJsonLd(jsonLd)}</script>

                <div className="bg-gray-50 py-4">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center gap-2 text-sm">
                            <Link href="/" className="hover:text-brand-dark text-gray-500 transition-colors">
                                Home
                            </Link>
                            <span className="text-gray-400">/</span>
                            <Link href="/#work" className="hover:text-brand-dark text-gray-500 transition-colors">
                                Work
                            </Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-brand-dark font-medium">{item.name}</span>
                        </nav>
                    </div>
                </div>

                <figure className="relative h-[50vh] bg-gray-200 md:h-[60vh]">
                    <FallbackImage
                        src={item.images[0].url}
                        alt={item.images[0].alt}
                        fill
                        className="object-cover"
                        preload
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                    <div className="absolute right-0 bottom-0 left-0 p-8">
                        <div className="mx-auto max-w-7xl">
                            <span className="bg-brand-light mb-4 inline-block rounded px-3 py-1 text-sm text-white">
                                {categoryLabel}
                            </span>
                            <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">{item.name}</h1>
                            {item.isFeatured && (
                                <span className="mt-3 inline-block rounded bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                                    Featured work
                                </span>
                            )}
                        </div>
                    </div>
                </figure>

                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <h2 className="text-brand-dark mb-4 text-2xl font-semibold">About this project</h2>
                            <p className="mb-8 leading-relaxed text-gray-600">{item.description}</p>

                            <ProjectGallery
                                images={item.images}
                                projectName={item.name}
                                workId={item.id}
                                category={item.category}
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-xl bg-gray-50 p-6">
                                <h3 className="text-brand-dark mb-4 text-lg font-semibold">Project details</h3>

                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Category</dt>
                                        <dd className="text-brand-dark font-medium">{categoryLabel}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Completed</dt>
                                        <dd className="text-brand-dark font-medium">{formatDate(item.createdAt)}</dd>
                                    </div>
                                    {item.isFeatured && (
                                        <div>
                                            <dt className="text-sm text-gray-500">Status</dt>
                                            <dd className="text-brand-light font-medium">Featured project</dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="mt-6 border-t border-gray-200 pt-6">
                                    <h4 className="mb-3 text-sm font-medium text-gray-700">Share this project</h4>
                                    <ShareButtons item={item} />
                                </div>

                                <div className="mt-8 border-t border-gray-200 pt-6">
                                    <p className="mb-4 text-sm text-gray-600">Interested in a similar project?</p>
                                    <Link
                                        href="/#contact"
                                        className="bg-brand-dark hover:bg-brand-light block w-full rounded-lg py-3 text-center font-medium text-white transition-colors"
                                    >
                                        Get a free quote
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8">
                        {prevItem ? (
                            <Link
                                href={`/work/${prevItem.slug}`}
                                className="hover:text-brand-dark flex items-center gap-2 text-gray-600 transition-colors"
                            >
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                <span className="hidden sm:inline">{prevItem.name}</span>
                                <span className="sm:hidden">Previous</span>
                            </Link>
                        ) : (
                            <div />
                        )}

                        <Link
                            href="/#work"
                            className="text-brand-light hover:text-brand-dark font-medium transition-colors"
                        >
                            View all work
                        </Link>

                        {nextItem ? (
                            <Link
                                href={`/work/${nextItem.slug}`}
                                className="hover:text-brand-dark flex items-center gap-2 text-gray-600 transition-colors"
                            >
                                <span className="hidden sm:inline">{nextItem.name}</span>
                                <span className="sm:hidden">Next</span>
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        ) : (
                            <div />
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
