import Link from "next/link";

export default function Hero() {
    return (
        <section
            id="hero"
            className="bg-primary relative h-screen overflow-hidden"
            aria-label="Welcome to Bespoke Broncel Furniture"
        >
            <div className="absolute inset-0 py-32 sm:px-8 md:px-12">
                <div
                    className="hero-background h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
                    role="img"
                    aria-label="Showcase of bespoke furniture craftsmanship"
                >
                    <div className="absolute inset-0 backdrop-blur-xs backdrop-filter" />
                </div>
            </div>
            <div className="relative z-10 flex h-full items-center justify-center py-4 sm:p-8 md:p-12">
                <div className="text-center">
                    <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-md sm:text-5xl md:text-7xl">
                        Bespoke Broncel Furniture
                    </h1>
                    <h2 className="mb-8 text-xl text-white italic sm:text-2xl">
                        Building your dream furniture in South Yorkshire
                    </h2>
                    <div className="flex justify-center gap-4">
                        <Link
                            href={{ pathname: "/", hash: "work" }}
                            className="bg-primary hover:bg-primary/80 cursor-pointer rounded-full px-6 py-2 text-sm text-white transition-colors sm:text-base"
                            aria-label="View our portfolio of custom furniture"
                        >
                            View Our Work
                        </Link>
                        <Link
                            href={{ pathname: "/", hash: "contact" }}
                            className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full px-6 py-2 text-sm text-white transition-colors sm:text-base"
                            aria-label="Contact us for a free quote"
                        >
                            Get In Touch
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
