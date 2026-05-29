"use client";

import { useState, useReducer, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { m, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { FallbackImage } from "./FallbackImage";
import { useAnalytics } from "@/lib/posthog";
import type { PastWorkItem, WorkFilter } from "@/lib/types";
import { getAspectRatioClass } from "@/lib/utils";

const ImageModal = dynamic(() => import("./ImageModal").then(mod => ({ default: mod.ImageModal })));

interface WorkGridProps {
    items: PastWorkItem[];
    itemsPerPage?: number;
}

function getResponsiveItemsPerPage(viewportWidth: number): number {
    if (viewportWidth > 1280) return 16;
    if (viewportWidth > 1024) return 12;
    if (viewportWidth > 640) return 8;
    return 5;
}

function getColumnCount(width: number): number {
    if (width === 0) return 1; // SSR / pre-measure: default to single column
    if (width <= 640) return 1;
    if (width <= 1024) return 2;
    if (width <= 1280) return 3;
    return 4;
}

function getGalleryGridClass(columnCount: number): string {
    switch (columnCount) {
        case 1:
            return "mx-auto grid max-w-md grid-cols-1 gap-5";
        case 2:
            return "mx-auto grid max-w-3xl grid-cols-2 gap-5";
        case 3:
            return "mx-auto grid max-w-5xl grid-cols-3 gap-5";
        default:
            return "grid grid-cols-4 gap-5";
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// ---------- reducer ----------

type GridFilterState = {
    filter: WorkFilter;
    showFeatured: boolean;
    currentPage: number;
};

type GridFilterAction =
    | { type: "SET_FILTER"; filter: WorkFilter }
    | { type: "SET_FEATURED"; showFeatured: boolean }
    | { type: "SET_PAGE"; page: number };

const filterInitial: GridFilterState = { filter: "all", showFeatured: false, currentPage: 1 };

function gridFilterReducer(state: GridFilterState, action: GridFilterAction): GridFilterState {
    switch (action.type) {
        case "SET_FILTER":
            return { ...state, filter: action.filter, currentPage: 1 };
        case "SET_FEATURED":
            return { ...state, showFeatured: action.showFeatured, currentPage: 1 };
        case "SET_PAGE":
            return { ...state, currentPage: action.page };
        default:
            return state;
    }
}

// ---------- WorkFilters ----------

interface WorkFiltersProps {
    filter: WorkFilter;
    showFeatured: boolean;
    shouldReduceMotion: boolean | null;
    onFilterChange: (f: WorkFilter) => void;
    onFeaturedToggle: (featured: boolean) => void;
}

function WorkFilters({ filter, showFeatured, shouldReduceMotion, onFilterChange, onFeaturedToggle }: WorkFiltersProps) {
    return (
        <>
            <m.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? undefined : { duration: 0.6, delay: 0.1 }}
                className="mb-8 flex flex-wrap justify-center gap-3"
            >
                <div className="relative flex overflow-hidden rounded-xl bg-white/80 p-1 shadow-lg shadow-black/10 backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={() => onFeaturedToggle(false)}
                        className="relative z-10 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
                    >
                        <span className={!showFeatured ? "text-white" : "text-brand-dark"}>View All</span>
                        {!showFeatured && (
                            <m.div
                                layoutId="activeWorkFilter"
                                className="bg-brand-dark absolute inset-0 -z-10 rounded-lg shadow-md"
                                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => onFeaturedToggle(true)}
                        className="relative z-10 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
                    >
                        <span className={showFeatured ? "text-white" : "text-brand-dark"}>Featured Work</span>
                        {showFeatured && (
                            <m.div
                                layoutId="activeWorkFilter"
                                className="bg-brand-dark absolute inset-0 -z-10 rounded-lg shadow-md"
                                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                </div>
            </m.div>

            <m.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? undefined : { duration: 0.6, delay: 0.2 }}
                className="mb-12 flex justify-center gap-2"
            >
                {(["all", "wardrobe", "kitchen"] as const).map(cat => (
                    <m.button
                        key={cat}
                        onClick={() => onFilterChange(cat)}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            filter === cat ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {cat === "all" ? "All" : cat === "wardrobe" ? "Wardrobes" : "Kitchens"}
                    </m.button>
                ))}
            </m.div>
        </>
    );
}

// ---------- WorkCard ----------

interface WorkCardProps {
    item: PastWorkItem;
    shouldReduceMotion: boolean | null;
    onImageClick: (item: PastWorkItem) => void;
}

function WorkCard({ item, shouldReduceMotion, onImageClick }: WorkCardProps) {
    return (
        <m.div
            variants={itemVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={{ once: true, margin: "-50px" }}
        >
            <m.div
                whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                transition={shouldReduceMotion ? undefined : { duration: 0.2 }}
                className="group relative overflow-hidden rounded-lg bg-gray-100 shadow-md transition-shadow hover:shadow-xl"
            >
                <button
                    type="button"
                    onClick={() => onImageClick(item)}
                    className={`w-full ${getAspectRatioClass(item.images[0]?.orientation)} relative cursor-pointer`}
                >
                    <FallbackImage
                        src={item.images[0]?.url || "/placeholder.jpg"}
                        alt={item.images[0]?.alt || item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {item.isFeatured && (
                        <span className="bg-brand-light absolute top-3 left-3 rounded px-2 py-1 text-xs font-medium text-white">
                            Featured
                        </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:scale-105 group-hover:bg-black/30">
                        <span className="font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                            <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </span>
                    </div>
                </button>
                <div className="p-4">
                    <Link href={`/work/${item.slug}`} className="text-brand-dark hover:text-brand-light font-semibold transition-colors">
                        {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 capitalize">{item.category}</p>
                </div>
            </m.div>
        </m.div>
    );
}

// ---------- WorkGrid ----------

export function WorkGrid({ items, itemsPerPage: itemsPerPageProp }: WorkGridProps) {
    const [viewportWidth, setViewportWidth] = useState(0);
    const [modalState, setModalState] = useState<{ item: PastWorkItem; itemIndex: number } | null>(null);
    const [filterState, dispatch] = useReducer(gridFilterReducer, filterInitial);
    const { filter, showFeatured, currentPage } = filterState;
    const gridRef = useRef<HTMLDivElement>(null);

    const scrollToTop = useCallback(() => {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    const { trackClickPastWork, trackViewPastWork } = useAnalytics();
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (typeof itemsPerPageProp === "number") return;

        const updateViewportWidth = () => setViewportWidth(window.innerWidth);
        const animationFrameId = window.requestAnimationFrame(updateViewportWidth);
        window.addEventListener("resize", updateViewportWidth);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", updateViewportWidth);
        };
    }, [itemsPerPageProp]);

    const itemsPerPage = typeof itemsPerPageProp === "number" ? itemsPerPageProp : getResponsiveItemsPerPage(viewportWidth);

    const filteredItems = useMemo(() => {
        let result = [...items];
        if (filter !== "all") result = result.filter(item => item.category === filter);
        if (showFeatured) result = result.filter(item => item.isFeatured);
        return result.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [items, filter, showFeatured]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const columnCount = getColumnCount(viewportWidth);
    const columnedItems = useMemo(() => {
        const cols: PastWorkItem[][] = Array.from({ length: columnCount }, () => []);
        paginatedItems.forEach((item, i) => cols[i % columnCount].push(item));
        return cols;
    }, [paginatedItems, columnCount]);
    const galleryGridClass = getGalleryGridClass(columnCount);

    const handleImageClick = useCallback(
        (item: PastWorkItem) => {
            trackClickPastWork(item.id, item.category);
            trackViewPastWork(item.id, item.category, "click");
            const itemIndex = filteredItems.findIndex(i => i.id === item.id);
            setModalState({ item, itemIndex });
        },
        [trackClickPastWork, trackViewPastWork, filteredItems]
    );

    const handleNavigateToItem = useCallback(
        (index: number) => {
            const newItem = filteredItems[index];
            if (newItem) setModalState({ item: newItem, itemIndex: index });
        },
        [filteredItems]
    );

    if (items.length === 0) {
        return (
            <section id="work" className="bg-brand-dark py-20">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Our Work</h2>
                    <p className="text-white/70">No previous work found. Check back soon for our portfolio.</p>
                </div>
            </section>
        );
    }

    return (
        <section id="work" ref={gridRef} className="bg-brand-light overflow-hidden py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <m.h2
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={shouldReduceMotion ? undefined : { duration: 0.6 }}
                    className="mb-8 text-center text-4xl leading-tight font-bold text-white drop-shadow-lg sm:text-5xl md:text-7xl"
                >
                    Our Work
                </m.h2>

                <WorkFilters
                    filter={filter}
                    showFeatured={showFeatured}
                    shouldReduceMotion={shouldReduceMotion}
                    onFilterChange={f => dispatch({ type: "SET_FILTER", filter: f })}
                    onFeaturedToggle={featured => dispatch({ type: "SET_FEATURED", showFeatured: featured })}
                />

                <AnimatePresence mode="wait">
                    {paginatedItems.length > 0 ? (
                        <div key={`${filter}-${String(showFeatured)}-${currentPage}`}>
                            <div className={galleryGridClass}>
                                {columnedItems.map((colItems, colIdx) => (
                                    <div key={colItems[0]?.id ?? colIdx} className="flex min-w-0 flex-col gap-5">
                                        {colItems.map(item => (
                                            <WorkCard
                                                key={item.id}
                                                item={item}
                                                shouldReduceMotion={shouldReduceMotion}
                                                onImageClick={handleImageClick}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <m.p
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                            className="text-center text-gray-500"
                        >
                            No items match your current filters.
                        </m.p>
                    )}
                </AnimatePresence>

                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => { dispatch({ type: "SET_PAGE", page: Math.max(1, currentPage - 1) }); scrollToTop(); }}
                            disabled={currentPage === 1}
                            className="rounded bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => { dispatch({ type: "SET_PAGE", page }); scrollToTop(); }}
                                    className={`h-10 w-10 rounded transition-colors ${
                                        currentPage === page ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => { dispatch({ type: "SET_PAGE", page: Math.min(totalPages, currentPage + 1) }); scrollToTop(); }}
                            disabled={currentPage === totalPages}
                            className="rounded bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}

                {modalState && (
                    <ImageModal
                        item={modalState.item}
                        allItems={filteredItems}
                        currentItemIndex={modalState.itemIndex}
                        onClose={() => setModalState(null)}
                        onNavigateToItem={handleNavigateToItem}
                        activeFilter={filter}
                        showFeatured={showFeatured}
                    />
                )}
            </div>
        </section>
    );
}
