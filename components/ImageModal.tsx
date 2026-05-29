"use client";

import { useReducer, useEffect, useEffectEvent, useRef } from "react";
import Link from "next/link";
import { m, AnimatePresence, type Variants } from "framer-motion";
import { FallbackImage } from "./FallbackImage";
import { useAnalytics } from "@/lib/posthog";
import { useShareActions } from "@/lib/use-share";
import type { PastWorkItem, ShareMethod, WorkFilter, WorkCategory, ViewSource } from "@/lib/types";

interface ImageModalProps {
    item: PastWorkItem;
    allItems: PastWorkItem[];
    currentItemIndex: number;
    onClose: () => void;
    onNavigateToItem: (index: number) => void;
    activeFilter?: WorkFilter;
    showFeatured?: boolean;
}

const getFilterLabel = (filter: WorkFilter, showFeatured: boolean): string => {
    if (showFeatured) {
        if (filter === "all") return "Featured Work";
        if (filter === "wardrobe") return "Featured Wardrobes";
        return "Featured Kitchens";
    }
    if (filter === "all") return "All Work";
    if (filter === "wardrobe") return "Wardrobes";
    return "Kitchens";
};

function focusElementSafely(element: HTMLElement | null) {
    if (!element?.isConnected) return;

    try {
        element.focus({ preventScroll: true });
    } catch {
        element.focus();
    }
}

// ---------- reducer ----------

type ModalState = {
    direction: number;
    showGallery: boolean;
    galleryImageIndex: number;
};

type ModalAction =
    | { type: "NAVIGATE"; direction: number }
    | { type: "SHOW_GALLERY" }
    | { type: "CLOSE_GALLERY" }
    | { type: "SET_GALLERY_INDEX"; index: number };

const modalInitial: ModalState = {
    direction: 0,
    showGallery: false,
    galleryImageIndex: 0
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
    switch (action.type) {
        case "NAVIGATE":
            return { ...state, direction: action.direction, showGallery: false, galleryImageIndex: 0 };
        case "SHOW_GALLERY":
            return { ...state, showGallery: true };
        case "CLOSE_GALLERY":
            return { ...state, showGallery: false };
        case "SET_GALLERY_INDEX":
            return { ...state, galleryImageIndex: action.index };
        default:
            return state;
    }
}

// ---------- GalleryView ----------

interface GalleryViewProps {
    item: PastWorkItem;
    galleryImageIndex: number;
    closeButtonRef: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    onBack: () => void;
    onPrevImage: () => void;
    onNextImage: () => void;
    onSetIndex: (index: number) => void;
    trackView: (id: string, category: WorkCategory, source: ViewSource) => void;
}

function GalleryView({
    item,
    galleryImageIndex,
    closeButtonRef,
    onClose,
    onBack,
    onPrevImage,
    onNextImage,
    onSetIndex,
    trackView
}: GalleryViewProps) {
    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            role="dialog"
            aria-modal="true"
            aria-label={`${item.name} gallery`}
            onClick={onBack}
        >
            <m.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                type="button"
                onClick={e => {
                    e.stopPropagation();
                    onBack();
                }}
                className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Back to main view"
            >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back</span>
            </m.button>

            <m.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                ref={closeButtonRef}
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
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                    e.stopPropagation();
                    trackView(item.id, item.category, "gallery");
                    onPrevImage();
                }}
                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Previous image"
            >
                <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </m.button>

            <m.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                    e.stopPropagation();
                    trackView(item.id, item.category, "gallery");
                    onNextImage();
                }}
                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Next image"
            >
                <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </m.button>

            <div className="relative m-4 h-full max-h-[80vh] w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                <AnimatePresence mode="wait">
                    <m.div
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
                    </m.div>
                </AnimatePresence>
            </div>

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 bottom-6 left-0 flex justify-center gap-2 px-4"
                onClick={e => e.stopPropagation()}
            >
                {item.images.map((img, idx) => (
                    <button
                        key={img.url}
                        type="button"
                        onClick={() => {
                            if (idx !== galleryImageIndex) trackView(item.id, item.category, "gallery");
                            onSetIndex(idx);
                        }}
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
            </m.div>

            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white"
            >
                {item.name} • {galleryImageIndex + 1} of {item.images.length}
            </m.div>
        </m.div>
    );
}

// ---------- MainModalView ----------

const imageVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0 })
};

interface MainModalViewProps {
    item: PastWorkItem;
    allItems: PastWorkItem[];
    currentItemIndex: number;
    direction: number;
    copySuccess: boolean;
    activeFilter: WorkFilter;
    showFeatured: boolean;
    closeButtonRef: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    onPrev: (event: React.MouseEvent) => void;
    onNext: (event: React.MouseEvent) => void;
    onShowGallery: () => void;
    onShare: (method: ShareMethod) => Promise<void> | void;
}

function MainModalView({
    item,
    allItems,
    currentItemIndex,
    direction,
    copySuccess,
    activeFilter,
    showFeatured,
    closeButtonRef,
    onClose,
    onPrev,
    onNext,
    onShowGallery,
    onShare
}: MainModalViewProps) {
    const currentImage = item.images[0];
    const hasMultipleImages = item.images.length > 1;

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-image-modal-title"
            onClick={onClose}
        >
            <m.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                ref={closeButtonRef}
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
                onClick={onPrev}
                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Previous image"
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
                onClick={onNext}
                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                aria-label="Next image"
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
                                    onClick={onShowGallery}
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
                                    <span>View All {item.images.length} Photos</span>
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
                                <span>View Details</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-start gap-3 sm:justify-end">
                        <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onShare("facebook")}
                            className="flex items-center gap-2 rounded bg-[#1877F2] px-4 py-2 text-sm text-white transition-colors hover:bg-[#1877F2]/90"
                            aria-label="Share on Facebook"
                        >
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                            </svg>
                            <span className="hidden sm:inline">Facebook</span>
                        </m.button>

                        <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onShare("whatsapp")}
                            className="flex items-center gap-2 rounded bg-[#25D366] px-4 py-2 text-sm text-white transition-colors hover:bg-[#25D366]/90"
                            aria-label="Share on WhatsApp"
                        >
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            <span className="hidden sm:inline">WhatsApp</span>
                        </m.button>

                        <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onShare("copy")}
                            className="flex items-center gap-2 rounded bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-500"
                            aria-label="Copy link"
                        >
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                            </svg>
                            <span className="hidden sm:inline">{copySuccess ? "Copied!" : "Copy Link"}</span>
                        </m.button>
                    </div>
                </div>
            </m.div>
        </m.div>
    );
}

// ---------- ImageModal ----------

export function ImageModal({
    item,
    allItems,
    currentItemIndex,
    onClose,
    onNavigateToItem,
    activeFilter = "all",
    showFeatured = false
}: ImageModalProps) {
    const [modalState, dispatch] = useReducer(modalReducer, modalInitial);
    const { direction, showGallery, galleryImageIndex } = modalState;

    const { trackViewPastWork } = useAnalytics();
    const { copySuccess, share } = useShareActions(item);
    const mainCloseButtonRef = useRef<HTMLButtonElement>(null);
    const galleryCloseButtonRef = useRef<HTMLButtonElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            focusElementSafely(lastFocusedElementRef.current);
            lastFocusedElementRef.current = null;
        };
    }, []);

    useEffect(() => {
        const focusTarget = showGallery ? galleryCloseButtonRef.current : mainCloseButtonRef.current;
        focusElementSafely(focusTarget);
    }, [showGallery, item.id]);

    const onCloseEvent = useEffectEvent(onClose);
    const onNavigateToItemEvent = useEffectEvent(onNavigateToItem);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showGallery) {
                switch (e.key) {
                    case "Escape":
                        dispatch({ type: "CLOSE_GALLERY" });
                        break;
                    case "ArrowRight": {
                        trackViewPastWork(item.id, item.category, "gallery");
                        dispatch({ type: "SET_GALLERY_INDEX", index: (galleryImageIndex + 1) % item.images.length });
                        break;
                    }
                    case "ArrowLeft": {
                        trackViewPastWork(item.id, item.category, "gallery");
                        dispatch({
                            type: "SET_GALLERY_INDEX",
                            index: (galleryImageIndex - 1 + item.images.length) % item.images.length
                        });
                        break;
                    }
                }
            } else {
                switch (e.key) {
                    case "Escape":
                        onCloseEvent();
                        break;
                    case "ArrowRight": {
                        const nextIndex = (currentItemIndex + 1) % allItems.length;
                        const nextItem = allItems[nextIndex];
                        if (nextItem) trackViewPastWork(nextItem.id, nextItem.category, "navigation");
                        dispatch({ type: "NAVIGATE", direction: 1 });
                        onNavigateToItemEvent(nextIndex);
                        break;
                    }
                    case "ArrowLeft": {
                        const prevIndex = (currentItemIndex - 1 + allItems.length) % allItems.length;
                        const prevItem = allItems[prevIndex];
                        if (prevItem) trackViewPastWork(prevItem.id, prevItem.category, "navigation");
                        dispatch({ type: "NAVIGATE", direction: -1 });
                        onNavigateToItemEvent(prevIndex);
                        break;
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        showGallery,
        galleryImageIndex,
        item.id,
        item.category,
        item.images,
        currentItemIndex,
        allItems,
        trackViewPastWork
    ]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prevIndex = (currentItemIndex - 1 + allItems.length) % allItems.length;
        const prevItem = allItems[prevIndex];
        if (prevItem) trackViewPastWork(prevItem.id, prevItem.category, "navigation");
        dispatch({ type: "NAVIGATE", direction: -1 });
        onNavigateToItem(prevIndex);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextIndex = (currentItemIndex + 1) % allItems.length;
        const nextItem = allItems[nextIndex];
        if (nextItem) trackViewPastWork(nextItem.id, nextItem.category, "navigation");
        dispatch({ type: "NAVIGATE", direction: 1 });
        onNavigateToItem(nextIndex);
    };

    if (showGallery) {
        return (
            <GalleryView
                item={item}
                galleryImageIndex={galleryImageIndex}
                closeButtonRef={galleryCloseButtonRef}
                onClose={onClose}
                onBack={() => dispatch({ type: "CLOSE_GALLERY" })}
                onPrevImage={() =>
                    dispatch({
                        type: "SET_GALLERY_INDEX",
                        index: (galleryImageIndex - 1 + item.images.length) % item.images.length
                    })
                }
                onNextImage={() =>
                    dispatch({ type: "SET_GALLERY_INDEX", index: (galleryImageIndex + 1) % item.images.length })
                }
                onSetIndex={index => dispatch({ type: "SET_GALLERY_INDEX", index })}
                trackView={trackViewPastWork}
            />
        );
    }

    return (
        <MainModalView
            item={item}
            allItems={allItems}
            currentItemIndex={currentItemIndex}
            direction={direction}
            copySuccess={copySuccess}
            activeFilter={activeFilter}
            showFeatured={showFeatured}
            closeButtonRef={mainCloseButtonRef}
            onClose={onClose}
            onPrev={handlePrev}
            onNext={handleNext}
            onShowGallery={() => {
                trackViewPastWork(item.id, item.category, "gallery");
                dispatch({ type: "SHOW_GALLERY" });
            }}
            onShare={share}
        />
    );
}
