import Link from "next/link";
import type { WorkFilter } from "@/lib/types";

const links = [
    { href: "/work", name: "All", category: "all" },
    { href: "/fitted-kitchens", name: "Kitchens", category: "kitchen" },
    { href: "/fitted-wardrobes", name: "Wardrobes", category: "wardrobe" }
] as const;

export function ProjectNavigation({ current, counts }: { current: WorkFilter; counts: Record<WorkFilter, number> }) {
    return (
        <nav
            aria-label="Project categories"
            className="bg-brand-dark/20 mb-4 flex w-full max-w-md gap-1 rounded-xl p-1"
        >
            {links.map(link => (
                <Link
                    key={link.href}
                    href={link.href}
                    aria-current={link.category === current ? "page" : undefined}
                    className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-white sm:px-3 sm:text-sm ${link.category === current ? "text-brand-dark bg-white shadow-sm" : "text-white hover:bg-white/10"}`}
                >
                    {link.name}
                    <span
                        className={`text-xs font-normal ${link.category === current ? "text-brand-dark" : "text-white/95"}`}
                    >
                        {counts[link.category]}
                    </span>
                </Link>
            ))}
        </nav>
    );
}
