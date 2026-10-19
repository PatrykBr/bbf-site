"use client";

import { useState } from "react";
import { ImageGallery } from "@/components/ImageGallery";
import { FallbackImage } from "@/components/FallbackImage";
import { trackViewPastWork } from "@/lib/posthog";
import type { WorkImage, WorkCategory } from "@/lib/types";
import { getAspectRatioClass } from "@/lib/utils";

interface ProjectGalleryProps {
    images: WorkImage[];
    projectName: string;
    workId: string;
    category: WorkCategory;
}

export function ProjectGallery({ images, projectName, workId, category }: ProjectGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    return (
        <>
            <h3 className="text-brand-dark mb-4 text-xl font-semibold">
                {images.length > 1 ? "Project gallery" : "Project image"}
            </h3>
            <div className="mx-auto max-w-md columns-1 gap-4 space-y-4 sm:max-w-3xl sm:columns-2 lg:max-w-none">
                {images.map((image, index) => (
                    <figure key={image.url} className="break-inside-avoid">
                        <button
                            type="button"
                            onClick={() => {
                                trackViewPastWork(workId, category, "gallery");
                                setSelectedIndex(index);
                            }}
                            className={`relative ${getAspectRatioClass(image.orientation)} group w-full cursor-pointer overflow-hidden rounded-lg`}
                        >
                            <FallbackImage
                                src={image.url}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
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
                    onClose={() => setSelectedIndex(null)}
                    onView={() => trackViewPastWork(workId, category, "gallery")}
                />
            )}
        </>
    );
}
