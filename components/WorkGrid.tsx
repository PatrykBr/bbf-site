"use client";

import { useState, useReducer, useMemo, useCallback, useSyncExternalStore, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { m, useReducedMotion, type Variants } from "motion/react";
import { FallbackImage } from "./FallbackImage";
import { trackClickPastWork, trackViewPastWork } from "@/lib/posthog";
import type { PastWorkItem, WorkFilter } from "@/lib/types";
import { getAspectRatioClass } from "@/lib/utils";

// Keep the page mounted while the modal loads. The page loading boundary would
// remount it and reset the scroll position when a visitor first opens a project.
const ImageModal = dynamic(() => import("./ImageModal").then(mod => ({ default: mod.ImageModal })), {
    loading: () => null
});

interface WorkGridProps {
    items: PastWorkItem[];
}

const pageBreakpoints = [640, 1024, 1280];

function subscribeToBreakpoints(onChange: () => void) {
    const queries = pageBreakpoints.map(width => window.matchMedia(`(min-width: ${width}px)`));
    queries.forEach(query => query.addEventListener("change", onChange));
    return () => queries.forEach(query => query.removeEventListener("change", onChange));
}

function getPageSize() {
    if (window.matchMedia("(min-width: 1280px)").matches) return 16;
    if (window.matchMedia("(min-width: 1024px)").matches) return 12;
    if (window.matchMedia("(min-width: 640px)").matches) return 8;
    return 5;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
                className="mb-8 flex flex-wrap justify-center gap-3"
            >
                <div className="relative flex overflow-hidden rounded-xl bg-white/80 p-1 shadow-lg shadow-black/10 backdrop-blur-sm">
                    <button
                        type="button"
                        aria-pressed={!showFeatured}
                        onClick={() => onFeaturedToggle(false)}
                        className="relative z-10 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
                    >
                        <span className={!showFeatured ? "text-white" : "text-brand-dark"}>View all</span>
                        {!showFeatured && (
                            <m.div
                                layoutId="activeWorkFilter"
                                className="bg-brand-dark absolute inset-0 -z-10 rounded-lg shadow-md"
                                transition={
                                    shouldReduceMotion
                                        ? { duration: 0 }
                                        : { type: "spring", stiffness: 400, damping: 30 }
                                }
                            />
                        )}
                    </button>
                    <button
                        type="button"
                        aria-pressed={showFeatured}
                        onClick={() => onFeaturedToggle(true)}
                        className="relative z-10 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
                    >
                        <span className={showFeatured ? "text-white" : "text-brand-dark"}>Featured work</span>
                        {showFeatured && (
                            <m.div
                                layoutId="activeWorkFilter"
                                className="bg-brand-dark absolute inset-0 -z-10 rounded-lg shadow-md"
                                transition={
                                    shouldReduceMotion
                                        ? { duration: 0 }
                                        : { type: "spring", stiffness: 400, damping: 30 }
                                }
                            />
                        )}
                    </button>
                </div>
            </m.div>

            <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
                className="mb-12 flex justify-center gap-2"
            >
                {(["all", "wardrobe", "kitchen"] as const).map(cat => (
                    <m.button
                        key={cat}
                        type="button"
                        aria-pressed={filter === cat}
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

interface WorkCardProps {
    item: PastWorkItem;
    shouldReduceMotion: boolean | null;
    onImageClick: (item: PastWorkItem) => void;
}

function WorkCard({ item, shouldReduceMotion, onImageClick }: WorkCardProps) {
    return (
        <m.div
            className="break-inside-avoid"
            variants={itemVariants}
            initial={"hidden"}
            whileInView={"visible"}
            viewport={{ once: true, margin: "-50px" }}
        >
            <m.div
                whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                className="group relative overflow-hidden rounded-lg bg-gray-100 shadow-md transition-shadow hover:shadow-xl"
            >
                <button
                    type="button"
                    onClick={() => onImageClick(item)}
                    className={`w-full ${getAspectRatioClass(item.images[0].orientation)} relative cursor-pointer`}
                >
                    <FallbackImage
                        src={item.images[0].url}
                        alt={item.images[0].alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    {item.isFeatured && (
                        <span className="bg-brand-light absolute top-3 left-3 rounded px-2 py-1 text-xs font-medium text-white">
                            Featured
                        </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:scale-105 group-hover:bg-black/30">
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
                <div className="p-4">
                    <Link
                        href={`/work/${item.slug}`}
                        className="text-brand-dark hover:text-brand-light font-semibold transition-colors"
                    >
                        {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 capitalize">{item.category}</p>
                </div>
            </m.div>
        </m.div>
    );
}

export function WorkGrid({ items }: WorkGridProps) {
    const itemsPerPage = useSyncExternalStore(subscribeToBreakpoints, getPageSize, () => 5);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [filterState, dispatch] = useReducer(gridFilterReducer, filterInitial);
    const { filter, showFeatured } = filterState;
    const gridRef = useRef<HTMLElement>(null);

    const shouldReduceMotion = useReducedMotion();
    const scrollToTop = () =>
        gridRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth", block: "start" });

    // Keep the server's portfolio order when filtering.
    const filteredItems = useMemo(
        () =>
            items.filter(item => (filter === "all" || item.category === filter) && (!showFeatured || item.isFeatured)),
        [items, filter, showFeatured]
    );
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentPage = Math.min(filterState.currentPage, Math.max(1, totalPages));
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(start, start + itemsPerPage);
    const selectedItem = selectedIndex === null ? undefined : filteredItems[selectedIndex];

    const handleImageClick = useCallback(
        (item: PastWorkItem) => {
            trackClickPastWork(item.id, item.category);
            trackViewPastWork(item.id, item.category, "click");
            const itemIndex = filteredItems.findIndex(i => i.id === item.id);
            setSelectedIndex(itemIndex);
        },
        [filteredItems]
    );

    if (items.length === 0) {
        return (
            <section id="work" className="bg-brand-dark py-20">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Our work</h2>
                    <p className="text-white/70">There are no projects to display yet.</p>
                </div>
            </section>
        );
    }

    return (
        <section id="work" ref={gridRef} className="bg-brand-light overflow-hidden py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <m.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
                    className="mb-8 text-center text-4xl leading-tight font-bold text-white drop-shadow-lg sm:text-5xl md:text-7xl"
                >
                    Our work
                </m.h2>

                <WorkFilters
                    filter={filter}
                    showFeatured={showFeatured}
                    shouldReduceMotion={shouldReduceMotion}
                    onFilterChange={f => dispatch({ type: "SET_FILTER", filter: f })}
                    onFeaturedToggle={featured => dispatch({ type: "SET_FEATURED", showFeatured: featured })}
                />

                {paginatedItems.length > 0 ? (
                    <div key={`${filter}-${String(showFeatured)}-${currentPage}`}>
                        <div className="mx-auto max-w-md columns-1 gap-5 space-y-5 sm:max-w-3xl sm:columns-2 lg:max-w-5xl lg:columns-3 xl:max-w-none xl:columns-4">
                            {paginatedItems.map(item => (
                                <WorkCard
                                    key={item.id}
                                    item={item}
                                    shouldReduceMotion={shouldReduceMotion}
                                    onImageClick={handleImageClick}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500">
                        No projects match these filters. Try another category or view all work.
                    </m.p>
                )}

                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                dispatch({ type: "SET_PAGE", page: Math.max(1, currentPage - 1) });
                                scrollToTop();
                            }}
                            disabled={currentPage === 1}
                            className="rounded bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    aria-label={`Page ${page}`}
                                    aria-current={currentPage === page ? "page" : undefined}
                                    type="button"
                                    onClick={() => {
                                        dispatch({ type: "SET_PAGE", page });
                                        scrollToTop();
                                    }}
                                    className={`h-10 w-10 rounded transition-colors ${
                                        currentPage === page
                                            ? "bg-brand-dark text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                dispatch({ type: "SET_PAGE", page: Math.min(totalPages, currentPage + 1) });
                                scrollToTop();
                            }}
                            disabled={currentPage === totalPages}
                            className="rounded bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}

                {selectedItem && selectedIndex !== null && (
                    <ImageModal
                        item={selectedItem}
                        allItems={filteredItems}
                        currentItemIndex={selectedIndex}
                        onClose={() => setSelectedIndex(null)}
                        onNavigateToItem={setSelectedIndex}
                        activeFilter={filter}
                        showFeatured={showFeatured}
                    />
                )}
            </div>
        </section>
    );
}
