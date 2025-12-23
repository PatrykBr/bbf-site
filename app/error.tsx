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
                <p className="text-muted-foreground mb-6">We apologize for the inconvenience. Please try again.</p>
                <button
                    onClick={reset}
                    className="bg-primary text-primary-foreground rounded-lg px-6 py-3 transition-opacity hover:opacity-90"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
