"use client";

import Link from "next/link";
import { useState } from "react";
import { ProjectViewer } from "./ProjectViewer";
import { trackClickPastWork, trackViewPastWork } from "@/lib/posthog";
import { FallbackImage } from "@/components/FallbackImage";
import type { PastWorkItem } from "@/lib/types";
import { getAspectRatioClass } from "@/lib/utils";

export function ProjectList({ items, browseItems = items }: { items: PastWorkItem[]; browseItems?: PastWorkItem[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    return (
        <>
            <ul className="columns-2 gap-3 space-y-3 sm:gap-5 sm:space-y-5 lg:columns-3 xl:columns-4">
                {items.map(item => (
                    <li
                        key={item.id}
                        className="project-scroll-card group break-inside-avoid overflow-hidden rounded-lg bg-gray-100 shadow-md transition-shadow hover:shadow-xl"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                trackClickPastWork(item.id, item.category);
                                trackViewPastWork(item.id, item.category, "click");
                                setSelectedIndex(browseItems.findIndex(project => project.id === item.id));
                            }}
                            aria-label={`View ${item.name} photos`}
                            className={`relative block w-full cursor-pointer overflow-hidden focus-visible:outline-offset-[-3px] focus-visible:outline-white ${getAspectRatioClass(item.images[0].orientation)}`}
                        >
                            <FallbackImage
                                src={item.images[0].url}
                                alt={item.images[0].alt}
                                fill
                                sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                            />
                            {item.isFeatured && (
                                <span className="bg-brand-dark absolute top-3 left-3 rounded px-2 py-1 text-xs font-medium text-white">
                                    Featured
                                </span>
                            )}
                        </button>
                        <div className="p-3 sm:p-4">
                            <h3
                                id={`project-${item.id}`}
                                className="text-brand-dark text-sm leading-snug font-semibold underline-offset-4 group-hover:underline sm:text-base"
                            >
                                <Link href={`/work/${item.slug}`} className="focus-visible:outline-brand-dark">
                                    {item.name}
                                </Link>
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                {item.category === "kitchen" ? "Kitchen" : "Wardrobe"}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
            {selectedIndex !== null && (
                <ProjectViewer
                    items={browseItems}
                    initialIndex={selectedIndex}
                    onClose={() => setSelectedIndex(null)}
                />
            )}
        </>
    );
}
