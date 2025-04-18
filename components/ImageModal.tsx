import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFacebook,
  FaShare,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import { WorkImage } from "../types/work";
import { WorkEvents, SharePlatform } from "../constants/analytics";
import { getFileName, getImageDimensions } from "../utils/imageUtils";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: WorkImage;
  onNext: () => void;
  onPrev: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  image,
  onNext,
  onPrev,
}) => {
  const posthog = usePostHog();

  // Create a shareable link
  const getShareableLink = () => {
    if (!image || !image.slug) return "";

    // Create a direct link to the image
    // Safely access window object only on client side
    if (typeof window !== "undefined") {
      return `${window.location.origin}${window.location.pathname}?image=${image.slug}`;
    }
    return `?image=${image.slug}`;
  };

  // Share to Facebook
  const shareToFacebook = () => {
    if (!image || !image.slug || typeof window === "undefined") return;

    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      getShareableLink()
    )}`;
    window.open(url, "_blank");
    posthog?.capture(WorkEvents.PHOTO_SHARE, {
      category: image.category,
      file_name: getFileName(image.src),
      share_platform: SharePlatform.FACEBOOK,
    });
  };

  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    if (!image || !image.slug || typeof window === "undefined") return;

    navigator.clipboard
      .writeText(getShareableLink())
      .then(() => {
        alert("Link copied to clipboard!");
        posthog?.capture(WorkEvents.PHOTO_SHARE, {
          category: image.category,
          file_name: getFileName(image.src),
          share_platform: SharePlatform.CLIPBOARD,
        });
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  return (
    <AnimatePresence>
      {isOpen && image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-white bg-black/60 rounded-full p-3 hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/60 rounded-full p-3 hover:bg-black/80 transition-colors"
              aria-label="Previous image"
            >
              <FaArrowLeft size={20} />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/60 rounded-full p-3 hover:bg-black/80 transition-colors"
              aria-label="Next image"
            >
              <FaArrowRight size={20} />
            </button>

            {/* Image container with proper aspect ratio preservation */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative max-h-full"
              >
                <Image
                  src={image.src}
                  alt={image.name}
                  width={getImageDimensions(image.aspectRatio).width}
                  height={getImageDimensions(image.aspectRatio).height}
                  className="object-contain max-h-[70vh] rounded-lg shadow-2xl"
                  sizes="95vw"
                  quality={100}
                  priority
                />
              </motion.div>
            </div>

            {/* Image info and sharing */}
            <div className="p-5 bg-white rounded-b-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{image.name}</h3>
                  <p className="text-gray-600">Category: {image.category}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={copyLinkToClipboard}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
                  >
                    <FaShare size={16} />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={shareToFacebook}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full transition-colors"
                  >
                    <FaFacebook size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
