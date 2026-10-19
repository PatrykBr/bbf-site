"use client";

import { useState } from "react";
import { FallbackImage } from "./FallbackImage";
import { Modal } from "./Modal";
import type { PastWorkItem } from "@/lib/types";
import { ContactAction } from "./ContactAction";

export function ImageGallery({
    images,
    name,
    initialIndex,
    onClose,
    onView,
    projectSlug
}: {
    images: PastWorkItem["images"];
    name: string;
    initialIndex: number;
    onClose: () => void;
    onView: () => void;
    projectSlug: string;
}) {
    const [index, setIndex] = useState(initialIndex);
    const select = (next: number) => {
        if (next === index) return;
        setIndex(next);
        onView();
    };
    const navigate = (direction: number) => select((index + direction + images.length) % images.length);

    return (
        <Modal
            label={`${name} gallery`}
            onClose={onClose}
            onKeyDown={event => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    navigate(event.key === "ArrowLeft" ? -1 : 1);
                }
            }}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full bg-black/60 px-4 py-3 hover:bg-black"
                aria-label="Close gallery"
            >
                ✕
            </button>
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="absolute top-1/2 left-2 z-10 rounded-full bg-black/60 px-4 py-3 text-2xl hover:bg-black"
                        aria-label="Previous image"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(1)}
                        className="absolute top-1/2 right-2 z-10 rounded-full bg-black/60 px-4 py-3 text-2xl hover:bg-black"
                        aria-label="Next image"
                    >
                        ›
                    </button>
                </>
            )}
            <div className="absolute inset-x-4 top-16 bottom-44 mx-auto max-w-5xl sm:top-12 sm:bottom-40">
                <FallbackImage
                    key={images[index].url}
                    src={images[index].url}
                    alt={images[index].alt}
                    fill
                    className="gallery-photo object-contain"
                    sizes="(max-width: 1024px) 100vw, 1024px"
                />
            </div>
            <div className="absolute right-0 bottom-4 left-0 space-y-3 px-4 text-center">
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 overflow-x-auto">
                        {images.map((image, i) => (
                            <button
                                key={image.url}
                                type="button"
                                onClick={() => select(i)}
                                aria-label={`View image ${i + 1}`}
                                aria-pressed={i === index}
                                className={`relative size-12 shrink-0 overflow-hidden rounded border-2 ${i === index ? "border-white" : "border-transparent opacity-60"}`}
                            >
                                <FallbackImage src={image.url} alt="" fill className="object-cover" sizes="48px" />
                            </button>
                        ))}
                    </div>
                )}
                <p className="text-sm" aria-live="polite">
                    {name} • {index + 1} of {images.length}
                </p>
                <ContactAction
                    projectSlug={projectSlug}
                    onClick={onClose}
                    className="text-brand-dark inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold focus-visible:outline-white"
                >
                    Ask about this project
                </ContactAction>
            </div>
        </Modal>
    );
}
