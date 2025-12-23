"use client";

import { useState, useCallback } from "react";
import { useAnalytics } from "@/lib/posthog";
import { getFacebookShareUrl, getWhatsAppShareUrl, copyToClipboard } from "@/lib/utils";
import type { PastWorkItem, ShareMethod } from "@/lib/types";

interface WorkDetailClientProps {
    item: PastWorkItem;
}

export function WorkDetailClient({ item }: WorkDetailClientProps) {
    const [copySuccess, setCopySuccess] = useState(false);
    const { trackSharePastWork } = useAnalytics();

    const handleShare = useCallback(
        async (method: ShareMethod) => {
            trackSharePastWork(item.id, item.category, method);

            switch (method) {
                case "facebook":
                    window.open(getFacebookShareUrl(item.slug), "_blank");
                    break;
                case "whatsapp":
                    window.open(getWhatsAppShareUrl(item.slug, item.name), "_blank");
                    break;
                case "copy":
                    const success = await copyToClipboard(item.slug);
                    if (success) {
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                    }
                    break;
            }
        },
        [item, trackSharePastWork]
    );

    return (
        <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 text-sm font-medium text-gray-700">Share This Project</h4>
            <div className="flex gap-2">
                <button
                    onClick={() => handleShare("facebook")}
                    className="flex flex-1 items-center justify-center gap-2 rounded bg-[#1877F2] px-3 py-2 text-sm text-white transition-colors hover:bg-[#1877F2]/90"
                    aria-label="Share on Facebook"
                >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                    </svg>
                </button>

                <button
                    onClick={() => handleShare("whatsapp")}
                    className="flex flex-1 items-center justify-center gap-2 rounded bg-[#25D366] px-3 py-2 text-sm text-white transition-colors hover:bg-[#25D366]/90"
                    aria-label="Share on WhatsApp"
                >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                </button>

                <button
                    onClick={() => handleShare("copy")}
                    className="flex flex-1 items-center justify-center gap-2 rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
                    aria-label="Copy link"
                >
                    {copySuccess ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
