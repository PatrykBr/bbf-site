import { useState } from "react";
import Link from "next/link";
import { m, AnimatePresence, type Variants } from "motion/react";
import { FallbackImage } from "./FallbackImage";
import { Modal } from "./Modal";
import { ImageGallery } from "./ImageGallery";
import { ShareButtons } from "./ShareButtons";
import { trackViewPastWork } from "@/lib/posthog";
import type { PastWorkItem, WorkFilter } from "@/lib/types";

interface ImageModalProps {
    item: PastWorkItem;
    allItems: PastWorkItem[];
    currentItemIndex: number;
    onClose: () => void;
    onNavigateToItem: (index: number) => void;
    activeFilter: WorkFilter;
    showFeatured: boolean;
}

const getFilterLabel = (filter: WorkFilter, showFeatured: boolean): string => {
    if (showFeatured) {
        if (filter === "all") return "Featured work";
        if (filter === "wardrobe") return "Featured wardrobes";
        return "Featured kitchens";
    }
    if (filter === "all") return "All work";
    if (filter === "wardrobe") return "Wardrobes";
    return "Kitchens";
};

const imageVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0 })
};

export function ImageModal({
    item,
    allItems,
    currentItemIndex,
    onClose,
    onNavigateToItem,
    activeFilter,
    showFeatured
}: ImageModalProps) {
    const [showGallery, setShowGallery] = useState(false);
    const [direction, setDirection] = useState(0);
    const currentImage = item.images[0];
    const hasMultipleImages = item.images.length > 1;

    const navigate = (step: number) => {
        const index = (currentItemIndex + step + allItems.length) % allItems.length;
        const next = allItems[index];
        trackViewPastWork(next.id, next.category, "navigation");
        setDirection(step);
        onNavigateToItem(index);
    };

    if (showGallery)
        return (
            <ImageGallery
                images={item.images}
                name={item.name}
                onClose={() => setShowGallery(false)}
                onView={() => trackViewPastWork(item.id, item.category, "gallery")}
            />
        );

    return (
        <Modal
            label={item.name}
            onClose={onClose}
            onKeyDown={event => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    navigate(event.key === "ArrowLeft" ? -1 : 1);
                }
            }}
        >
            <m.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                type="button"
                onClick={e => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Close modal"
            >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </m.button>

            <m.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => navigate(-1)}
                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Previous project"
            >
                <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </m.button>

            <m.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => navigate(1)}
                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Next project"
            >
                <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </m.button>

            <div className="relative m-4 h-full max-h-[80vh] w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <m.div
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
                    </m.div>
                </AnimatePresence>
            </div>

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="mx-auto flex max-w-5xl flex-col gap-4">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h3 id="work-image-modal-title" className="text-lg font-semibold text-white">
                                {item.name}
                            </h3>
                            <p className="text-sm text-white/70">{getFilterLabel(activeFilter, showFeatured)}</p>
                            <p className="mt-1 text-xs text-white/50">
                                {currentItemIndex + 1} of {allItems.length}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {hasMultipleImages && (
                                <m.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => {
                                        trackViewPastWork(item.id, item.category, "gallery");
                                        setShowGallery(true);
                                    }}
                                    className="bg-brand-light hover:bg-brand-light/90 flex items-center gap-2 rounded px-4 py-2 text-sm font-medium text-white transition-colors"
                                >
                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>View all {item.images.length} photos</span>
                                </m.button>
                            )}
                            <Link
                                href={`/work/${item.slug}`}
                                onClick={onClose}
                                className="text-brand-dark flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white/90"
                            >
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span>View details</span>
                            </Link>
                        </div>
                    </div>

                    <ShareButtons key={item.id} item={item} />
                </div>
            </m.div>
        </Modal>
    );
}
