import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <div id="Home" className="relative bg-bff_green h-screen overflow-hidden">
      <div className="absolute inset-0 py-32 sm:px-8 md:px-12">
        <div className="w-full h-full bg-cover bg-center bg-no-repeat hero-background brightness-75">
          <div className="absolute inset-0 backdrop-filter backdrop-blur-sm" />
        </div>
      </div>
      <div className="relative z-10 h-full flex items-center justify-center py-4 sm:p-8 md:p-12">
        <div className="text-center">
          <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-bold mb-4 drop-shadow-md">
            Broncel Bespoke Furniture
          </h1>
          <h2 className="text-white text-xl sm:text-2xl mb-8">
            Building your dream
          </h2>
          <Button className="text-sm sm:text-base">
            <Link href="#About">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
