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
    const y = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.14]);

    return (
        <div ref={ref} className="absolute inset-0 overflow-hidden">
            <motion.div
                className="parallax-image absolute -inset-[12%]"
                style={{ y: reduceMotion ? 0 : y, scale: reduceMotion ? 1 : scale }}
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
