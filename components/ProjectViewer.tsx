"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Modal } from "./Modal";
import { FallbackImage } from "./FallbackImage";
import { ContactAction } from "./ContactAction";
import { trackViewPastWork } from "@/lib/posthog";
import type { PastWorkItem } from "@/lib/types";

export function ProjectViewer({
    items,
    initialIndex,
    onClose
}: {
    items: PastWorkItem[];
    initialIndex: number;
    onClose: () => void;
}) {
    const [index, setIndex] = useState(initialIndex);
    const activeIndex = useRef(initialIndex);
    const scroller = useRef<HTMLDivElement>(null);
    const item = items[index];
    const nextItem = items[index + 1];

    useLayoutEffect(() => {
        const element = scroller.current!;
        const align = () => element.scrollTo({ top: activeIndex.current * element.clientHeight, behavior: "instant" });
        align();
        const observer = new ResizeObserver(align);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const navigate = (step: number) => {
        const element = scroller.current!;
        const nextIndex = Math.max(0, Math.min(items.length - 1, activeIndex.current + step));
        element.scrollTo({
            top: nextIndex * element.clientHeight,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
        });
    };

    return (
        <Modal
            label="Project viewer"
            onClose={onClose}
            onKeyDown={event => {
                if (["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "PageDown", "PageUp"].includes(event.key)) {
                    event.preventDefault();
                    navigate(["ArrowDown", "ArrowRight", "PageDown"].includes(event.key) ? 1 : -1);
                }
            }}
        >
            <div
                ref={scroller}
                data-project-feed
                className="h-full w-full touch-pan-y snap-y snap-mandatory [scrollbar-width:none] overflow-y-auto overscroll-y-contain bg-black lg:pr-80 [&::-webkit-scrollbar]:hidden"
                onScroll={event => {
                    const element = event.currentTarget;
                    const nextIndex = Math.max(
                        0,
                        Math.min(items.length - 1, Math.round(element.scrollTop / element.clientHeight))
                    );
                    if (nextIndex === activeIndex.current) return;
                    activeIndex.current = nextIndex;
                    setIndex(nextIndex);
                    const next = items[nextIndex];
                    trackViewPastWork(next.id, next.category, "navigation");
                }}
            >
                {items.map((project, projectIndex) => (
                    <div
                        key={project.id}
                        className="relative h-full w-full snap-start snap-always"
                        role="group"
                        aria-label={project.name}
                    >
                        <div className="absolute inset-x-4 top-16 bottom-44 mx-auto max-w-6xl sm:inset-x-8 sm:bottom-40 lg:inset-4 lg:max-w-none">
                            <FallbackImage
                                src={project.images[0].url}
                                alt={project.images[0].alt}
                                fill
                                preload={projectIndex === initialIndex}
                                className="object-contain"
                                sizes="(min-width: 1024px) calc(100vw - 352px), 100vw"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex items-center justify-between gap-4 sm:inset-x-8">
                <p className="rounded-full bg-black/70 px-4 py-2 text-sm" aria-live="polite">
                    Project {index + 1} of {items.length}
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-black/70 hover:bg-black focus-visible:outline-white"
                    aria-label="Close project viewer"
                >
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path d="m6 6 12 12M6 18 18 6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
            <div className="absolute top-1/2 right-2 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-6 lg:top-auto lg:bottom-6 lg:translate-y-0 lg:flex-row">
                <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => navigate(-1)}
                    className="flex size-11 items-center justify-center rounded-full bg-black/70 hover:bg-black focus-visible:outline-white disabled:opacity-35"
                    aria-label="Previous project"
                >
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path d="m6 15 6-6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => navigate(1)}
                    className="flex size-11 items-center justify-center rounded-full bg-black/70 hover:bg-black focus-visible:outline-white disabled:opacity-35"
                    aria-label="Next project"
                >
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
            <div className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] mx-auto max-w-2xl space-y-3 text-center lg:inset-y-0 lg:right-0 lg:left-auto lg:mx-0 lg:flex lg:w-80 lg:max-w-none lg:flex-col lg:space-y-0 lg:overflow-y-auto lg:border-l lg:border-white/10 lg:bg-black lg:px-6 lg:pt-24 lg:pb-24 lg:text-left">
                <h2 className="text-lg leading-snug font-semibold sm:text-xl">{item.name}</h2>
                <p className="mt-4 hidden text-sm leading-relaxed text-white/85 lg:block">{item.description}</p>
                <p className="text-xs text-white/85 lg:mt-4">
                    {index === items.length - 1 ? (
                        "Last project"
                    ) : (
                        <>
                            <span className="sm:hidden">Swipe up to see the next project</span>
                            <span className="hidden sm:inline">Scroll to see the next project</span>
                        </>
                    )}
                </p>
                <div className="flex justify-center gap-3 lg:mt-6 lg:flex-col">
                    <Link
                        href={`/work/${item.slug}`}
                        onClick={onClose}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/40 bg-black/60 px-4 py-3 text-sm font-semibold focus-visible:outline-white"
                    >
                        Project details
                    </Link>
                    <ContactAction
                        projectSlug={item.slug}
                        onClick={onClose}
                        className="text-brand-dark inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold focus-visible:outline-white"
                    >
                        Ask about this project
                    </ContactAction>
                </div>
                {nextItem && (
                    <button
                        type="button"
                        onClick={() => navigate(1)}
                        aria-label={`Next project: ${nextItem.name}`}
                        className="mt-auto hidden shrink-0 pt-6 text-left focus-visible:outline-white lg:block [@media(max-height:800px)]:hidden"
                    >
                        <span className="text-xs text-white/85">Next project</span>
                        <span className="relative mt-2 block h-36 overflow-hidden rounded-lg">
                            <FallbackImage
                                src={nextItem.images[0].url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="272px"
                            />
                        </span>
                        <span className="mt-2 block text-sm font-semibold">{nextItem.name}</span>
                    </button>
                )}
            </div>
        </Modal>
    );
}
