"use client";

import { useState, useCallback, memo } from "react";
import Image from "next/image";

interface FallbackImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    onClick?: () => void;
}

function FallbackImageComponent({
    src,
    alt,
    fill,
    width,
    height,
    className = "",
    priority = false,
    sizes,
    onClick
}: FallbackImageProps) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = useCallback(() => {
        setError(true);
        setIsLoading(false);
    }, []);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    if (error) {
        // Fallback placeholder
        return (
            <div
                className={`from-brand-light/20 to-brand-dark/20 flex items-center justify-center bg-linear-to-br ${fill ? "absolute inset-0" : ""} ${className}`}
                style={!fill ? { width, height } : undefined}
                role="img"
                aria-label={alt}
                onClick={onClick}
            >
                <div className="p-4 text-center">
                    <svg
                        className="text-brand-dark/30 mx-auto mb-3 h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="text-brand-dark/50 text-sm font-medium">Image Coming Soon</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${fill ? "h-full w-full" : ""}`}>
            {isLoading && (
                <div
                    className={`absolute inset-0 animate-pulse bg-linear-to-br from-gray-100 to-gray-200 ${className}`}
                />
            )}
            <Image
                src={src}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                priority={priority}
                sizes={sizes}
                onError={handleError}
                onLoad={handleLoad}
                onClick={onClick}
                unoptimized={src.startsWith("/past-work/") || src.startsWith("/hero")}
            />
        </div>
    );
}

export const FallbackImage = memo(FallbackImageComponent);
