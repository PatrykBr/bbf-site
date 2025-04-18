import { WorkImage, ImageDimensions } from "../types/work";

// Helper function to get filename from src path
export const getFileName = (src: string): string => {
  // Get the file name from the path and remove the extension
  const fullFileName = src.split("/").pop() || src;
  return fullFileName.split(".")[0];
};

// Generate slugs for images based on category and name
export const processImages = (images: WorkImage[]): WorkImage[] => {
  return images.map((img, index) => {
    // Create a slug from category and index (e.g., "wardrobes-1")
    const categorySlug = img.category.toLowerCase();
    const slug = `${categorySlug}-${index + 1}`;

    return {
      ...img,
      slug,
    };
  });
};

// Function to arrange images for optimal visual flow
export const arrangeImagesForVisualFlow = (
  images: WorkImage[]
): WorkImage[] => {
  // Separate images by orientation
  const landscapes = images.filter((img) => img.aspectRatio === "landscape");
  const portraits = images.filter((img) => img.aspectRatio === "portrait");

  // Create alternating pattern where possible
  const arranged: WorkImage[] = [];
  let landscapeIndex = 0;
  let portraitIndex = 0;

  // Start with a landscape if available, otherwise portrait
  if (landscapes.length > 0) {
    arranged.push(landscapes[landscapeIndex++]);
  } else if (portraits.length > 0) {
    arranged.push(portraits[portraitIndex++]);
  }

  // Fill remaining slots by alternating orientations when possible
  while (
    landscapeIndex < landscapes.length ||
    portraitIndex < portraits.length
  ) {
    const lastImage = arranged[arranged.length - 1];

    if (
      lastImage.aspectRatio === "landscape" &&
      portraitIndex < portraits.length
    ) {
      arranged.push(portraits[portraitIndex++]);
    } else if (
      lastImage.aspectRatio === "portrait" &&
      landscapeIndex < landscapes.length
    ) {
      arranged.push(landscapes[landscapeIndex++]);
    } else if (landscapeIndex < landscapes.length) {
      arranged.push(landscapes[landscapeIndex++]);
    } else if (portraitIndex < portraits.length) {
      arranged.push(portraits[portraitIndex++]);
    }
  }

  return arranged;
};

// Get image dimensions based on aspect ratio
export const getImageDimensions = (
  aspectRatio: "landscape" | "portrait"
): ImageDimensions => {
  // Base area = 16 * 9 = 144 square units
  // For landscape: 16:9 ratio
  // For portrait: Use sqrt(144 * 16/9) ≈ 12 for width to maintain equal area
  if (aspectRatio === "landscape") {
    return { width: 1600, height: 900 }; // 16:9 ratio at 100 units per dimension
  } else {
    // Portrait: Calculate dimensions to maintain equal area
    const baseArea = 1600 * 900; // Same area as landscape
    const heightRatio = 16 / 9; // Desired height/width ratio for portrait
    const width = Math.sqrt(baseArea / heightRatio);
    const height = width * heightRatio;
    return {
      width: Math.round(width), // ≈ 1200
      height: Math.round(height), // ≈ 2133
    };
  }
};
