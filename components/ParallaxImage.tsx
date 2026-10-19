"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function ParallaxImage({
    src,
    alt,
    sizes = "100vw",
    preload = false
}: {
    src: string;
    alt: string;
    sizes?: string;
    preload?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const transform = useTransform(
        scrollYProgress,
        [0, 1],
        ["translate3d(0, -18%, 0) scale(1.02)", "translate3d(0, 18%, 0) scale(1.14)"]
    );

    return (
        <div ref={ref} className="absolute inset-0 overflow-clip">
            <motion.div
                className="parallax-image absolute -inset-x-[12%] -inset-y-[30%]"
                style={{ transform: reduceMotion ? "none" : transform }}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    preload={preload}
                    sizes={sizes}
                    className="object-cover object-center"
                />
            </motion.div>
        </div>
    );
}
