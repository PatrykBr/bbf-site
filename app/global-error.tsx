"use client";

import { captureException } from "@/lib/posthog";
import { useEffect } from "react";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
    useEffect(() => {
        captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ padding: "2rem", textAlign: "center" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
                            This page could not load
                        </h2>
                        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Please try loading the page again.</p>
                        <button
                            type="button"
                            onClick={retry}
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
