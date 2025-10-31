import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaWhatsapp, FaShare, FaTimes, FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import { WorkImage } from "../types/work";
import { WorkEvents, SharePlatform } from "../constants/analytics";
import { SWIPE_CONFIDENCE_THRESHOLD } from "../constants/config";
import { getFileName, getImageDimensions } from "../utils/imageUtils";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: WorkImage;
    onNext: () => void;
    onPrev: () => void;
    prevImage?: WorkImage;
    nextImage?: WorkImage;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
};

const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, image, onNext, onPrev, prevImage, nextImage }) => {
    const posthog = usePostHog();
    const [direction, setDirection] = useState(0);
    const [showCopyToast, setShowCopyToast] = useState(false);

    const getShareableLink = () => {
        if (!image?.slug) return "";
        return `${window.location.origin}${window.location.pathname}?image=${image.slug}`;
    };

    const paginate = (newDirection: number) => {
        if (newDirection > 0) {
            onNext();
        } else {
            onPrev();
        }
        setDirection(newDirection);
    };

    const shareToFacebook = () => {
        if (!image?.slug) return;

        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareableLink())}`;
        window.open(url, "_blank");
        posthog.capture(WorkEvents.PHOTO_SHARE, {
            category: image.category,
            file_name: getFileName(image.src),
            share_platform: SharePlatform.FACEBOOK
        });
    };

    const shareToWhatsApp = () => {
        if (!image?.slug) return;

        const text = `Check out this ${image.category.toLowerCase()} - ${image.name}`;
        const url = `https://wa.me/?text=${encodeURIComponent(`${text} ${getShareableLink()}`)}`;
        window.open(url, "_blank");
        posthog.capture(WorkEvents.PHOTO_SHARE, {
            category: image.category,
            file_name: getFileName(image.src),
            share_platform: SharePlatform.WHATSAPP
        });
    };

    const copyLinkToClipboard = () => {
        if (!image?.slug) return;

        navigator.clipboard
            .writeText(getShareableLink())
            .then(() => {
                setShowCopyToast(true);
                setTimeout(() => setShowCopyToast(false), 2000);
                posthog.capture(WorkEvents.PHOTO_SHARE, {
                    category: image.category,
                    file_name: getFileName(image.src),
                    share_platform: SharePlatform.CLIPBOARD
                });
            })
            .catch(err => console.error("Failed to copy link: ", err));
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
                    <div className="relative flex h-full max-h-[90vh] w-full max-w-7xl flex-col">
                        {/* Toast Notification */}
                        <AnimatePresence>
                            {showCopyToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-20 left-1/2 z-50 -translate-x-1/2 transform"
                                >
                                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-4 py-2 text-white shadow-lg backdrop-blur-sm">
                                        <FaCheck size={16} />
                                        <span>Link copied to clipboard</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-black/60 p-3 text-white transition-colors hover:bg-black/80"
                            aria-label="Close"
                        >
                            <FaTimes size={20} />
                        </button>

                        {/* Main content area with side previews */}
                        <div className="flex flex-1 items-center justify-center gap-4 overflow-hidden">
                            {/* Previous image preview */}
                            {prevImage && (
                                <motion.div
                                    className="group relative hidden h-[70vh] cursor-pointer items-center lg:flex"
                                    onClick={() => paginate(-1)}
                                    whileHover={{ width: "8rem", opacity: 1 }}
                                    initial={{ width: "6rem" }}
                                    animate={{ width: "6rem" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="absolute inset-0 bg-black/60 transition-colors group-hover:bg-black/40" />
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={prevImage.src}
                                            alt="Previous image"
                                            width={getImageDimensions(prevImage.aspectRatio).width}
                                            height={getImageDimensions(prevImage.aspectRatio).height}
                                            className="h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-70"
                                            sizes="96px"
                                            quality={60}
                                        />
                                    </div>
                                    <FaArrowLeft
                                        size={24}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-70 transition-opacity group-hover:opacity-100"
                                    />
                                </motion.div>
                            )}

                            {/* Main image container */}
                            <div className="relative max-h-full flex-1 overflow-hidden">
                                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                    <motion.div
                                        key={image.slug}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                                mass: 1
                                            },
                                            opacity: { duration: 0.2 }
                                        }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={1}
                                        onDragEnd={(e, { offset, velocity }) => {
                                            const swipe = swipePower(offset.x, velocity.x);

                                            if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
                                                paginate(1);
                                            } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
                                                paginate(-1);
                                            }
                                        }}
                                        className="relative h-full w-full touch-pan-y"
                                    >
                                        <Image
                                            src={image.src}
                                            alt={image.name}
                                            width={getImageDimensions(image.aspectRatio).width}
                                            height={getImageDimensions(image.aspectRatio).height}
                                            className="h-full max-h-[70vh] w-full rounded-lg object-contain shadow-2xl"
                                            sizes="(max-width: 1024px) 95vw, 70vw"
                                            quality={100}
                                            priority
                                            draggable={false}
                                        />

                                        {/* Mobile navigation buttons - positioned on the sides */}
                                        <div className="lg:hidden">
                                            <button
                                                onClick={() => paginate(-1)}
                                                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 p-3 text-white transition-colors hover:bg-black/80"
                                                aria-label="Previous image"
                                            >
                                                <FaArrowLeft size={16} />
                                            </button>
                                            <button
                                                onClick={() => paginate(1)}
                                                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 p-3 text-white transition-colors hover:bg-black/80"
                                                aria-label="Next image"
                                            >
                                                <FaArrowRight size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Next image preview */}
                            {nextImage && (
                                <motion.div
                                    className="group relative hidden h-[70vh] cursor-pointer items-center lg:flex"
                                    onClick={() => paginate(1)}
                                    whileHover={{ width: "8rem", opacity: 1 }}
                                    initial={{ width: "6rem" }}
                                    animate={{ width: "6rem" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="absolute inset-0 bg-black/60 transition-colors group-hover:bg-black/40" />
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={nextImage.src}
                                            alt="Next image"
                                            width={getImageDimensions(nextImage.aspectRatio).width}
                                            height={getImageDimensions(nextImage.aspectRatio).height}
                                            className="h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-70"
                                            sizes="96px"
                                            quality={60}
                                        />
                                    </div>
                                    <FaArrowRight
                                        size={24}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-70 transition-opacity group-hover:opacity-100"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Image info and sharing */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={image.slug}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 rounded-lg bg-white/10 p-5 backdrop-blur-md"
                            >
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="text-white">
                                        <h3 className="mb-1 text-xl font-bold">{image.name}</h3>
                                        <p className="opacity-80">Category: {image.category}</p>
                                    </div>
                                    <div className="flex justify-center gap-1.5 sm:gap-3">
                                        <button
                                            onClick={copyLinkToClipboard}
                                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-white/20 px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/30 sm:flex-none sm:px-5"
                                        >
                                            <FaShare size={16} className="flex-shrink-0" />
                                            <span className="hidden sm:inline">Copy Link</span>
                                            <span className="truncate sm:hidden">Copy</span>
                                        </button>
                                        <button
                                            onClick={shareToWhatsApp}
                                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-green-600 px-3 py-2.5 text-sm text-white transition-colors hover:bg-green-700 sm:flex-none sm:px-5"
                                        >
                                            <FaWhatsapp size={16} className="flex-shrink-0" />
                                            <span className="hidden sm:inline">WhatsApp</span>
                                            <span className="truncate sm:hidden">WA</span>
                                        </button>
                                        <button
                                            onClick={shareToFacebook}
                                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-blue-600 px-3 py-2.5 text-sm text-white transition-colors hover:bg-blue-700 sm:flex-none sm:px-5"
                                        >
                                            <FaFacebook size={16} className="flex-shrink-0" />
                                            <span className="hidden sm:inline">Facebook</span>
                                            <span className="truncate sm:hidden">FB</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ImageModal;
