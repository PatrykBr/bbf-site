import { imageData } from "../../data/images";
import { getImageDimensions } from "../../utils/imageUtils";

export function generateImageStructuredData() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://bespokebroncelfurniture.com";

  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Bespoke Broncel Furniture Gallery - Custom Furniture Yorkshire",
    description:
      "Gallery showcasing our custom-made furniture including bespoke kitchens, wardrobes, and other handcrafted pieces by Bespoke Broncel Furniture in Yorkshire",
    image: imageData.map((img) => createImageObject(img, baseUrl)),
    creator: {
      "@type": "Organization",
      name: "Bespoke Broncel Furniture",
      url: baseUrl,
    },
    keywords:
      "bespoke broncel furniture, custom furniture, handmade furniture, yorkshire furniture maker, bespoke kitchens, custom wardrobes",
  };

  // Create individual image objects
  const imageObjects = imageData.map((img) => createImageObject(img, baseUrl));

  return [baseStructuredData, ...imageObjects];
}

function createImageObject(img: (typeof imageData)[0], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: `${baseUrl}${img.src}`,
    name: img.name,
    description:
      img.description ||
      `${img.name} - ${img.category} by Bespoke Broncel Furniture`,
    caption: `${img.category} custom furniture by Bespoke Broncel Furniture`,
    width: getImageDimensions(img.aspectRatio).width,
    height: getImageDimensions(img.aspectRatio).height,
    datePublished: new Date().toISOString(),
    creator: {
      "@type": "Organization",
      name: "Bespoke Broncel Furniture",
      url: baseUrl,
    },
    keywords: `bespoke broncel furniture, ${img.category.toLowerCase()}, custom furniture, yorkshire, handmade`,
    license: `${baseUrl}/image-license`,
    acquireLicensePage: `${baseUrl}/contact`,
  };
}
