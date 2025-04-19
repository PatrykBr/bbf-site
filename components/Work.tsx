"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";
import { useSearchParams } from "next/navigation";
import { Metadata } from "next";

import { WorkImage, categories } from "../types/work";
import { WorkEvents, ViewSource } from "../constants/analytics";
import {
  processImages,
  arrangeImagesForVisualFlow,
  getFileName,
  getImageDimensions,
} from "../utils/imageUtils";
import { imageData } from "../data/images";
import ImageModal from "./ImageModal";
import { generateGalleryMetadata } from "../lib/seo/metadata";

// Dynamically import the Masonry component to avoid hydration mismatch
const ResponsiveMasonry = dynamic(
  () => import("react-responsive-masonry").then((mod) => mod.ResponsiveMasonry),
  { ssr: false }
);

const Masonry = dynamic(
  () => import("react-responsive-masonry").then((mod) => mod.default),
  { ssr: false }
);

// Add metadata generation for the gallery
export async function generateMetadata(): Promise<Metadata> {
  return generateGalleryMetadata();
}

const Work = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-16">
          <div className="animate-pulse text-center">
            <div className="text-2xl">Loading gallery...</div>
          </div>
        </div>
      }
    >
      <WorkContent />
    </Suspense>
  );
};

// Separate component for the content to use hooks that need Suspense
const WorkContent = () => {
  const [selectedCategory, setSelectedCategory] = useState("Featured");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<WorkImage | null>(null);
  const [images, setImages] = useState<WorkImage[]>([]);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Initialize images with processed slugs and arranged for visual flow
    const processedImageData = processImages(imageData);
    const arrangedImages = arrangeImagesForVisualFlow(processedImageData);
    setImages(arrangedImages);

    // Check URL parameters for direct image viewing or category selection
    const imageSlug = searchParams.get("image");
    const category = searchParams.get("category");

    if (
      category &&
      categories.includes(category as (typeof categories)[number])
    ) {
      setSelectedCategory(category as (typeof categories)[number]);
    }

    if (imageSlug) {
      const image = arrangedImages.find((img) => img.slug === imageSlug);
      if (image) {
        setSelectedImage(image);
        setModalOpen(true);
        // Disable scrolling when modal is opened via URL
        document.body.style.overflow = "hidden";
        setSelectedCategory(image.category);
        posthog?.capture(WorkEvents.PHOTO_VIEW, {
          category: image.category,
          file_name: getFileName(image.src),
          view_source: ViewSource.SHARED_LINK,
        });
      }
    }
  }, [searchParams, posthog]);

  // Filter images based on selected category
  const filteredImages =
    selectedCategory === "Featured"
      ? images.filter((img) => img.featured)
      : selectedCategory === "All"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    // Re-enable scrolling
    document.body.style.overflow = "auto";
    // Clear the image parameter from URL without causing a refresh
    const url = new URL(window.location.toString());
    url.searchParams.delete("image");
    window.history.replaceState({}, "", url);

    // Scroll to Work section after a brief delay to ensure modal transition is complete
    setTimeout(() => {
      document.getElementById("Work")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Handle image click
  const handleImageClick = (image: WorkImage) => {
    if (!image.slug) return;

    setSelectedImage(image);
    setModalOpen(true);
    // Disable scrolling
    document.body.style.overflow = "hidden";
    // Update URL without causing a refresh
    const url = new URL(window.location.toString());
    url.searchParams.set("image", image.slug);
    window.history.replaceState({}, "", url);
    posthog?.capture(WorkEvents.PHOTO_VIEW, {
      category: image.category,
      file_name: getFileName(image.src),
      view_source: ViewSource.GALLERY_CLICK,
    });
  };

  // Get next image
  const getNextImage = () => {
    if (!selectedImage?.slug) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.slug === selectedImage.slug
    );
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    const nextImage = filteredImages[nextIndex];
    if (!nextImage.slug) return;

    setSelectedImage(nextImage);
    // Update URL without causing a refresh
    const url = new URL(window.location.toString());
    url.searchParams.set("image", nextImage.slug);
    window.history.replaceState({}, "", url);
  };

  // Get previous image
  const getPrevImage = () => {
    if (!selectedImage?.slug) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.slug === selectedImage.slug
    );
    const prevIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    const prevImage = filteredImages[prevIndex];
    if (!prevImage.slug) return;

    setSelectedImage(prevImage);
    // Update URL without causing a refresh
    const url = new URL(window.location.toString());
    url.searchParams.set("image", prevImage.slug);
    window.history.replaceState({}, "", url);
  };

  return (
    <section id="work" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl text-white font-bold text-center mb-12">
          Our Work
        </h2>

        {/* Featured/View All Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setSelectedCategory("Featured")}
            className={`px-8 py-3 rounded-l-full transition-all text-lg ${
              selectedCategory === "Featured"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Featured Work
          </button>
          <div className="bg-white">
            <div className="w-px h-full bg-gray-300"></div>
          </div>
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-8 py-3 rounded-r-full transition-all text-lg ${
              selectedCategory === "All"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            View All
          </button>
        </div>

        {/* Category Filter - Only shown when viewing all */}
        {selectedCategory !== "Featured" && (
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {categories
              .filter((cat) => !["All", "Featured"].includes(cat))
              .map((category) => (
                <button
                  key={category}
                  data-category={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    // Update URL without causing a refresh
                    const url = new URL(window.location.toString());
                    url.searchParams.set("category", category);
                    window.history.replaceState({}, "", url);
                  }}
                  className={`px-6 py-2 rounded-full transition-all ${
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

        {/* Image Gallery - Only rendered client-side */}
        {isClient && images.length > 0 ? (
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
                900: 3,
              }}
            >
              <Masonry gutter="1rem">
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.slug}
                    layoutId={image.slug}
                    onClick={() => handleImageClick(image)}
                    className="cursor-pointer transform transition-transform duration-300 hover:scale-[1.02]"
                  >
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
                          alt={`${image.name} - ${image.category} custom furniture by Bespoke Broncel Furniture`}
                          width={getImageDimensions(image.aspectRatio).width}
                          height={getImageDimensions(image.aspectRatio).height}
                          className="object-cover w-full h-full rounded-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={90}
                          priority={filteredImages.indexOf(image) < 6}
                          loading={
                            filteredImages.indexOf(image) < 6 ? "eager" : "lazy"
                          }
                          title={image.name}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-6 w-full text-white">
                          <h3 className="text-xl font-medium">{image.name}</h3>
                          <p className="text-sm opacity-90 mt-1">
                            {image.category}
                          </p>
                          <meta itemProp="name" content={image.name} />
                          <meta
                            itemProp="description"
                            content={`${image.name} - ${image.category} custom furniture by Bespoke Broncel Furniture`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          </motion.div>
        ) : (
          <div className="flex justify-center items-center py-16">
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
          onNext={getNextImage}
          onPrev={getPrevImage}
          prevImage={
            selectedImage
              ? filteredImages[
                  (filteredImages.findIndex(
                    (img) => img.slug === selectedImage.slug
                  ) -
                    1 +
                    filteredImages.length) %
                    filteredImages.length
                ]
              : undefined
          }
          nextImage={
            selectedImage
              ? filteredImages[
                  (filteredImages.findIndex(
                    (img) => img.slug === selectedImage.slug
                  ) +
                    1) %
                    filteredImages.length
                ]
              : undefined
          }
        />
      </div>
    </section>
  );
};

export default Work;
