"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        posthog.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ padding: "2rem", textAlign: "center" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                            We apologize for the inconvenience. Please try again.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                backgroundColor: "#21450d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "0.5rem",
                                padding: "0.75rem 1.5rem",
                                cursor: "pointer",
                                fontSize: "1rem"
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
