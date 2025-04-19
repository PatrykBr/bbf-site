import { imageData } from "../../data/images";
import { getImageDimensions } from "../../utils/imageUtils";

export function generateImageStructuredData() {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Bespoke Broncel Furniture Gallery",
    description:
      "Gallery of our custom-made furniture including kitchens, wardrobes, and other bespoke pieces",
    image: imageData.map(createImageObject),
  };

  // Create individual image objects
  const imageObjects = imageData.map(createImageObject);

  return [baseStructuredData, ...imageObjects];
}

function createImageObject(img: (typeof imageData)[0]) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: img.src,
    name: img.name,
    description: `${img.name} - ${img.category} by Bespoke Broncel Furniture`,
    caption: img.category,
    width: getImageDimensions(img.aspectRatio).width,
    height: getImageDimensions(img.aspectRatio).height,
    datePublished: new Date().toISOString(),
    creator: {
      "@type": "Organization",
      name: "Bespoke Broncel Furniture",
    },
  };
}
