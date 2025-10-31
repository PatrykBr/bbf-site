import { WorkImage, ImageDimensions } from "../types/work";

export const getFileName = (src: string): string => {
    const fullFileName = src.split("/").pop() || src;
    return fullFileName.split(".")[0];
};

export const toKebabCase = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export const generateUniqueImageName = (name: string, existingNames: Set<string>): string => {
    const baseKebabName = toKebabCase(name);
    let uniqueName = baseKebabName;
    let counter = 1;

    while (existingNames.has(uniqueName)) {
        uniqueName = `${baseKebabName}-${String(counter).padStart(3, "0")}`;
        counter++;
    }

    return uniqueName;
};

export const processImages = (images: WorkImage[]): WorkImage[] => {
    const existingNames = new Set<string>();

    return images.map(img => {
        const uniqueName = generateUniqueImageName(img.name, existingNames);
        existingNames.add(uniqueName);

        return {
            ...img,
            slug: uniqueName
        };
    });
};

export const arrangeImagesForVisualFlow = (images: WorkImage[]): WorkImage[] => {
    const landscapes = images.filter(img => img.aspectRatio === "landscape");
    const portraits = images.filter(img => img.aspectRatio === "portrait");

    const arranged: WorkImage[] = [];
    let landscapeIndex = 0;
    let portraitIndex = 0;

    if (landscapes.length > 0) {
        arranged.push(landscapes[landscapeIndex++]);
    } else if (portraits.length > 0) {
        arranged.push(portraits[portraitIndex++]);
    }

    while (landscapeIndex < landscapes.length || portraitIndex < portraits.length) {
        const lastImage = arranged[arranged.length - 1];

        if (lastImage.aspectRatio === "landscape" && portraitIndex < portraits.length) {
            arranged.push(portraits[portraitIndex++]);
        } else if (lastImage.aspectRatio === "portrait" && landscapeIndex < landscapes.length) {
            arranged.push(landscapes[landscapeIndex++]);
        } else if (landscapeIndex < landscapes.length) {
            arranged.push(landscapes[landscapeIndex++]);
        } else if (portraitIndex < portraits.length) {
            arranged.push(portraits[portraitIndex++]);
        }
    }

    return arranged;
};

export const getImageDimensions = (aspectRatio: "landscape" | "portrait"): ImageDimensions => {
    if (aspectRatio === "landscape") {
        return { width: 1600, height: 900 };
    }

    // Portrait: 9:16 ratio with same area as landscape (1600x900)
    return { width: 900, height: 1600 };
};

export const getAdjacentImage = (
    images: WorkImage[],
    currentImage: WorkImage,
    direction: "next" | "prev"
): WorkImage | undefined => {
    if (!currentImage.slug || images.length === 0) return undefined;

    const currentIndex = images.findIndex(img => img.slug === currentImage.slug);
    const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

    const nextIndex =
        direction === "next"
            ? (safeCurrentIndex + 1) % images.length
            : (safeCurrentIndex - 1 + images.length) % images.length;

    return images[nextIndex];
};
