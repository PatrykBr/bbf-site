// Define the categories
export const categories = ["All", "Wardrobes", "Kitchens", "Others"] as const;

// Define category type
export type Category = (typeof categories)[number] | "All";

// Define image interface
export interface WorkImage {
  id?: number;
  src: string;
  name: string;
  category: Exclude<Category, "All">;
  aspectRatio: "landscape" | "portrait";
  slug?: string;
}

// Define image dimensions interface
export interface ImageDimensions {
  width: number;
  height: number;
}
