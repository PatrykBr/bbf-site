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
  return {
    other: {
      "json-ld": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        name: "Bespoke Broncel Furniture Gallery",
        description:
          "Gallery of our custom-made furniture including kitchens, wardrobes, and other bespoke pieces",
        image: imageData.map((img) => ({
          "@type": "ImageObject",
          contentUrl: img.src,
          name: img.name,
          description: `${img.name} - ${img.category} by Bespoke Broncel Furniture`,
          caption: img.category,
        })),
      }),
    },
  };
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
  const [selectedCategory, setSelectedCategory] = useState("All");
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

    // Check URL parameters for direct image viewing
    const imageSlug = searchParams.get("image");
    if (imageSlug) {
      const image = arrangedImages.find((img) => img.slug === imageSlug);
      if (image) {
        setSelectedImage(image);
        setModalOpen(true);
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
    selectedCategory === "All"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  // Handle image click
  const handleImageClick = (image: WorkImage) => {
    setSelectedImage(image);
    setModalOpen(true);
    posthog?.capture(WorkEvents.PHOTO_VIEW, {
      category: image.category,
      file_name: getFileName(image.src),
      view_source: ViewSource.GALLERY_CLICK,
    });
  };

  // Get next image
  const getNextImage = () => {
    if (!selectedImage) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.slug === selectedImage.slug
    );
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  // Get previous image
  const getPrevImage = () => {
    if (!selectedImage) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.slug === selectedImage.slug
    );
    const prevIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  return (
    <section id="Work" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl text-white font-bold text-center mb-12">
          Our Work
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
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
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-6 w-full text-white">
                          <h3 className="text-xl font-medium">{image.name}</h3>
                          <p className="text-sm opacity-90 mt-1">
                            {image.category}
                          </p>
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
          onClose={() => setModalOpen(false)}
          image={selectedImage!}
          onNext={getNextImage}
          onPrev={getPrevImage}
        />
      </div>
    </section>
  );
};

export default Work;
