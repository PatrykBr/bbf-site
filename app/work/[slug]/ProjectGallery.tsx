"use client";

import { useState, useEffect, useCallback, useEffectEvent, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { FallbackImage } from "@/components/FallbackImage";
import { useAnalytics } from "@/lib/posthog";
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
    const { trackViewPastWork } = useAnalytics();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    const handleClose = useCallback(() => {
        setSelectedIndex(null);

        if (lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus();
            lastFocusedElementRef.current = null;
        }
    }, []);

    const handlePrev = useCallback(() => {
        trackViewPastWork(workId, category, "gallery");
        setSelectedIndex(prev => {
            if (prev === null) return null;
            return (prev - 1 + images.length) % images.length;
        });
    }, [images.length, workId, category, trackViewPastWork]);

    const handleNext = useCallback(() => {
        trackViewPastWork(workId, category, "gallery");
        setSelectedIndex(prev => {
            if (prev === null) return null;
            return (prev + 1) % images.length;
        });
    }, [images.length, workId, category, trackViewPastWork]);

    const onClose = useEffectEvent(handleClose);
    const onNext = useEffectEvent(handleNext);
    const onPrev = useEffectEvent(handlePrev);

    // Keyboard navigation
    useEffect(() => {
        if (selectedIndex === null) return;

        closeButtonRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowRight":
                    onNext();
                    break;
                case "ArrowLeft":
                    onPrev();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [selectedIndex]);

    return (
        <>
            <h3 className="text-brand-dark mb-4 text-xl font-semibold">
                {images.length > 1 ? "Project Gallery" : "Project Image"}
            </h3>
            <div className="mx-auto max-w-md columns-1 gap-4 space-y-4 sm:max-w-3xl sm:columns-2 lg:max-w-none">
                {images.map((image, index) => (
                    <figure key={image.url} className="break-inside-avoid">
                        <button
                            type="button"
                            onClick={() => {
                                lastFocusedElementRef.current =
                                    document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
                            {/* Hover overlay */}
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

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${projectName} image preview`}
                        onClick={handleClose}
                    >
                        {/* Close Button */}
                        <m.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            ref={closeButtonRef}
                            type="button"
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                            aria-label="Close"
                        >
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </m.button>

                        {/* Navigation - Previous */}
                        {images.length > 1 && (
                            <m.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={e => {
                                    e.stopPropagation();
                                    handlePrev();
                                }}
                                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                                aria-label="Previous image"
                            >
                                <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </m.button>
                        )}

                        {/* Navigation - Next */}
                        {images.length > 1 && (
                            <m.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                                aria-label="Next image"
                            >
                                <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </m.button>
                        )}

                        {/* Image */}
                        <div
                            className="relative m-4 h-full max-h-[85vh] w-full max-w-5xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <m.div
                                    key={selectedIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative h-full w-full"
                                >
                                    <FallbackImage
                                        src={images[selectedIndex].url}
                                        alt={images[selectedIndex].alt}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 1280px) 100vw, 1280px"
                                    />
                                </m.div>
                            </AnimatePresence>
                        </div>

                        {/* Bottom info */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-0 bottom-4 left-0 text-center"
                        >
                            <p className="text-sm text-white/80">
                                {projectName}
                                {images.length > 1 && ` • ${selectedIndex + 1} of ${images.length}`}
                            </p>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
}
