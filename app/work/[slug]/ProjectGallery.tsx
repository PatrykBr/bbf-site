"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FallbackImage } from "@/components";
import { useAnalytics } from "@/lib/posthog";
import type { WorkImage, ImageOrientation, WorkCategory } from "@/lib/types";

interface ProjectGalleryProps {
    images: WorkImage[];
    projectName: string;
    workId: string;
    category: WorkCategory;
}

// Get aspect ratio class based on image orientation
const getAspectRatioClass = (orientation: ImageOrientation = "landscape"): string => {
    switch (orientation) {
        case "portrait":
            return "aspect-[3/4]";
        case "square":
            return "aspect-square";
        case "landscape":
        default:
            return "aspect-[4/3]";
    }
};

export function ProjectGallery({ images, projectName, workId, category }: ProjectGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const { trackViewPastWork } = useAnalytics();

    const handleClose = useCallback(() => {
        setSelectedIndex(null);
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

    // Keyboard navigation
    useEffect(() => {
        if (selectedIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    handleClose();
                    break;
                case "ArrowRight":
                    handleNext();
                    break;
                case "ArrowLeft":
                    handlePrev();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [selectedIndex, handleClose, handleNext, handlePrev]);

    return (
        <>
            <h3 className="text-brand-dark mb-4 text-xl font-semibold">
                {images.length > 1 ? "Project Gallery" : "Project Image"}
            </h3>
            <div className="columns-1 gap-4 space-y-4 sm:columns-2">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            trackViewPastWork(workId, category, "gallery");
                            setSelectedIndex(index);
                        }}
                        className={`relative ${getAspectRatioClass(image.orientation)} group w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg`}
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
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                        onClick={handleClose}
                    >
                        {/* Close Button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                            aria-label="Close"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </motion.button>

                        {/* Navigation - Previous */}
                        {images.length > 1 && (
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={e => {
                                    e.stopPropagation();
                                    handlePrev();
                                }}
                                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                                aria-label="Previous image"
                            >
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </motion.button>
                        )}

                        {/* Navigation - Next */}
                        {images.length > 1 && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                                aria-label="Next image"
                            >
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </motion.button>
                        )}

                        {/* Image */}
                        <div
                            className="relative m-4 h-full max-h-[85vh] w-full max-w-5xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
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
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Bottom info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute right-0 bottom-4 left-0 text-center"
                        >
                            <p className="text-sm text-white/80">
                                {projectName}
                                {images.length > 1 && ` • ${selectedIndex + 1} of ${images.length}`}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
