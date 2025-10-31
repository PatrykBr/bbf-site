"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  startTransition,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";
import { useSearchParams } from "next/navigation";
import { Metadata } from "next";

import { WorkImage, categories } from "../types/work";
import { WorkEvents, ViewSource } from "../constants/analytics";
import {
  MODAL_SCROLL_DELAY,
  INITIAL_IMAGES_TO_LOAD,
} from "../constants/config";
import {
  processImages,
  arrangeImagesForVisualFlow,
  getFileName,
  getImageDimensions,
  getAdjacentImage,
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
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  const images = useMemo(() => {
    const processedImageData = processImages(imageData);
    return arrangeImagesForVisualFlow(processedImageData);
  }, []);

  useEffect(() => {
    startTransition(() => setIsClient(true));
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const { style } = document.body;
    const previousOverflow = style.overflow;

    style.overflow = modalOpen ? "hidden" : "";

    return () => {
      style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  useEffect(() => {
    // Check URL parameters for direct image viewing or category selection
    const imageSlug = searchParams.get("image");
    const category = searchParams.get("category");

    if (
      category &&
      categories.includes(category as (typeof categories)[number])
    ) {
      startTransition(() => {
        setSelectedCategory(category as (typeof categories)[number]);
      });
    }

    if (imageSlug) {
      const image = images.find((img) => img.slug === imageSlug);
      if (image) {
        startTransition(() => {
          setSelectedImage(image);
          setModalOpen(true);
        });
        // Don't change category when opening from URL - keep current selected category
        // setSelectedCategory(image.category);
        posthog.capture(WorkEvents.PHOTO_VIEW, {
          category: image.category,
          file_name: getFileName(image.src),
          view_source: ViewSource.SHARED_LINK,
        });
      }
    }
  }, [searchParams, posthog, images]);

  // Filter images based on selected category
  const filteredImages = useMemo(() => {
    if (selectedCategory === "Featured") {
      return images.filter((img) => img.featured);
    }

    if (selectedCategory === "All") {
      return images;
    }

    return images.filter((img) => img.category === selectedCategory);
  }, [images, selectedCategory]);

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    // Clear the image parameter from URL without causing a refresh
    const url = new URL(window.location.toString());
    url.searchParams.delete("image");
    window.history.replaceState({}, "", url);

    // Scroll to Work section after a brief delay to ensure modal transition is complete
    setTimeout(() => {
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
    }, MODAL_SCROLL_DELAY);
  };

  // Handle image click
  const handleImageClick = (image: WorkImage) => {
    if (!image.slug) return;

    setSelectedImage(image);
    setModalOpen(true);
    // Update URL without causing a refresh
    const url = new URL(window.location.toString());
    url.searchParams.set("image", image.slug);
    window.history.replaceState({}, "", url);

    posthog.capture(WorkEvents.PHOTO_VIEW, {
      category: image.category,
      file_name: getFileName(image.src),
      view_source: ViewSource.GALLERY_CLICK,
    });
  };

  // Get next image
  const getNextImage = () => {
    if (!selectedImage?.slug || filteredImages.length === 0) return;

    const nextImage = getAdjacentImage(filteredImages, selectedImage, "next");
    if (!nextImage?.slug) return;

    setSelectedImage(nextImage);
    // Update URL without causing a refresh
    const url = new URL(window.location.toString());
    url.searchParams.set("image", nextImage.slug);
    window.history.replaceState({}, "", url);
  };

  // Get previous image
  const getPrevImage = () => {
    if (!selectedImage?.slug || filteredImages.length === 0) return;

    const prevImage = getAdjacentImage(filteredImages, selectedImage, "prev");
    if (!prevImage?.slug) return;

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
            onClick={() => setSelectedCategory("All")}
            className={`px-4 sm:px-8 py-3 rounded-l-full transition-all text-sm sm:text-lg cursor-pointer ${
              selectedCategory === "All"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <span className="sm:hidden">All</span>
            <span className="hidden sm:inline">View All</span>
          </button>
          <div className="bg-white">
            <div className="w-px h-full bg-gray-300"></div>
          </div>
          <button
            onClick={() => setSelectedCategory("Featured")}
            className={`px-4 sm:px-8 py-3 rounded-r-full transition-all text-sm sm:text-lg cursor-pointer ${
              selectedCategory === "Featured"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <span className="sm:hidden">Featured</span>
            <span className="hidden sm:inline">Featured Work</span>
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
                  className={`px-6 py-2 rounded-full transition-all cursor-pointer ${
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
                          alt={`${image.name} - Custom furniture handcrafted by Bespoke Broncel Furniture in Yorkshire`}
                          width={getImageDimensions(image.aspectRatio).width}
                          height={getImageDimensions(image.aspectRatio).height}
                          className="object-cover w-full h-full rounded-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={90}
                          priority={
                            filteredImages.indexOf(image) <
                            INITIAL_IMAGES_TO_LOAD
                          }
                          loading={
                            filteredImages.indexOf(image) <
                            INITIAL_IMAGES_TO_LOAD
                              ? "eager"
                              : "lazy"
                          }
                          title={`${image.name} | Bespoke Broncel Furniture Gallery`}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-6 w-full text-white">
                          <h3 className="text-xl font-medium">{image.name}</h3>
                          <p className="text-sm opacity-90 mt-1">
                            {image.category} | Bespoke Broncel Furniture
                          </p>
                          {image.description && (
                            <p className="text-xs opacity-80 mt-2 hidden md:block">
                              {image.description}
                            </p>
                          )}
                          <meta itemProp="name" content={image.name} />
                          <meta
                            itemProp="description"
                            content={
                              image.description ||
                              `${image.name} - ${image.category} custom furniture by Bespoke Broncel Furniture`
                            }
                          />
                          <meta
                            itemProp="author"
                            content="Bespoke Broncel Furniture"
                          />
                          <meta
                            itemProp="keywords"
                            content={`bespoke broncel furniture, ${image.category.toLowerCase()}, custom furniture, yorkshire, handmade`}
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
