import { ParallaxImage } from "./ParallaxImage";
import { companyInfo } from "@/lib/data/contact";

export function AboutSection() {
    return (
        <section
            id="about"
            className="bg-brand-dark flex min-h-screen flex-col justify-center px-2 py-4 sm:px-8 sm:py-8 lg:px-16"
        >
            <div className="parallax-frame relative aspect-2/3 w-full overflow-clip rounded-lg sm:aspect-16/10 lg:aspect-16/8">
                <ParallaxImage
                    src="/about-bg.webp"
                    alt="Our furniture workshop"
                    sizes="(max-width: 639px) 375vw, (max-width: 1023px) 160vw, 125vw"
                />
                <div className="absolute inset-0 bg-black/45" />

                <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-8 text-center text-white sm:px-8 sm:py-12">
                    <h2 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-4xl md:text-5xl">
                        Furniture made to fit your home
                    </h2>
                    <p className="max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">
                        {companyInfo.description}
                    </p>
                </div>
            </div>
        </section>
    );
}
