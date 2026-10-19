import type { PastWorkItem } from "../types.ts";

/**
 * Store portfolio images in public/past-work and use kebab-case file names.
 * Image URLs start with /past-work/.
 */
const pastWorkItems: PastWorkItem[] = [
    {
        id: "wardrobe-001",
        name: "Walnut and white wardrobe interior",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A wardrobe interior with walnut drawers and framing, white shelves and space for hanging clothes.",
        images: [
            {
                url: "/past-work/walnut-white-interior-layout.webp",
                alt: "Wardrobe interior with walnut drawers and white shelving",
                orientation: "portrait"
            }
        ],
        createdAt: "2022-03-12T11:20:00.000Z",
        slug: "walnut-white-interior-layout"
    },
    {
        id: "wardrobe-002",
        name: "Light oak sliding wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A sliding wardrobe with a light oak finish and horizontal silver trims. The doors open onto drawers and shelves.",
        images: [
            {
                url: "/past-work/light-oak-sliding-wardrobe.webp",
                alt: "Light wood-effect sliding wardrobe with internal drawers",
                orientation: "portrait"
            }
        ],
        createdAt: "2023-06-08T13:10:00.000Z",
        slug: "light-oak-sliding-wardrobe"
    },
    {
        id: "wardrobe-003",
        name: "Textured concrete-effect wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description: "A floor-to-ceiling wardrobe with a dark concrete-effect finish and discreet handles.",
        images: [
            {
                url: "/past-work/textured-concrete-effect-wardrobe.webp",
                alt: "Floor-to-ceiling fitted wardrobe with a dark concrete-effect finish",
                orientation: "portrait"
            }
        ],
        createdAt: "2022-09-22T09:15:00.000Z",
        slug: "textured-concrete-effect-wardrobe"
    },
    {
        id: "wardrobe-004",
        name: "White mirrored lattice wardrobe",
        category: "wardrobe",
        isFeatured: true,
        description:
            "A white fitted wardrobe with lattice-framed mirror doors. An overhead pelmet holds LED downlights.",
        images: [
            {
                url: "/past-work/white-mirrored-lattice-wardrobe.webp",
                alt: "White fitted wardrobe with mirrored grid doors and integrated lighting",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-01-19T12:40:00.000Z",
        slug: "white-mirrored-lattice-wardrobe"
    },
    {
        id: "wardrobe-005",
        name: "Angled loft wardrobe",
        category: "wardrobe",
        isFeatured: true,
        description:
            "A wardrobe fitted to a sloping attic ceiling, with black grid frames and sliding doors. It has open shelves and drawers.",
        images: [
            {
                url: "/past-work/industrial-loft-angled-wardrobe.webp",
                alt: "Loft wardrobe with black grid frames fitted under a sloping ceiling",
                orientation: "landscape"
            }
        ],
        createdAt: "2023-11-14T10:00:00.000Z",
        slug: "industrial-loft-angled-wardrobe"
    },
    {
        id: "wardrobe-006",
        name: "High-gloss taupe sliding wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A sliding wardrobe with a high-gloss taupe finish, a full-length central mirror and horizontal detailing.",
        images: [
            {
                url: "/past-work/high-gloss-taupe-sliding-wardrobe.webp",
                alt: "High-gloss sliding wardrobe with a central mirror",
                orientation: "landscape"
            }
        ],
        createdAt: "2022-07-05T15:55:00.000Z",
        slug: "high-gloss-taupe-sliding-wardrobe"
    },
    {
        id: "wardrobe-007",
        name: "Terracotta dressing room",
        category: "wardrobe",
        isFeatured: true,
        description:
            "A terracotta walk-in dressing room with fitted wardrobes and gold handles. It has a matching central island and dressing table.",
        images: [
            {
                url: "/past-work/terracotta-dressing-room-suite.webp",
                alt: "Terracotta dressing room with an island and dressing table",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-05-28T16:45:00.000Z",
        slug: "terracotta-dressing-room-suite"
    },
    {
        id: "wardrobe-008",
        name: "Blush pink Shaker wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description:
            "A dusty pink fitted wardrobe with Shaker-style doors and brass handles. It has full-length mirrors and external drawers.",
        images: [
            {
                url: "/past-work/blush-pink-shaker-wardrobe.webp",
                alt: "Pink Shaker-style wardrobe with brass handles and mirrored doors",
                orientation: "portrait"
            }
        ],
        createdAt: "2023-02-17T14:30:00.000Z",
        slug: "blush-pink-shaker-wardrobe"
    },
    {
        id: "wardrobe-009",
        name: "Greige panelled wardrobe",
        category: "wardrobe",
        isFeatured: false,
        description: "A wall-to-wall fitted wardrobe in greige, with square-panel doors and long brass handles.",
        images: [
            {
                url: "/past-work/classic-greige-panelled-wardrobe.webp",
                alt: "Greige fitted wardrobe with square panel doors and brass handles",
                orientation: "landscape"
            }
        ],
        createdAt: "2022-12-01T09:00:00.000Z",
        slug: "classic-greige-panelled-wardrobe"
    },

    {
        id: "kitchen-001",
        name: "Navy blue Shaker kitchen",
        category: "kitchen",
        isFeatured: true,
        description:
            "A navy blue kitchen with Shaker-style cabinets, brushed brass knobs, brick-slip tiling and walnut-effect worktops.",
        images: [
            {
                url: "/past-work/navy-blue-shaker-kitchen.webp",
                alt: "Navy blue Shaker kitchen with brick tiles and brass handles",
                orientation: "landscape"
            }
        ],
        createdAt: "2024-08-11T10:00:00.000Z",
        slug: "navy-blue-shaker-kitchen"
    },
    {
        id: "kitchen-005",
        name: "Scandinavian white and wood kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "A compact kitchen with matt white slab doors and oak-effect framing. It has a black glass splashback and an angled extractor hood.",
        images: [
            {
                url: "/past-work/scandinavian-white-wood-kitchen.webp",
                alt: "White and wood kitchen with a black angled extractor hood",
                orientation: "landscape"
            }
        ],
        createdAt: "2023-04-21T14:20:00.000Z",
        slug: "scandinavian-white-wood-kitchen"
    },
    {
        id: "kitchen-004",
        name: "White handleless kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "A white handleless kitchen with light wood worktops and a black composite sink. The oven sits in a tall cabinet.",
        images: [
            {
                url: "/past-work/minimalist-white-handleless-kitchen.webp",
                alt: "White handleless kitchen with a black sink",
                orientation: "portrait"
            }
        ],
        createdAt: "2022-10-30T09:15:00.000Z",
        slug: "minimalist-white-handleless-kitchen"
    },
    {
        id: "kitchen-003",
        name: "Graphite and oak kitchen",
        category: "kitchen",
        isFeatured: true,
        description:
            "A kitchen with matt graphite handleless units, oak-effect splashbacks and lighting beneath the wall cabinets.",
        images: [
            {
                url: "/past-work/graphite-oak-contrast-kitchen.webp",
                alt: "Matt dark grey kitchen with an oak-effect splashback and lighting",
                orientation: "portrait"
            }
        ],
        createdAt: "2024-02-07T16:45:00.000Z",
        slug: "graphite-oak-contrast-kitchen"
    },
    {
        id: "kitchen-002",
        name: "Two-tone gloss and texture kitchen",
        category: "kitchen",
        isFeatured: false,
        description:
            "An L-shaped kitchen with high-gloss white units and a central row of textured wood-grain cabinets.",
        images: [
            {
                url: "/past-work/two-tone-gloss-texture-kitchen.webp",
                alt: "High-gloss white kitchen with wood-grain cabinets",
                orientation: "landscape"
            }
        ],
        createdAt: "2023-08-03T11:30:00.000Z",
        slug: "two-tone-gloss-texture-kitchen"
    }
];

/**
 * Return featured projects first, then sort each group by date, newest first.
 */
export function getAllPastWork(): PastWorkItem[] {
    return pastWorkItems.toSorted((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function getPastWorkBySlug(slug: string): PastWorkItem | undefined {
    return pastWorkItems.find(item => item.slug === slug);
}

export function getAllPastWorkSlugs(): string[] {
    return pastWorkItems.map(item => item.slug);
}
