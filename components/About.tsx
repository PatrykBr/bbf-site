import React from "react";
import { Button } from "./ui/button";

const About = () => {
  return (
    <div id="About" className="relative bg-bff_green h-screen overflow-hidden">
      <div className="absolute inset-0 py-32 sm:p-8 md:p-12">
        <div className="w-full h-full bg-cover bg-center bg-no-repeat hero-background2 brightness-75">
          <div className="absolute inset-0 backdrop-filter backdrop-blur-sm" />
        </div>
      </div>
      <div className="relative z-10 h-full flex items-center justify-center py-4 sm:p-8 md:p-12">
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-8 md:px-12">
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-4 drop-shadow-md">
            Designed for your Home
          </h1>
          <h2 className="text-white text-sm sm:text-base md:text-lg drop-shadow-md">
            Our company has 25 years of experience in carpentry, we have been on
            the English market since 2007 and we are successfully developing
            every year. Our main field is the production of custom-made
            furniture, in particular kitchens and built-in wardrobes. We have a
            very large range of colours and materials at your disposal. We
            operate throughout a large part of England
          </h2>
        </div>
      </div>
    </div>
  );
};

export default About;
