import type { WorkCategory } from "../types";

export const services = {
    kitchen: {
        path: "/fitted-kitchens",
        name: "Fitted kitchens",
        heading: "Fitted kitchens in South Yorkshire",
        description:
            "Custom fitted kitchens in South Yorkshire. See our Shaker and handleless kitchen projects, choose your colours and materials, and ask for a free quote.",
        introduction:
            "We make custom kitchens in South Yorkshire, with 25 years of carpentry experience. Choose the colours and materials to suit your home.",
        image: {
            url: "/past-work/navy-blue-shaker-kitchen.webp",
            alt: "Navy blue Shaker kitchen with brick tiles and brass handles"
        },
        sections: [
            {
                heading: "Cabinet styles and finishes",
                text: "Our completed kitchens include Shaker-style cabinets and handleless units. Our projects show navy blue, matt graphite and white finishes, alongside wood-effect worktops and splashbacks."
            },
            {
                heading: "Planning your kitchen",
                text: "Tell us about your room layout, the storage you need and the appliances you want to include. Photos and approximate measurements are a useful starting point when asking for a quote."
            }
        ],
        enquiry:
            "Tell us about your kitchen layout and the cabinet styles you have in mind. You can mention any of our projects when you get in touch."
    },
    wardrobe: {
        path: "/fitted-wardrobes",
        name: "Fitted wardrobes",
        heading: "Fitted wardrobes in South Yorkshire",
        description:
            "Made-to-measure wardrobes in South Yorkshire. Browse sliding wardrobes, mirrored doors and loft storage, choose your finishes, and ask for a free quote.",
        introduction:
            "We make fitted wardrobes in South Yorkshire, including sliding wardrobes, loft storage and walk-in dressing rooms. Choose your colours and materials, with storage arranged around what you need to keep.",
        image: {
            url: "/past-work/white-mirrored-lattice-wardrobe.webp",
            alt: "White fitted wardrobe with mirrored grid doors and integrated lighting"
        },
        sections: [
            {
                heading: "Doors and interior storage",
                text: "Our wardrobe projects include sliding doors, mirrored doors and panelled finishes. Inside, examples show hanging space, open shelves and drawers. Browse the photographs to compare layouts and finishes."
            },
            {
                heading: "Sloping ceilings and dressing rooms",
                text: "The loft wardrobe follows an angled attic ceiling. Other projects include a wall-to-wall wardrobe and a walk-in dressing room with an island and dressing table. Tell us about the space you have and how you want to use it."
            }
        ],
        enquiry:
            "Tell us where the wardrobe will go, what you need to store and which door style you prefer. Photos and approximate measurements help explain the space."
    }
} satisfies Record<
    WorkCategory,
    {
        path: "/fitted-kitchens" | "/fitted-wardrobes";
        name: string;
        heading: string;
        description: string;
        introduction: string;
        image: { url: string; alt: string };
        sections: { heading: string; text: string }[];
        enquiry: string;
    }
>;
