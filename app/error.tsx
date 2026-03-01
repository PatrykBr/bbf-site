"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        posthog.captureException(error);
    }, [error]);

    return (
        <div className="bg-background flex min-h-screen items-center justify-center">
            <div className="p-8 text-center">
                <h2 className="text-foreground mb-4 text-2xl font-semibold">Something went wrong</h2>
                <p className="mb-6 text-gray-600">We apologize for the inconvenience. Please try again.</p>
                <button
                    type="button"
                    onClick={reset}
                    className="bg-brand-dark hover:bg-brand-light rounded-lg px-6 py-3 text-white transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
