"use client";

import { useCallback, useEffect, useState } from "react";
import { trackSharePastWork } from "./posthog";
import { getFacebookShareUrl, getWhatsAppShareUrl, getShareUrl } from "./utils";
import type { PastWorkItem, ShareMethod } from "./types";

const COPY_FEEDBACK_MS = 2000;

/**
 * Show copy feedback for two seconds. Increment the token to restart the timer
 * when a visitor copies the link again.
 */
export function useShareActions(item: PastWorkItem) {
    const [copyState, setCopyState] = useState({ message: "", token: 0 });

    useEffect(() => {
        if (!copyState.message) return;

        const timeoutId = setTimeout(() => {
            setCopyState(state => ({ ...state, message: "" }));
        }, COPY_FEEDBACK_MS);

        return () => clearTimeout(timeoutId);
    }, [copyState]);

    const share = useCallback(
        async (method: ShareMethod) => {
            const origin = window.location.origin;
            switch (method) {
                case "facebook":
                    window.open(getFacebookShareUrl(item.slug, origin), "_blank", "noopener,noreferrer");
                    break;
                case "whatsapp":
                    window.open(getWhatsAppShareUrl(item.slug, item.name, origin), "_blank", "noopener,noreferrer");
                    break;
                case "copy":
                    try {
                        await navigator.clipboard.writeText(getShareUrl(item.slug, "copy", origin));
                        setCopyState(state => ({ message: "Link copied", token: state.token + 1 }));
                    } catch {
                        setCopyState(state => ({
                            message: "Could not copy the link. Please use your browser's share menu.",
                            token: state.token + 1
                        }));
                        return;
                    }
                    break;
            }
            trackSharePastWork(item.id, item.category, method);
        },
        [item]
    );

    return { copySuccess: copyState.message === "Link copied", shareMessage: copyState.message, share };
}
