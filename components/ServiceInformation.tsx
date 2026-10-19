"use client";

import { useState } from "react";
import { ContactAction } from "./ContactAction";
import { Modal } from "./Modal";

export function ServiceInformation({
    name,
    introduction,
    sections
}: {
    name: string;
    introduction: string;
    sections: { heading: string; text: string }[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`About our ${name.toLowerCase()}`}
                onClick={() => setIsOpen(true)}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium underline underline-offset-4 focus-visible:outline-white"
            >
                <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v6M12 7v1" />
                </svg>
                About
            </button>
            <Modal
                isOpen={isOpen}
                label={name}
                onClose={() => setIsOpen(false)}
                className="bg-brand-dark fixed inset-0 m-0 ml-auto h-dvh max-h-none w-full max-w-lg flex-col overflow-hidden border-0 p-0 text-white backdrop:bg-black/60 open:flex"
            >
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-5 py-4 sm:px-7">
                    <h2 className="text-xl font-semibold">{name}</h2>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close service information"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-white"
                    >
                        <svg
                            className="size-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path d="m6 6 12 12M6 18 18 6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-5 text-sm leading-relaxed sm:p-7">
                    <p>{introduction}</p>
                    {sections.map(section => (
                        <div key={section.heading}>
                            <h3 className="mb-2 text-base font-semibold">{section.heading}</h3>
                            <p className="text-white/90">{section.text}</p>
                        </div>
                    ))}
                </div>
                <div className="shrink-0 border-t border-white/15 p-5 sm:px-7">
                    <ContactAction
                        onClick={() => setIsOpen(false)}
                        className="text-brand-dark flex min-h-12 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold focus-visible:outline-white"
                    >
                        Ask for a free quote
                    </ContactAction>
                </div>
            </Modal>
        </>
    );
}
