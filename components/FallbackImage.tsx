"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type FallbackImageProps = Pick<ImageProps, "alt" | "fill" | "width" | "height" | "className" | "preload" | "sizes"> & {
    src: string;
};

export function FallbackImage({ src, alt, ...props }: FallbackImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const failed = failedSrc === src;
    return (
        <Image
            {...props}
            src={failed ? "/placeholder.svg" : src}
            alt={failed ? `${alt} (image unavailable)` : alt}
            onError={() => setFailedSrc(src)}
        />
    );
}
