"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FallbackImage } from "./FallbackImage";
import { useAnalytics } from "@/lib/posthog";
import { getFacebookShareUrl, getWhatsAppShareUrl, copyToClipboard } from "@/lib/utils";
import type { PastWorkItem, ShareMethod } from "@/lib/types";

interface ImageModalProps {
    item: PastWorkItem;
    allItems: PastWorkItem[];
    currentItemIndex: number;
    onClose: () => void;
    onNavigateToItem: (index: number) => void;
}

export function ImageModal({ item, allItems, currentItemIndex, onClose, onNavigateToItem }: ImageModalProps) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [direction, setDirection] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const [galleryImageIndex, setGalleryImageIndex] = useState(0);
    const { trackSharePastWork } = useAnalytics();

    const currentImage = item.images[0]; // Always show first image in main view
    const hasMultipleImages = item.images.length > 1;

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showGallery) {
                // Gallery navigation
                switch (e.key) {
                    case "Escape":
                        setShowGallery(false);
                        break;
                    case "ArrowRight":
                        setGalleryImageIndex(prev => (prev + 1) % item.images.length);
                        break;
                    case "ArrowLeft":
                        setGalleryImageIndex(prev => (prev - 1 + item.images.length) % item.images.length);
                        break;
                }
            } else {
                // Work item navigation
                switch (e.key) {
                    case "Escape":
                        onClose();
                        break;
                    case "ArrowRight":
                        setDirection(1);
                        onNavigateToItem((currentItemIndex + 1) % allItems.length);
                        break;
                    case "ArrowLeft":
                        setDirection(-1);
                        onNavigateToItem((currentItemIndex - 1 + allItems.length) % allItems.length);
                        break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [onClose, onNavigateToItem, currentItemIndex, allItems.length, showGallery, item.images.length]);

    // Reset gallery when item changes
    useEffect(() => {
        setShowGallery(false);
        setGalleryImageIndex(0);
    }, [item.id]);

    const handleShare = useCallback(
        async (method: ShareMethod) => {
            trackSharePastWork(item.id, item.category, method);

            switch (method) {
                case "facebook":
                    window.open(getFacebookShareUrl(item.slug), "_blank");
                    break;
                case "whatsapp":
                    window.open(getWhatsAppShareUrl(item.slug, item.name), "_blank");
                    break;
                case "copy":
                    const success = await copyToClipboard(item.slug);
                    if (success) {
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                    }
                    break;
            }
        },
        [item, trackSharePastWork]
    );

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDirection(-1);
        onNavigateToItem((currentItemIndex - 1 + allItems.length) % allItems.length);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDirection(1);
        onNavigateToItem((currentItemIndex + 1) % allItems.length);
    };

    const imageVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 100 : -100,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 100 : -100,
            opacity: 0
        })
    };

    // Gallery view for multiple images
    if (showGallery) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                onClick={() => setShowGallery(false)}
            >
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={e => {
                        e.stopPropagation();
                        setShowGallery(false);
                    }}
                    className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                    aria-label="Back to main view"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm">Back</span>
                </motion.button>

                {/* Close Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                    aria-label="Close modal"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </motion.button>

                {/* Gallery Navigation */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={e => {
                        e.stopPropagation();
                        setGalleryImageIndex(prev => (prev - 1 + item.images.length) % item.images.length);
                    }}
                    className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                    aria-label="Previous image"
                >
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={e => {
                        e.stopPropagation();
                        setGalleryImageIndex(prev => (prev + 1) % item.images.length);
                    }}
                    className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                    aria-label="Next image"
                >
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </motion.button>

                {/* Gallery Image */}
                <div className="relative m-4 h-full max-h-[80vh] w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={galleryImageIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative h-full w-full"
                        >
                            <FallbackImage
                                src={item.images[galleryImageIndex].url}
                                alt={item.images[galleryImageIndex].alt}
                                fill
                                className="object-contain"
                                sizes="(max-width: 1280px) 100vw, 1280px"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Gallery Thumbnails */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 bottom-6 left-0 flex justify-center gap-2 px-4"
                    onClick={e => e.stopPropagation()}
                >
                    {item.images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setGalleryImageIndex(idx)}
                            className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                                idx === galleryImageIndex
                                    ? "scale-110 border-white"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                        >
                            <FallbackImage
                                src={img.url}
                                alt={img.alt}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </motion.div>

                {/* Gallery Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white"
                >
                    {item.name} • {galleryImageIndex + 1} of {item.images.length}
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            {/* Close Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Close modal"
            >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </motion.button>

            {/* Navigation - Previous */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Previous image"
            >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </motion.button>

            {/* Navigation - Next */}
            <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Next image"
            >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </motion.button>

            {/* Image Container */}
            <div className="relative m-4 h-full max-h-[80vh] w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={item.id}
                        custom={direction}
                        variants={imageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="relative h-full w-full"
                    >
                        <FallbackImage
                            src={currentImage.url}
                            alt={currentImage.alt}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1280px) 100vw, 1280px"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Bar - Info & Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="mx-auto flex max-w-5xl flex-col gap-4">
                    {/* Top row - Item info & navigation indicator */}
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        {/* Item Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                            <p className="text-sm text-white/70 capitalize">{item.category}</p>
                            <p className="mt-1 text-xs text-white/50">
                                {currentItemIndex + 1} of {allItems.length} works
                            </p>
                        </div>

                        {/* View More & View Details Buttons */}
                        <div className="flex gap-2">
                            {hasMultipleImages && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowGallery(true)}
                                    className="bg-brand-light hover:bg-brand-light/90 flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>View All {item.images.length} Photos</span>
                                </motion.button>
                            )}
                            <Link
                                href={`/work/${item.slug}`}
                                onClick={onClose}
                                className="text-brand-dark flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white/90"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span>View Details</span>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom row - Share buttons */}
                    <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShare("facebook")}
                            className="flex items-center gap-2 rounded bg-[#1877F2] px-4 py-2 text-sm text-white transition-colors hover:bg-[#1877F2]/90"
                            aria-label="Share on Facebook"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                            </svg>
                            <span className="hidden sm:inline">Facebook</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShare("whatsapp")}
                            className="flex items-center gap-2 rounded bg-[#25D366] px-4 py-2 text-sm text-white transition-colors hover:bg-[#25D366]/90"
                            aria-label="Share on WhatsApp"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            <span className="hidden sm:inline">WhatsApp</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShare("copy")}
                            className="flex items-center gap-2 rounded bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-500"
                            aria-label="Copy link"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                            </svg>
                            <span className="hidden sm:inline">{copySuccess ? "Copied!" : "Copy Link"}</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
