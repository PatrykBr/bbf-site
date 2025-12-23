"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { companyInfo } from "@/lib/data/contact";

export function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

    return (
        <section
            id="home"
            ref={sectionRef}
            className="bg-brand-dark relative flex min-h-screen flex-col items-center justify-center px-2 pt-20 pb-8 sm:px-8 sm:pt-24 sm:pb-16 lg:px-16"
        >
            {/* Window Frame - stays fixed, clips the parallax image */}
            <div className="relative w-full overflow-hidden rounded-lg">
                {/* Parallax Background Image - moves behind the window */}
                <motion.div
                    className="absolute inset-0 scale-125"
                    style={{
                        y: backgroundY,
                        scale: backgroundScale
                    }}
                >
                    <Image
                        src="/hero-bg.webp"
                        alt="Bespoke furniture craftsmanship"
                        fill
                        priority
                        fetchPriority="high"
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" />

                {/* Content inside the window */}
                <div className="relative z-10 px-4 py-35 text-center text-white sm:px-8 sm:py-32 md:py-40 lg:py-48">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-6 text-4xl leading-tight font-bold sm:text-5xl md:text-7xl"
                    >
                        {companyInfo.name}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mb-8 text-xl text-white/90 italic sm:text-2xl"
                    >
                        {companyInfo.tagline}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-col justify-center gap-4 sm:flex-row"
                    >
                        <Link
                            href="/#work"
                            className="text-brand-dark inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/30"
                        >
                            View Our Work
                        </Link>
                        <Link
                            href="/#contact"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-3.5 font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl"
                        >
                            Get In Touch
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
