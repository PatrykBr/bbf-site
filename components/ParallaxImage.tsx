"use client";

import { useRef } from "react";
import Image, { type ImageProps } from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function ParallaxImage({
    src,
    alt,
    sizes = "100vw",
    preload = false,
    unoptimized = false
}: {
    src: ImageProps["src"];
    alt: string;
    sizes?: string;
    preload?: boolean;
    unoptimized?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const transform = useTransform(scrollYProgress, [0, 1], ["translate3d(0, -14%, 0)", "translate3d(0, 14%, 0)"]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-clip">
            <motion.div
                className="parallax-image absolute inset-x-0 -inset-y-[20%]"
                style={{ transform: reduceMotion ? "none" : transform }}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    preload={preload}
                    unoptimized={unoptimized}
                    sizes={sizes}
                    className="object-cover object-center"
                />
            </motion.div>
        </div>
    );
}
