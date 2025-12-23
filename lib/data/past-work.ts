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
        name: "Walnut & White Interior Layout",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A premium wardrobe interior showcasing a dual-tone design. Features rich walnut drawers and framing contrasted against crisp white shelving and hanging space.",
        images: [
            {
                url: "/past-work/walnut-white-interior-layout.webp",
                alt: "Wardrobe interior with walnut drawers and white shelving",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-10-15T11:20:00.000Z",
        slug: "walnut-white-interior-layout"
    },
    {
        id: "wardrobe-002",
        name: "Light Oak Sliding Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A modern sliding wardrobe featuring a natural light oak finish with horizontal silver trims. Smooth sliding mechanism reveals internal drawers and ample shelving.",
        images: [
            {
                url: "/past-work/light-oak-sliding-wardrobe.webp",
                alt: "Light wood effect sliding wardrobe with internal drawers",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-10-16T13:10:00.000Z",
        slug: "light-oak-sliding-wardrobe"
    },
    {
        id: "wardrobe-003",
        name: "Textured Concrete Effect Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A contemporary floor-to-ceiling wardrobe with a striking dark concrete texture finish. Minimalist design with discreet handles creates a sophisticated, seamless look.",
        images: [
            {
                url: "/past-work/textured-concrete-effect-wardrobe.webp",
                alt: "Dark concrete texture fitted wardrobe floor to ceiling",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-10-18T09:15:00.000Z",
        slug: "textured-concrete-effect-wardrobe"
    },
    {
        id: "wardrobe-004",
        name: "White Mirrored Lattice Wardrobe",
        category: "wardrobe",
        isFeatured: true,
        description:
            "A stunning white fitted wardrobe featuring mirrored doors with lattice detailing. Includes an integrated overhead pelmet with LED downlights for a bright, airy feel.",
        images: [
            {
                url: "/past-work/white-mirrored-lattice-wardrobe.webp",
                alt: "White fitted wardrobe with mirrored grid doors and integrated lighting",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-10-19T12:40:00.000Z",
        slug: "white-mirrored-lattice-wardrobe"
    },
    {
        id: "wardrobe-005",
        name: "Industrial Loft Angled Wardrobe",
        category: "wardrobe",
        isFeatured: true,
        description:
            "A bespoke industrial-chic wardrobe designed for an attic conversion. Features a black-framed grid design with sliding doors, open shelving, and drawers custom-fitted to the angled ceiling slope.",
        images: [
            {
                url: "/past-work/industrial-loft-angled-wardrobe.webp",
                alt: "Industrial style loft wardrobe with black grid frame and angled ceiling fit",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-10-20T10:00:00.000Z",
        slug: "industrial-loft-angled-wardrobe"
    },
    {
        id: "wardrobe-006",
        name: "High-Gloss Taupe Sliding Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A contemporary sliding wardrobe with a high-gloss taupe finish. Includes a central full-length mirror and horizontal detailing for a sleek, modern aesthetic.",
        images: [
            {
                url: "/past-work/high-gloss-taupe-sliding-wardrobe.webp",
                alt: "High gloss sliding wardrobe with central mirror",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-10-21T15:55:00.000Z",
        slug: "high-gloss-taupe-sliding-wardrobe"
    },
    {
        id: "wardrobe-007",
        name: "Terracotta Dressing Room Suite",
        category: "wardrobe",
        isFeatured: true,
        description:
            "A luxurious walk-in dressing room in a deep terracotta hue. Features a matching central island, vanity station, and fitted wardrobes with gold accent handles.",
        images: [
            {
                url: "/past-work/terracotta-dressing-room-suite.webp",
                alt: "Full dressing room with island and vanity in terracotta finish",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-10-25T16:45:00.000Z",
        slug: "terracotta-dressing-room-suite"
    },
    {
        id: "wardrobe-008",
        name: "Blush Pink Shaker Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "An elegant dusty pink fitted wardrobe featuring Shaker-style doors and brass hardware. Includes full-length mirrors and convenient external drawers for optimized storage.",
        images: [
            {
                url: "/past-work/blush-pink-shaker-wardrobe.webp",
                alt: "Pink shaker style wardrobe with brass handles and mirrored doors",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-10-22T14:30:00.000Z",
        slug: "blush-pink-shaker-wardrobe"
    },
    {
        id: "wardrobe-009",
        name: "Classic Greige Panelled Wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A sophisticated wall-to-wall fitted wardrobe in a neutral greige tone. Features timeless square panel detailing and long brass handles for a refined finish.",
        images: [
            {
                url: "/past-work/classic-greige-panelled-wardrobe.webp",
                alt: "Greige fitted wardrobe with square panel doors and brass handles",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-10-28T09:00:00.000Z",
        slug: "classic-greige-panelled-wardrobe"
    },

    {
        id: "kitchen-001",
        name: "Navy Blue Shaker Kitchen",
        category: "kitchen",
        isFeatured: true,
        description:
            "A timeless navy blue kitchen featuring shaker-style cabinetry and brushed brass knobs. Complemented by rustic brick-slip tiling and rich walnut-effect countertops.",
        images: [
            {
                url: "/past-work/navy-blue-shaker-kitchen.webp",
                alt: "Navy blue shaker kitchen with brick tiles and brass handles",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-11-01T10:00:00.000Z",
        slug: "navy-blue-shaker-kitchen"
    },
    {
        id: "kitchen-005",
        name: "Scandinavian White & Wood Kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "A modern compact kitchen blending matte white slab doors with oak-effect framing. Features a black glass splashback and contemporary angled extractor hood.",
        images: [
            {
                url: "/past-work/scandinavian-white-wood-kitchen.webp",
                alt: "Modern white and wood kitchen with black angled extractor",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-11-05T14:20:00.000Z",
        slug: "scandinavian-white-wood-kitchen"
    },
    {
        id: "kitchen-004",
        name: "Minimalist White Handleless Kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "A crisp white handleless kitchen designed for a bright, airy feel. Includes light wood surfaces, a black composite sink, and a tall integrated oven tower.",
        images: [
            {
                url: "/past-work/minimalist-white-handleless-kitchen.webp",
                alt: "Minimalist white handleless kitchen with black sink",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-11-04T09:15:00.000Z",
        slug: "minimalist-white-handleless-kitchen"
    },
    {
        id: "kitchen-003",
        name: "Graphite & Oak Contrast Kitchen",
        category: "kitchen",
        isFeatured: true,
        description:
            "A bold contemporary design featuring matte graphite handleless units. Deep grey tones are balanced by warm oak-effect splashbacks and under-cabinet lighting.",
        images: [
            {
                url: "/past-work/graphite-oak-contrast-kitchen.webp",
                alt: "Dark grey matte kitchen with oak backsplash and lighting",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-11-03T16:45:00.000Z",
        slug: "graphite-oak-contrast-kitchen"
    },
    {
        id: "kitchen-002",
        name: "Two-Tone Gloss & Texture Kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "An L-shaped kitchen with a two-tone scheme. High-gloss white units reflect light, while a central band of textured wood-grain cabinets adds warmth.",
        images: [
            {
                url: "/past-work/two-tone-gloss-texture-kitchen.webp",
                alt: "High gloss white kitchen with wood grain feature units",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-11-02T11:30:00.000Z",
        slug: "two-tone-gloss-texture-kitchen"
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
