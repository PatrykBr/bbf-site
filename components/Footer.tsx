"use client";

import React from "react";
import Link from "next/link";

// Create a client component for category links
const CategoryLink = ({
  category,
  children,
}: {
  category: string;
  children: React.ReactNode;
}) => {
  const handleClick = () => {
    // First navigate to the work section
    const workSection = document.getElementById("work");
    workSection?.scrollIntoView({ behavior: "smooth" });

    // Wait for scroll to complete before updating category
    setTimeout(() => {
      // Update URL with category
      const url = new URL(window.location.toString());
      url.searchParams.set("category", category);
      window.history.replaceState({}, "", url);

      // Click the category button
      const button = document.querySelector(
        `button[data-category="${category}"]`
      ) as HTMLButtonElement;
      button?.click();
    }, 100);
  };

  return (
    <button
      onClick={handleClick}
      className="text-white/80 hover:text-white transition-colors block py-0.5 text-left w-full"
    >
      {children}
    </button>
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-8 md:py-10">
      <div className="container mx-auto px-6 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-6">
          {/* Company Info */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold mb-3">
              Bespoke Broncel Furniture
            </h2>
            <p className="text-white/80 max-w-md mb-4">
              Building your dream furniture with exceptional craftsmanship and
              attention to detail.
            </p>
            <div className="flex flex-col space-y-1">
              <a
                href="tel:+44 7523 706742"
                className="text-white/80 hover:text-white flex items-center transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 mr-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                +44 7523 706742
              </a>
              {/* Only include location without link */}
              <div className="text-white/80 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 mr-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                South Yorkshire, UK
              </div>
            </div>
          </div>

          {/* Quick Links - Only include real sections */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors block py-0.5"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-white/80 hover:text-white transition-colors block py-0.5"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  className="text-white/80 hover:text-white transition-colors block py-0.5"
                >
                  Work
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-white/80 hover:text-white transition-colors block py-0.5"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services - Only include actual offered services */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Services</h3>
            <ul className="space-y-1">
              <li>
                <CategoryLink category="Wardrobes">
                  Bespoke Wardrobes
                </CategoryLink>
              </li>
              <li>
                <CategoryLink category="Kitchens">Custom Kitchens</CategoryLink>
              </li>
              <li>
                <CategoryLink category="Others">
                  Other Custom Pieces
                </CategoryLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 pt-4 mt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Bespoke Broncel Furniture. All rights reserved.
          </p>

          {/* Social Media - Only include if exists */}
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/broncelfurniture/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
