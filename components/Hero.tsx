import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="Hero"
      className="relative bg-primary h-screen overflow-hidden"
      aria-label="Welcome to Bespoke Broncel Furniture"
    >
      <div className="absolute inset-0 py-32 sm:px-8 md:px-12">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat hero-background brightness-75"
          role="img"
          aria-label="Showcase of bespoke furniture craftsmanship"
        >
          <div className="absolute inset-0 backdrop-filter backdrop-blur-xs" />
        </div>
      </div>
      <div className="relative z-10 h-full flex items-center justify-center py-4 sm:p-8 md:p-12">
        <div className="text-center">
          <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-bold mb-4 drop-shadow-md">
            Bespoke Broncel Furniture
          </h1>
          <h2 className="text-white text-xl sm:text-2xl mb-8 italic">
            Building your dream furniture in South Yorkshire
          </h2>
          <div className="flex justify-center gap-4">
            <Link
              href="#Work"
              className="bg-primary text-white px-6 py-2 rounded-full text-sm sm:text-base hover:bg-primary/80 transition-colors"
              aria-label="View our portfolio of custom furniture"
            >
              View Our Work
            </Link>
            <Link
              href="#Contact"
              className="bg-secondary text-white px-6 py-2 rounded-full text-sm sm:text-base hover:bg-secondary/80 transition-colors"
              aria-label="Contact us for a free quote"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
