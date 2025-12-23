import { PastWorkItem } from "../types";

/**
 * Past work portfolio items for Bespoke Broncel Furniture
 * Images are relative to /public/past-work/ directory
 * Use kebab-case for all file names
 */
export const pastWorkItems: PastWorkItem[] = [
    // Featured Wardrobes
    {
        id: "wardrobe-001",
        name: "Modern Sliding Wardrobe",
        category: "wardrobe",
        isFeatured: true,
        description:
            "A sleek modern sliding door wardrobe with mirrored panels and soft-close mechanisms. Custom-designed to maximize space efficiency in a master bedroom.",
        images: [
            {
                url: "/past-work/modern-sliding-wardrobe-1.webp",
                alt: "Modern sliding wardrobe with mirrored doors",
                orientation: "portrait"
            },
            {
                url: "/past-work/modern-sliding-wardrobe-2.webp",
                alt: "Interior view of modern sliding wardrobe",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-10-15T10:00:00.000Z",
        slug: "modern-sliding-wardrobe"
    },
    {
        id: "wardrobe-002",
        name: "Classic Built-in Wardrobe",
        category: "wardrobe",
        isFeatured: true,
        description:
            "Traditional style built-in wardrobe with paneled doors and brass handles. Features integrated lighting and custom shelving units.",
        images: [
            {
                url: "/past-work/classic-built-in-wardrobe-1.webp",
                alt: "Classic built-in wardrobe with paneled doors",
                orientation: "landscape"
            },
            {
                url: "/past-work/classic-built-in-wardrobe-2.webp",
                alt: "Classic wardrobe interior organization",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-09-20T10:00:00.000Z",
        slug: "classic-built-in-wardrobe"
    },
    // Featured Kitchens
    {
        id: "kitchen-001",
        name: "Contemporary White Kitchen",
        category: "kitchen",
        isFeatured: true,
        description:
            "A stunning contemporary kitchen featuring handleless white cabinets, quartz countertops, and integrated appliances. Perfect blend of functionality and style.",
        images: [
            {
                url: "/past-work/contemporary-white-kitchen-1.webp",
                alt: "Contemporary white kitchen with island",
                orientation: "landscape"
            },
            {
                url: "/past-work/contemporary-white-kitchen-2.webp",
                alt: "Contemporary kitchen appliances and storage",
                orientation: "square"
            }
        ],
        createdAt: "2024-11-01T10:00:00.000Z",
        slug: "contemporary-white-kitchen"
    },
    {
        id: "kitchen-002",
        name: "Rustic Oak Kitchen",
        category: "kitchen",
        isFeatured: true,
        description:
            "Beautiful rustic kitchen crafted from solid oak with traditional shaker-style doors. Features a farmhouse sink and vintage-inspired fixtures.",
        images: [
            {
                url: "/past-work/rustic-oak-kitchen-1.webp",
                alt: "Rustic oak kitchen with shaker doors",
                orientation: "portrait"
            },
            {
                url: "/past-work/rustic-oak-kitchen-2.webp",
                alt: "Rustic kitchen farmhouse sink detail",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-08-15T10:00:00.000Z",
        slug: "rustic-oak-kitchen"
    },
    // Non-featured items
    {
        id: "wardrobe-003",
        name: "Walk-in Closet System",
        category: "wardrobe",
        isFeatured: false,
        description:
            "Luxurious walk-in closet with custom organization, shoe racks, and island dresser. Designed for optimal storage and easy access.",
        images: [
            {
                url: "/past-work/walk-in-closet-system-1.webp",
                alt: "Walk-in closet with custom shelving",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-07-10T10:00:00.000Z",
        slug: "walk-in-closet-system"
    },
    {
        id: "wardrobe-004",
        name: "Corner Wardrobe Solution",
        category: "wardrobe",
        isFeatured: false,
        description:
            "Space-saving corner wardrobe that maximizes awkward room corners. Features rotating racks and pull-out drawers.",
        images: [
            {
                url: "/past-work/corner-wardrobe-solution-1.webp",
                alt: "Corner wardrobe in bedroom setting",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-06-25T10:00:00.000Z",
        slug: "corner-wardrobe-solution"
    },
    {
        id: "kitchen-003",
        name: "Compact Galley Kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "Efficient galley kitchen design for smaller spaces. Maximizes counter space and storage without compromising on style.",
        images: [
            {
                url: "/past-work/compact-galley-kitchen-1.webp",
                alt: "Compact galley kitchen design",
                orientation: "square"
            }
        ],
        createdAt: "2024-05-20T10:00:00.000Z",
        slug: "compact-galley-kitchen"
    },
    {
        id: "kitchen-004",
        name: "Modern Grey Kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "Sophisticated modern kitchen in anthracite grey with handleless doors and a large center island with breakfast bar.",
        images: [
            {
                url: "/past-work/modern-grey-kitchen-1.webp",
                alt: "Modern grey kitchen with island",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-04-15T10:00:00.000Z",
        slug: "modern-grey-kitchen"
    },
    {
        id: "wardrobe-005",
        name: "Kids Room Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "Colorful and practical wardrobe designed for a children's room with easy-access storage and playful design elements.",
        images: [
            {
                url: "/past-work/kids-room-wardrobe-1.webp",
                alt: "Kids room wardrobe with colorful accents",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-03-10T10:00:00.000Z",
        slug: "kids-room-wardrobe"
    },
    {
        id: "kitchen-005",
        name: "L-Shaped Family Kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "Spacious L-shaped kitchen perfect for family homes. Features a dedicated breakfast nook and ample storage throughout.",
        images: [
            {
                url: "/past-work/l-shaped-family-kitchen-1.webp",
                alt: "L-shaped family kitchen overview",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-02-20T10:00:00.000Z",
        slug: "l-shaped-family-kitchen"
    },
    {
        id: "wardrobe-006",
        name: "Minimalist White Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "Clean minimalist wardrobe with push-to-open doors in pure white finish. Internal organization systems included.",
        images: [
            {
                url: "/past-work/minimalist-white-wardrobe-1.webp",
                alt: "Minimalist white wardrobe",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-01-15T10:00:00.000Z",
        slug: "minimalist-white-wardrobe"
    },
    {
        id: "kitchen-006",
        name: "Traditional Cream Kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "Timeless traditional kitchen in warm cream tones with ornate handles and classic design elements.",
        images: [
            {
                url: "/past-work/traditional-cream-kitchen-1.webp",
                alt: "Traditional cream kitchen with classic styling",
                orientation: "square"
            }
        ],
        createdAt: "2023-12-10T10:00:00.000Z",
        slug: "traditional-cream-kitchen"
    },
    {
        id: "wardrobe-007",
        name: "Loft Conversion Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "Custom wardrobe designed to fit under sloped ceilings in a loft conversion. Maximizes every inch of available space.",
        images: [
            {
                url: "/past-work/loft-conversion-wardrobe-1.webp",
                alt: "Loft conversion wardrobe under sloped ceiling",
                orientation: "landscape"
            }
        ],
        createdAt: "2023-11-05T10:00:00.000Z",
        slug: "loft-conversion-wardrobe"
    },
    {
        id: "kitchen-007",
        name: "Open Plan Kitchen Living",
        category: "kitchen",
        isFeatured: false,
        description:
            "Modern open plan kitchen seamlessly integrated with living space. Features a statement island and coordinated color scheme.",
        images: [
            {
                url: "/past-work/open-plan-kitchen-living-1.webp",
                alt: "Open plan kitchen and living area",
                orientation: "landscape"
            }
        ],
        createdAt: "2023-10-20T10:00:00.000Z",
        slug: "open-plan-kitchen-living"
    },
    {
        id: "wardrobe-008",
        name: "Dressing Room Suite",
        category: "wardrobe",
        isFeatured: false,
        description: "Complete dressing room with floor-to-ceiling wardrobes, vanity area, and full-length mirrors.",
        images: [
            {
                url: "/past-work/dressing-room-suite-1.webp",
                alt: "Dressing room with full wardrobe suite",
                orientation: "portrait"
            }
        ],
        createdAt: "2023-09-15T10:00:00.000Z",
        slug: "dressing-room-suite"
    }
];

/**
 * Get all past work items, optionally sorted by featured status
 */
export function getAllPastWork(sortByFeatured = true): PastWorkItem[] {
    if (sortByFeatured) {
        return [...pastWorkItems].sort((a, b) => {
            // Featured items first
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            // Then by date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
    return [...pastWorkItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get past work by category
 */
export function getPastWorkByCategory(category: "wardrobe" | "kitchen"): PastWorkItem[] {
    return getAllPastWork().filter(item => item.category === category);
}

/**
 * Get featured past work items
 */
export function getFeaturedPastWork(): PastWorkItem[] {
    return pastWorkItems.filter(item => item.isFeatured);
}

/**
 * Get a single past work item by slug
 */
export function getPastWorkBySlug(slug: string): PastWorkItem | undefined {
    return pastWorkItems.find(item => item.slug === slug);
}

/**
 * Get all slugs for static generation
 */
export function getAllPastWorkSlugs(): string[] {
    return pastWorkItems.map(item => item.slug);
}
