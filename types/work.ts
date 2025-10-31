// Define the categories
export const categories = [
    "All",
    "Featured",
    "Wardrobes",
    "Kitchens"
    // "Others",
] as const;

// Define category type (excluding Featured since it's a view mode)
export type Category = Exclude<(typeof categories)[number], "Featured" | "All">;

// Define image interface
export interface WorkImage {
    id?: number;
    src: string;
    name: string;
    category: Category;
    aspectRatio: "landscape" | "portrait";
    slug?: string;
    featured?: boolean;
    description?: string;
}

// Define image dimensions interface
export interface ImageDimensions {
    width: number;
    height: number;
}
