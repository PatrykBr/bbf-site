"use client";

import { useState } from "react";
import { ImageGallery } from "@/components/ImageGallery";
import { FallbackImage } from "@/components/FallbackImage";
import { trackViewPastWork } from "@/lib/posthog";
import type { PastWorkItem, WorkCategory } from "@/lib/types";
import { getAspectRatioClass } from "@/lib/utils";

interface ProjectGalleryProps {
    images: PastWorkItem["images"];
    projectName: string;
    projectSlug: string;
    workId: string;
    category: WorkCategory;
}

export function ProjectGallery({ images, projectName, projectSlug, workId, category }: ProjectGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    return (
        <>
            <h2 className="sr-only">Project photographs</h2>
            <div className={`space-y-4 ${images.length > 1 ? "columns-1 gap-4 sm:columns-2" : ""}`}>
                {images.map((image, index) => (
                    <figure key={image.url} className="break-inside-avoid">
                        <button
                            type="button"
                            aria-label={`Enlarge photo ${index + 1} of ${projectName}`}
                            onClick={() => {
                                trackViewPastWork(workId, category, "gallery");
                                setSelectedIndex(index);
                            }}
                            className={`relative ${getAspectRatioClass(image.orientation)} group w-full cursor-pointer overflow-hidden rounded-lg focus-visible:outline-white`}
                        >
                            <FallbackImage
                                src={image.url}
                                alt={image.alt}
                                fill
                                preload={index === 0}
                                className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                                sizes={
                                    images.length === 1
                                        ? "(max-width: 1024px) 100vw, 66vw"
                                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                }
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                                <span className="font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <span className="bg-brand-dark absolute right-3 bottom-3 rounded px-3 py-2 text-xs font-semibold text-white">
                                Enlarge photo
                            </span>
                        </button>
                        <figcaption className="sr-only">{image.alt}</figcaption>
                    </figure>
                ))}
            </div>

            {selectedIndex !== null && (
                <ImageGallery
                    images={images}
                    name={projectName}
                    initialIndex={selectedIndex}
                    projectSlug={projectSlug}
                    onClose={() => setSelectedIndex(null)}
                    onView={() => trackViewPastWork(workId, category, "gallery")}
                />
            )}
        </>
    );
}
