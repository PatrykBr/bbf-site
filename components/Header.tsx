"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

// PostHog event names
enum HeaderEvents {
  CONTACT_METHOD_CLICK = "contact_methods:method_click",
}

// Navigation links with their corresponding section IDs
const NAV_LINKS = [
  { name: "HOME", id: "Hero" },
  { name: "WORK", id: "Work" },
  { name: "ABOUT", id: "About" },
] as const;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Hero");
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const navRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});
  const posthog = usePostHog();

  // Memoize navLinks to prevent unnecessary re-renders
  const navLinks = useMemo(() => NAV_LINKS, []);

  // Handle scroll events to update header appearance and active section
  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled to update header appearance
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Determine which section is currently in view
      const sections = navLinks.map((link) => document.getElementById(link.id));
      const currentSection = sections.findIndex((section) => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        // Consider a section "active" when it's taking up a significant portion of the viewport
        return rect.top <= 150 && rect.bottom >= 150;
      });

      if (currentSection !== -1) {
        setActiveSection(navLinks[currentSection].id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navLinks]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Handle contact method click
  const handleContactMethodClick = (method: string) => {
    posthog?.capture(HeaderEvents.CONTACT_METHOD_CLICK, {
      method: method,
      location: "header",
    });
  };

  // Function to get active indicator style for desktop nav
  const getIndicatorStyle = () => {
    const activeNavItem = navRefs.current[activeSection];

    if (!activeNavItem) {
      return {
        width: "0px",
        transform: "translateX(0)",
        opacity: 0,
      };
    }

    // Get position of the active nav item
    const { offsetLeft, offsetWidth } = activeNavItem;

    return {
      width: `${offsetWidth}px`,
      transform: `translateX(${offsetLeft}px)`,
      opacity: 1,
    };
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/80 backdrop-blur-md py-2 pt-5 shadow-md"
          : "bg-transparent py-4 pt-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex w-full">
          {/* Logo Container - Separate and spans full height */}
          <div className="flex items-center mr-8">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.webp"
                alt="Bespoke Broncel Furniture Logo"
                width={scrolled ? 120 : 140}
                height={scrolled ? 40 : 50}
                className="transition-all duration-300"
                priority
              />
            </Link>
          </div>

          {/* Right Content Container */}
          <div className="flex-1 flex flex-col">
            {/* Top Section with Phone and Contact */}
            <div className="hidden md:flex justify-end items-center text-sm">
              <a
                href="tel:+44 7523 706742"
                className="flex items-center mr-6 text-white font-medium hover:text-secondary transition-colors"
                onClick={() => handleContactMethodClick("phone")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
              <Link
                href="#contact"
                className="px-4 py-1 bg-secondary text-white rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Contact Us
              </Link>
            </div>

            {/* Main Navigation Section */}
            <div className="flex items-center justify-end">
              {/* Desktop Navigation */}
              <nav className="hidden md:block">
                <div className="relative">
                  <ul className="flex space-x-8 items-center">
                    {navLinks.map((link) => (
                      <li
                        key={link.id}
                        ref={(el) => {
                          navRefs.current[link.id] = el;
                        }}
                        className="relative px-1 py-2"
                      >
                        <Link
                          href={`#${link.id}`}
                          className={`hover:text-secondary transition-colors text-white ${
                            activeSection === link.id
                              ? "font-medium"
                              : "font-normal"
                          }`}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {/* Sliding indicator line */}
                  <span
                    className="absolute bottom-0 h-0.5 bg-secondary transition-all duration-300 ease-in-out"
                    style={getIndicatorStyle()}
                  />
                </div>
              </nav>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="md:hidden flex items-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-6 flex flex-col items-end justify-between gap-1.5">
                  <span
                    className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
                      isMenuOpen
                        ? "w-6 transform rotate-45 translate-y-2"
                        : "w-6"
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 bg-gray-700 transition-opacity duration-300 ${
                      isMenuOpen ? "opacity-0" : "opacity-100 w-6"
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 bg-gray-700 transition-all duration-300 ${
                      isMenuOpen
                        ? "w-6 transform -rotate-45 -translate-y-2"
                        : "w-6"
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute left-0 right-0 top-full bg-white shadow-lg transition-all duration-300 ${
            isMenuOpen
              ? "max-h-screen opacity-100 visible"
              : "max-h-0 opacity-0 invisible overflow-hidden"
          }`}
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={`#${link.id}`}
                  className={`px-4 py-2 text-lg font-medium border-l-4 ${
                    activeSection === link.id
                      ? "border-primary text-primary bg-gray-50"
                      : "border-transparent text-gray-700 hover:text-primary hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <a
                  href="tel:+44 7523 706742"
                  className="flex items-center px-4 py-2 text-primary"
                  onClick={() => handleContactMethodClick("phone")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                <Link
                  href="#contact"
                  className="flex items-center px-4 py-2 mt-2 bg-primary text-white rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Contact Us
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
