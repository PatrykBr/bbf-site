"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";
import { useSearchParams } from "next/navigation";

import { WorkImage, categories } from "../types/work";
import { WorkEvents, ViewSource } from "../constants/analytics";
import { MODAL_SCROLL_DELAY, INITIAL_IMAGES_TO_LOAD } from "../constants/config";
import {
    processImages,
    arrangeImagesForVisualFlow,
    getFileName,
    getImageDimensions,
    getAdjacentImage
} from "../utils/imageUtils";
import { imageData } from "../data/images";
import ImageModal from "./ImageModal";

// Dynamically import the Masonry component to avoid hydration mismatch
const ResponsiveMasonry = dynamic(() => import("react-responsive-masonry").then(mod => mod.ResponsiveMasonry), {
    ssr: false
});

const Masonry = dynamic(() => import("react-responsive-masonry").then(mod => mod.default), { ssr: false });

const Work = () => {
    const [selectedCategory, setSelectedCategory] = useState("Featured");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<WorkImage | null>(null);
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    const images = useMemo(() => {
        const processedImageData = processImages(imageData);
        return arrangeImagesForVisualFlow(processedImageData);
    }, []);

    useEffect(() => {
        const { style } = document.body;
        const previousOverflow = style.overflow;

        style.overflow = modalOpen ? "hidden" : "";

        return () => {
            style.overflow = previousOverflow;
        };
    }, [modalOpen]);

    useEffect(() => {
        const imageSlug = searchParams.get("image");
        const category = searchParams.get("category");

        if (category && categories.includes(category as (typeof categories)[number])) {
            setSelectedCategory(category as (typeof categories)[number]);
        }

        if (imageSlug) {
            const image = images.find(img => img.slug === imageSlug);
            if (image) {
                setSelectedImage(image);
                setModalOpen(true);
                capturePhotoView(image, ViewSource.SHARED_LINK);
            }
        }
    }, [searchParams, posthog, images]);

    // Filter images based on selected category
    const filteredImages = useMemo(() => {
        switch (selectedCategory) {
            case "Featured":
                return images.filter(img => img.featured);
            case "All":
                return images;
            default:
                return images.filter(img => img.category === selectedCategory);
        }
    }, [images, selectedCategory]);

    const capturePhotoView = (image: WorkImage, viewSource: ViewSource) => {
        posthog.capture(WorkEvents.PHOTO_VIEW, {
            category: image.category,
            file_name: getFileName(image.src),
            view_source: viewSource
        });
    };

    const handleModalClose = () => {
        setModalOpen(false);
        const url = new URL(window.location.toString());
        url.searchParams.delete("image");
        window.history.replaceState({}, "", url);

        setTimeout(() => {
            document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
        }, MODAL_SCROLL_DELAY);
    };

    const handleImageClick = (image: WorkImage) => {
        if (!image.slug) return;

        setSelectedImage(image);
        setModalOpen(true);
        const url = new URL(window.location.toString());
        url.searchParams.set("image", image.slug);
        window.history.replaceState({}, "", url);
        capturePhotoView(image, ViewSource.GALLERY_CLICK);
    };

    const navigateImage = (direction: "next" | "prev") => {
        if (!selectedImage?.slug || filteredImages.length === 0) return;

        const adjacentImage = getAdjacentImage(filteredImages, selectedImage, direction);
        if (!adjacentImage?.slug) return;

        setSelectedImage(adjacentImage);
        const url = new URL(window.location.toString());
        url.searchParams.set("image", adjacentImage.slug);
        window.history.replaceState({}, "", url);
    };

    return (
        <section id="work" className="bg-secondary py-16">
            <div className="container mx-auto px-4">
                <h2 className="mb-12 text-center text-4xl font-bold text-white">Our Work</h2>

                {/* Featured/View All Toggle */}
                <div className="mb-6 flex justify-center">
                    <button
                        onClick={() => setSelectedCategory("All")}
                        className={`cursor-pointer rounded-l-full px-4 py-3 text-sm transition-all sm:px-8 sm:text-lg ${
                            selectedCategory === "All" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                        <span className="sm:hidden">All</span>
                        <span className="hidden sm:inline">View All</span>
                    </button>
                    <div className="bg-white">
                        <div className="h-full w-px bg-gray-300"></div>
                    </div>
                    <button
                        onClick={() => setSelectedCategory("Featured")}
                        className={`cursor-pointer rounded-r-full px-4 py-3 text-sm transition-all sm:px-8 sm:text-lg ${
                            selectedCategory === "Featured" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                        <span className="sm:hidden">Featured</span>
                        <span className="hidden sm:inline">Featured Work</span>
                    </button>
                </div>

                {/* Category Filter - Only shown when viewing all */}
                {selectedCategory !== "Featured" && (
                    <div className="mb-10 flex flex-wrap justify-center gap-4">
                        {categories
                            .filter(cat => !["All", "Featured"].includes(cat))
                            .map(category => (
                                <button
                                    key={category}
                                    data-category={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        const url = new URL(window.location.toString());
                                        url.searchParams.set("category", category);
                                        window.history.replaceState({}, "", url);
                                    }}
                                    className={`cursor-pointer rounded-full px-6 py-2 transition-all ${
                                        selectedCategory === category
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 hover:bg-gray-200"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                    </div>
                )}

                {/* Image Gallery */}
                {images.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="gallery-container"
                    >
                        <ResponsiveMasonry
                            columnsCountBreakPoints={{
                                350: 1,
                                750: 2,
                                900: 3
                            }}
                        >
                            <Masonry gutter="1rem">
                                {filteredImages.map((image, index) => (
                                    <motion.div
                                        key={image.slug}
                                        layoutId={image.slug}
                                        onClick={() => handleImageClick(image)}
                                        className="transform cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                                        itemScope
                                        itemType="https://schema.org/ImageObject"
                                    >
                                        <meta itemProp="name" content={image.name} />
                                        <meta
                                            itemProp="description"
                                            content={
                                                image.description ||
                                                `${image.name} - ${image.category} custom furniture`
                                            }
                                        />
                                        <meta
                                            itemProp="contentUrl"
                                            content={`https://www.broncelfurniture.com${image.src}`}
                                        />
                                        <link
                                            itemProp="url"
                                            href={`https://www.broncelfurniture.com/work?image=${image.slug}`}
                                        />
                                        <div className="relative w-full">
                                            <div
                                                className={
                                                    image.aspectRatio === "landscape"
                                                        ? "aspect-w-16 aspect-h-9"
                                                        : "aspect-w-9 aspect-h-16"
                                                }
                                            >
                                                <Image
                                                    src={image.src}
                                                    alt={`${image.name} - Custom furniture handcrafted by Bespoke Broncel Furniture in Yorkshire`}
                                                    width={getImageDimensions(image.aspectRatio).width}
                                                    height={getImageDimensions(image.aspectRatio).height}
                                                    className="h-full w-full rounded-lg object-cover"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    quality={90}
                                                    priority={index < INITIAL_IMAGES_TO_LOAD}
                                                    loading={index < INITIAL_IMAGES_TO_LOAD ? "eager" : "lazy"}
                                                    title={`${image.name} | Bespoke Broncel Furniture Gallery`}
                                                />
                                                <script
                                                    type="application/ld+json"
                                                    dangerouslySetInnerHTML={{
                                                        __html: JSON.stringify({
                                                            "@context": "https://schema.org",
                                                            "@type": "ImageObject",
                                                            contentUrl: `https://www.broncelfurniture.com${image.src}`,
                                                            url: `https://www.broncelfurniture.com/work?image=${image.slug}`,
                                                            name: image.name,
                                                            description:
                                                                image.description ||
                                                                `${image.name} - ${image.category} custom furniture by Bespoke Broncel Furniture`,
                                                            caption: `${image.category} custom furniture handcrafted by Bespoke Broncel Furniture in Yorkshire`,
                                                            width: getImageDimensions(image.aspectRatio).width,
                                                            height: getImageDimensions(image.aspectRatio).height,
                                                            creator: {
                                                                "@type": "Organization",
                                                                name: "Bespoke Broncel Furniture",
                                                                url: "https://www.broncelfurniture.com"
                                                            },
                                                            creditText: "Bespoke Broncel Furniture",
                                                            copyrightNotice:
                                                                "© 2025 Bespoke Broncel Furniture. All rights reserved.",
                                                            license: "https://www.broncelfurniture.com/terms",
                                                            acquireLicensePage:
                                                                "https://www.broncelfurniture.com/contact",
                                                            keywords: `${image.category.toLowerCase()}, bespoke furniture, custom furniture, handmade, yorkshire, ${image.category.toLowerCase()} yorkshire`,
                                                            locationCreated: {
                                                                "@type": "Place",
                                                                name: "South Yorkshire, United Kingdom"
                                                            },
                                                            isPartOf: {
                                                                "@type": "ImageGallery",
                                                                name: "Bespoke Broncel Furniture Gallery",
                                                                url: "https://www.broncelfurniture.com/work"
                                                            }
                                                        })
                                                    }}
                                                />
                                            </div>
                                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100">
                                                <div className="w-full min-w-0 p-4 text-white lg:p-6">
                                                    <h3 className="truncate text-lg font-medium lg:text-xl">
                                                        {image.name}
                                                    </h3>
                                                    <p className="mt-1 truncate text-xs opacity-90 lg:text-sm">
                                                        {image.category} | Bespoke Broncel Furniture
                                                    </p>
                                                    {image.description && (
                                                        <p className="mt-2 line-clamp-2 hidden text-xs opacity-80 lg:block">
                                                            {image.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </Masonry>
                        </ResponsiveMasonry>
                    </motion.div>
                ) : (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-pulse text-center">
                            <div className="text-2xl">Loading gallery...</div>
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                <ImageModal
                    isOpen={modalOpen}
                    onClose={handleModalClose}
                    image={selectedImage!}
                    onNext={() => navigateImage("next")}
                    onPrev={() => navigateImage("prev")}
                    prevImage={
                        selectedImage && filteredImages.length > 0
                            ? getAdjacentImage(filteredImages, selectedImage, "prev")
                            : undefined
                    }
                    nextImage={
                        selectedImage && filteredImages.length > 0
                            ? getAdjacentImage(filteredImages, selectedImage, "next")
                            : undefined
                    }
                />
            </div>
        </section>
    );
};

export default Work;
