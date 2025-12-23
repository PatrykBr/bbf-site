"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { FallbackImage } from "./FallbackImage";
import { ImageModal } from "./ImageModal";
import { useAnalytics } from "@/lib/posthog";
import type { PastWorkItem, WorkFilter, ImageOrientation } from "@/lib/types";

interface WorkGridProps {
    items: PastWorkItem[];
    itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 12;

const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1
};

// Get aspect ratio class based on image orientation
const getAspectRatioClass = (orientation: ImageOrientation = "landscape"): string => {
    switch (orientation) {
        case "portrait":
            return "aspect-[3/4]"; // Tall images
        case "square":
            return "aspect-square"; // 1:1
        case "landscape":
        default:
            return "aspect-[4/3]"; // Wide images
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 }
    }
};

export function WorkGrid({ items, itemsPerPage = ITEMS_PER_PAGE }: WorkGridProps) {
    const [filter, setFilter] = useState<WorkFilter>("all");
    const [showFeatured, setShowFeatured] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [modalState, setModalState] = useState<{
        item: PastWorkItem;
        itemIndex: number;
    } | null>(null);

    const { trackClickPastWork } = useAnalytics();

    // Filter and sort items
    const filteredItems = useMemo(() => {
        let result = [...items];

        // Apply category filter
        if (filter !== "all") {
            result = result.filter(item => item.category === filter);
        }

        // Apply featured filter
        if (showFeatured) {
            result = result.filter(item => item.isFeatured);
        }

        // Sort: featured first, then by date
        return result.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [items, filter, showFeatured]);

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    // Reset page when filter changes
    const handleFilterChange = useCallback((newFilter: WorkFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    }, []);

    const handleFeaturedToggle = useCallback((featured: boolean) => {
        setShowFeatured(featured);
        setCurrentPage(1);
    }, []);

    // Modal navigation - now navigates between different work items
    const handleImageClick = useCallback(
        (item: PastWorkItem) => {
            trackClickPastWork(item.id, item.category);
            const itemIndex = paginatedItems.findIndex(i => i.id === item.id);
            setModalState({ item, itemIndex });
        },
        [trackClickPastWork, paginatedItems]
    );

    const handleModalClose = useCallback(() => {
        setModalState(null);
    }, []);

    const handleNavigateToItem = useCallback(
        (index: number) => {
            const newItem = paginatedItems[index];
            if (newItem) {
                setModalState({ item: newItem, itemIndex: index });
            }
        },
        [paginatedItems]
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
        <section id="work" className="bg-brand-light overflow-hidden py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 text-center text-4xl leading-tight font-bold text-white drop-shadow-lg sm:text-5xl md:text-7xl"
                >
                    Our Work
                </motion.h2>

                {/* Filter Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8 flex flex-wrap justify-center gap-3"
                >
                    <div className="relative flex overflow-hidden rounded-xl bg-white/80 p-1 shadow-lg shadow-black/10 backdrop-blur-sm">
                        <button
                            onClick={() => handleFeaturedToggle(false)}
                            className="relative z-10 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
                        >
                            <span className={!showFeatured ? "text-white" : "text-brand-dark"}>View All</span>
                            {!showFeatured && (
                                <motion.div
                                    layoutId="activeWorkFilter"
                                    className="bg-brand-dark absolute inset-0 -z-10 rounded-lg shadow-md"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => handleFeaturedToggle(true)}
                            className="relative z-10 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors duration-300"
                        >
                            <span className={showFeatured ? "text-white" : "text-brand-dark"}>Featured Work</span>
                            {showFeatured && (
                                <motion.div
                                    layoutId="activeWorkFilter"
                                    className="bg-brand-dark absolute inset-0 -z-10 rounded-lg shadow-md"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Category Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-12 flex justify-center gap-2"
                >
                    {(["all", "wardrobe", "kitchen"] as const).map(cat => (
                        <motion.button
                            key={cat}
                            onClick={() => handleFilterChange(cat)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                filter === cat
                                    ? "bg-brand-dark text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {cat === "all" ? "All" : cat === "wardrobe" ? "Wardrobes" : "Kitchens"}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Masonry Grid */}
                <AnimatePresence mode="wait">
                    {paginatedItems.length > 0 ? (
                        <div key={`${filter}-${showFeatured}-${currentPage}`}>
                            <Masonry
                                breakpointCols={breakpointColumns}
                                className="masonry-grid"
                                columnClassName="masonry-grid_column"
                            >
                                {paginatedItems.map(item => (
                                    <motion.div
                                        key={item.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                    >
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="group relative overflow-hidden rounded-lg bg-gray-100 shadow-md transition-shadow hover:shadow-xl"
                                        >
                                            {/* Main Image */}
                                            <button
                                                onClick={() => handleImageClick(item)}
                                                className={`w-full ${getAspectRatioClass(item.images[0]?.orientation)} relative cursor-pointer`}
                                            >
                                                <FallbackImage
                                                    src={item.images[0]?.url || "/placeholder.jpg"}
                                                    alt={item.images[0]?.alt || item.name}
                                                    fill
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />

                                                {/* Featured Badge */}
                                                {item.isFeatured && (
                                                    <span className="bg-brand-light absolute top-3 left-3 rounded px-2 py-1 text-xs font-medium text-white">
                                                        Featured
                                                    </span>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:scale-105 group-hover:bg-black/30">
                                                    <span className="font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                        <svg
                                                            className="h-8 w-8"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
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

                                            {/* Info */}
                                            <div className="p-4">
                                                <Link
                                                    href={`/work/${item.slug}`}
                                                    className="text-brand-dark hover:text-brand-light font-semibold transition-colors"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="mt-1 text-sm text-gray-500 capitalize">{item.category}</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </Masonry>
                        </div>
                    ) : (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-500"
                        >
                            No items match your current filters.
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
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
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Modal */}
                {modalState && (
                    <ImageModal
                        item={modalState.item}
                        allItems={paginatedItems}
                        currentItemIndex={modalState.itemIndex}
                        onClose={handleModalClose}
                        onNavigateToItem={handleNavigateToItem}
                    />
                )}
            </div>
        </section>
    );
}
