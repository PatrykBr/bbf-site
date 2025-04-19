import { Metadata } from "next";
import { imageData } from "../../data/images";
import { getImageDimensions } from "../../utils/imageUtils";
import { generateImageStructuredData } from ".";

export function generateGalleryMetadata(): Metadata {
  return {
    title: "Our Work - Bespoke Broncel Furniture",
    description:
      "Gallery of our custom-made furniture including kitchens, wardrobes, and other bespoke pieces",
    openGraph: {
      images: imageData.map((img) => ({
        url: img.src,
        width: getImageDimensions(img.aspectRatio).width,
        height: getImageDimensions(img.aspectRatio).height,
        alt: `${img.name} - ${img.category} custom furniture by Bespoke Broncel Furniture`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      images: imageData.map((img) => ({
        url: img.src,
        alt: `${img.name} - ${img.category} custom furniture by Bespoke Broncel Furniture`,
      })),
    },
    other: {
      "json-ld": JSON.stringify(generateImageStructuredData()),
    },
  };
}
