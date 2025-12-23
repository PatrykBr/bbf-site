"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { companyInfo } from "@/lib/data/contact";

export function AboutSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);
    const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

    return (
        <section
            id="about"
            ref={sectionRef}
            className="bg-brand-dark flex min-h-screen flex-col justify-center px-2 py-4 sm:px-8 sm:py-8 lg:px-16"
        >
            {/* Window Frame with equal padding */}
            <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg sm:aspect-16/10 lg:aspect-16/8">
                {/* Parallax Background Image */}
                <motion.div
                    className="absolute inset-0 scale-150"
                    style={{
                        y: backgroundY,
                        scale: backgroundScale
                    }}
                >
                    <Image
                        src="/about-bg.webp"
                        alt="About our furniture workshop"
                        fill
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

                {/* Content inside the window */}
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-8 text-center text-white sm:px-8 sm:py-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-4 text-2xl font-bold sm:mb-6 sm:text-4xl md:text-5xl"
                    >
                        Designed for your Home
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg"
                    >
                        {companyInfo.description}
                    </motion.p>
                </div>
            </div>
        </section>
    );
}
