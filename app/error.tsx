"use client";

import { captureException } from "@/lib/posthog";
import { useEffect } from "react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
    useEffect(() => {
        captureException(error);
    }, [error]);

    return (
        <div className="bg-background flex min-h-screen items-center justify-center">
            <div className="p-8 text-center">
                <h2 className="text-foreground mb-4 text-2xl font-semibold">This page could not load</h2>
                <p className="mb-6 text-gray-600">Please try loading the page again.</p>
                <button
                    type="button"
                    onClick={retry}
                    className="bg-brand-dark hover:bg-brand-light rounded-lg px-6 py-3 text-white transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
