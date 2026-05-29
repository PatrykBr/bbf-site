"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnalytics } from "./posthog";
import { getFacebookShareUrl, getWhatsAppShareUrl, copyToClipboard, openExternalUrl } from "./utils";
import type { PastWorkItem, ShareMethod } from "./types";

const COPY_FEEDBACK_MS = 2000;

/**
 * Share actions for a work item, with transient "copied" feedback.
 *
 * The feedback token restarts the timer when "copy" is triggered again while
 * the confirmation is still showing.
 */
export function useShareActions(item: PastWorkItem) {
    const { trackSharePastWork } = useAnalytics();
    const [copyState, setCopyState] = useState({ active: false, token: 0 });

    useEffect(() => {
        if (!copyState.active) return;

        const timeoutId = setTimeout(() => {
            setCopyState(state => ({ ...state, active: false }));
        }, COPY_FEEDBACK_MS);

        return () => clearTimeout(timeoutId);
    }, [copyState]);

    const share = useCallback(
        async (method: ShareMethod) => {
            trackSharePastWork(item.id, item.category, method);

            switch (method) {
                case "facebook":
                    openExternalUrl(getFacebookShareUrl(item.slug));
                    break;
                case "whatsapp":
                    openExternalUrl(getWhatsAppShareUrl(item.slug, item.name));
                    break;
                case "copy":
                    if (await copyToClipboard(item.slug)) {
                        setCopyState(state => ({ active: true, token: state.token + 1 }));
                    }
                    break;
            }
        },
        [item, trackSharePastWork]
    );

    return { copySuccess: copyState.active, share };
}
