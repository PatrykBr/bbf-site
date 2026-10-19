"use client";

import { useSearchParams } from "next/navigation";

export function EnquiryProject({ projects }: { projects: { slug: string; name: string }[] }) {
    const params = useSearchParams();
    const project = projects.find(project => project.slug === params.get("project"));
    if (!project) return null;

    return (
        <div className="bg-brand-dark/5 text-brand-dark flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm">
            <p>
                Project reference: <span className="font-semibold">{project.name}</span>
            </p>
            <input type="hidden" name="projectSlug" value={project.slug} />
            <button
                type="button"
                onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("project");
                    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-black/5"
                aria-label="Remove project reference"
            >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="m6 6 12 12M6 18 18 6" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
}
