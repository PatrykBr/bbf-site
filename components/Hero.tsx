import Link from "next/link";
import { ContactAction } from "./ContactAction";
import { ParallaxImage } from "./ParallaxImage";
import { companyInfo } from "@/lib/data/contact";

export function Hero() {
    return (
        <section
            id="home"
            className="bg-brand-dark relative flex min-h-screen flex-col items-center justify-center px-2 pt-20 pb-8 sm:px-8 sm:pt-24 sm:pb-16 lg:px-16"
        >
            <div className="hero-frame relative w-full overflow-hidden rounded-lg">
                <ParallaxImage src="/hero-bg.webp" alt="Custom furniture by Bespoke Broncel Furniture" preload />
                <div className="absolute inset-0 bg-black/35" />

                <div className="relative z-10 px-4 py-35 text-center text-white sm:px-8 sm:py-32 md:py-40 lg:py-48">
                    <h1 className="hero-title mb-6 text-4xl leading-tight font-bold sm:text-5xl md:text-7xl">
                        {companyInfo.name}
                    </h1>
                    <p className="hero-tagline mb-8 text-xl text-white/90 italic sm:text-2xl">{companyInfo.tagline}</p>
                    <div className="hero-actions flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/#work"
                            className="hero-action text-brand-dark inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 font-semibold shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
                        >
                            View our work
                        </Link>
                        <ContactAction className="hero-action inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-3.5 font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-sm hover:bg-white/20">
                            Get in touch
                        </ContactAction>
                    </div>
                </div>
            </div>
        </section>
    );
}
