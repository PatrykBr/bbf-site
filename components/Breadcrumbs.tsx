import type { Route } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-config";
import { serializeJsonLd } from "@/lib/utils";

export function Breadcrumbs<T extends string>({
    items,
    tone = "dark"
}: {
    items: { name: string; href: Route<T> }[];
    tone?: "dark" | "light";
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: getSiteUrl(item.href)
        }))
    };

    return (
        <>
            <script type="application/ld+json">{serializeJsonLd(schema)}</script>
            <nav aria-label="Breadcrumb" className={`text-sm ${tone === "light" ? "text-white" : "text-gray-600"}`}>
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {items.map((item, index) => (
                        <li key={item.href} className="inline-flex items-center gap-2">
                            {index > 0 && <span aria-hidden="true">/</span>}
                            {index === items.length - 1 ? (
                                <span
                                    aria-current="page"
                                    className={`font-medium ${tone === "light" ? "text-white" : "text-brand-dark"}`}
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={`underline underline-offset-4 ${tone === "light" ? "hover:text-white focus-visible:outline-white" : "hover:text-brand-dark"}`}
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
