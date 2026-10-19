import type { ReactNode } from "react";

export function PageIntro({
    title,
    description,
    breadcrumbs,
    children
}: {
    title: string;
    description: string;
    breadcrumbs: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="bg-brand-dark px-4 pt-24 pb-6 text-white sm:px-8 sm:pt-28 sm:pb-8 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5">{breadcrumbs}</div>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                    <div>
                        <h1 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">{title}</h1>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{description}</p>
                    </div>
                    <div className="flex shrink-0">{children}</div>
                </div>
            </div>
        </section>
    );
}
