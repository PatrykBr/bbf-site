"use client";

import { useState } from "react";
import Link from "next/link";
import { ProjectList } from "./ProjectList";
import type { PastWorkItem, WorkFilter } from "@/lib/types";

const HOME_PROJECT_LIMIT = 12;

export function WorkGrid({ items }: { items: PastWorkItem[] }) {
    const [filter, setFilter] = useState<WorkFilter>("all");
    const filteredItems = items.filter(item => filter === "all" || item.category === filter);
    const visibleItems = filteredItems.slice(0, HOME_PROJECT_LIMIT);
    const archiveHref =
        filter === "kitchen" ? "/fitted-kitchens" : filter === "wardrobe" ? "/fitted-wardrobes" : "/work";
    const categoryLabel = filter === "kitchen" ? "kitchens" : filter === "wardrobe" ? "wardrobes" : "projects";

    return (
        <section id="work" className="bg-brand-light py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-center text-4xl leading-tight font-bold text-white sm:text-5xl md:text-7xl">
                    Our work
                </h2>
                <div role="group" aria-label="Filter projects" className="mb-8 flex justify-center gap-2">
                    {(["all", "wardrobe", "kitchen"] as const).map(category => (
                        <button
                            key={category}
                            type="button"
                            aria-pressed={filter === category}
                            onClick={() => setFilter(category)}
                            className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-white ${filter === category ? "bg-brand-dark text-white" : "text-brand-dark bg-white hover:bg-gray-100"}`}
                        >
                            {category === "all" ? "All" : category === "wardrobe" ? "Wardrobes" : "Kitchens"}
                        </button>
                    ))}
                </div>
                <p className="sr-only" aria-live="polite">
                    Showing {visibleItems.length} of {filteredItems.length} {categoryLabel}
                </p>
                {visibleItems.length > 0 ? (
                    <ProjectList key={filter} items={visibleItems} browseItems={filteredItems} />
                ) : (
                    <p className="text-center text-white">There are no {categoryLabel} to display yet.</p>
                )}
                <div className="mt-8 flex justify-center">
                    <Link
                        href={archiveHref}
                        className="bg-brand-dark inline-flex min-h-12 items-center justify-center rounded-lg px-7 py-3 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg focus-visible:outline-white"
                    >
                        View all {filteredItems.length} {categoryLabel}
                    </Link>
                </div>
            </div>
        </section>
    );
}
