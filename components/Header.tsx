"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { HEADER_SCROLL_THRESHOLD, ACTIVE_SECTION_OFFSET } from "../constants/config";
import { ContactEvents } from "../constants/analytics";

// Navigation links with their corresponding section IDs
const NAV_LINKS = [
    { name: "HOME", id: "hero" },
    { name: "WORK", id: "work" },
    { name: "ABOUT", id: "about" }
] as const;

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");
    const [scrolled, setScrolled] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const navRefs = useRef<Record<string, HTMLElement | null>>({});
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
    const logoWidth = scrolled ? 120 : 140;
    const logoHeight = (logoWidth * 50) / 140;
    const posthog = usePostHog();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD);

            const sections = NAV_LINKS.map(link => document.getElementById(link.id));
            const currentSection = sections.findIndex(section => {
                if (!section) return false;
                const rect = section.getBoundingClientRect();
                return rect.top <= ACTIVE_SECTION_OFFSET && rect.bottom >= ACTIVE_SECTION_OFFSET;
            });

            if (currentSection !== -1) {
                setActiveSection(NAV_LINKS[currentSection].id);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node) && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    // Update indicator position when active section changes
    useEffect(() => {
        const activeNav = navRefs.current[activeSection];
        if (activeNav) {
            setIndicatorStyle({
                width: activeNav.offsetWidth,
                left: activeNav.offsetLeft
            });
        }
    }, [activeSection]);

    return (
        <header
            ref={headerRef}
            className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
                scrolled ? "bg-primary/80 py-2 pt-5 shadow-md backdrop-blur-md" : "bg-transparent py-4 pt-6"
            }`}
        >
            <div className="container mx-auto px-4 md:px-12">
                <div className="flex w-full items-center justify-between">
                    {/* Logo Container */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0">
                            <Image
                                src="/logo.webp"
                                alt="Bespoke Broncel Furniture Logo"
                                width={140}
                                height={50}
                                className="transition-all duration-300"
                                style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Mobile Menu Button - Moved here to align with logo */}
                    <button
                        type="button"
                        className="flex cursor-pointer items-center md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="flex w-6 flex-col items-end justify-between gap-1.5">
                            <span
                                className={`block h-0.5 bg-white transition-all duration-300 ${
                                    isMenuOpen ? "w-6 translate-y-2 rotate-45 transform" : "w-6"
                                }`}
                            ></span>
                            <span
                                className={`block h-0.5 bg-white transition-opacity duration-300 ${
                                    isMenuOpen ? "opacity-0" : "w-6 opacity-100"
                                }`}
                            ></span>
                            <span
                                className={`block h-0.5 bg-white transition-all duration-300 ${
                                    isMenuOpen ? "w-6 -translate-y-2 -rotate-45 transform" : "w-6"
                                }`}
                            ></span>
                        </div>
                    </button>

                    {/* Right Content Container - Desktop Only */}
                    <div className="ml-8 hidden flex-1 flex-col md:flex">
                        {/* Top Section with Phone and Contact */}
                        <div className="flex items-center justify-end text-sm">
                            <a
                                href="tel:+44 7523 706742"
                                className="hover:text-secondary mr-6 flex cursor-pointer items-center font-medium text-white transition-colors"
                                onClick={() =>
                                    posthog.capture(ContactEvents.METHOD_CLICK, {
                                        method: "phone",
                                        location: "header"
                                    })
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-1 h-4 w-4"
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
                                href={{ pathname: "/", hash: "contact" }}
                                className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-md px-4 py-1 text-sm font-medium text-white transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>

                        {/* Main Navigation Section */}
                        <div className="flex items-center justify-end">
                            {/* Desktop Navigation */}
                            <nav className="block">
                                <div className="relative">
                                    <ul className="flex items-center space-x-8">
                                        {NAV_LINKS.map(link => (
                                            <li
                                                key={link.id}
                                                ref={el => {
                                                    navRefs.current[link.id] = el;
                                                }}
                                            >
                                                <Link
                                                    href={{ pathname: "/", hash: link.id }}
                                                    className={`hover:text-secondary block cursor-pointer px-1 py-2 text-white transition-colors ${
                                                        activeSection === link.id ? "font-medium" : "font-normal"
                                                    }`}
                                                >
                                                    {link.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    {/* Sliding indicator line */}
                                    <span
                                        className="bg-secondary absolute bottom-0 h-0.5 transition-all duration-300 ease-in-out"
                                        style={{
                                            width: `${indicatorStyle.width}px`,
                                            transform: `translateX(${indicatorStyle.left}px)`
                                        }}
                                    />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`absolute top-full right-0 left-0 bg-white shadow-lg transition-all duration-300 md:hidden ${
                        isMenuOpen ? "visible max-h-screen opacity-100" : "invisible max-h-0 overflow-hidden opacity-0"
                    }`}
                >
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex flex-col space-y-4">
                            {NAV_LINKS.map(link => (
                                <Link
                                    key={link.id}
                                    href={{ pathname: "/", hash: link.id }}
                                    className={`cursor-pointer border-l-4 px-4 py-2 text-lg font-medium ${
                                        activeSection === link.id
                                            ? "border-primary text-primary bg-gray-50"
                                            : "hover:text-primary border-transparent text-gray-700 hover:bg-gray-50"
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-100 pt-4">
                                <a
                                    href="tel:+44 7523 706742"
                                    className="text-primary flex cursor-pointer items-center px-4 py-2"
                                    onClick={() =>
                                        posthog.capture(ContactEvents.METHOD_CLICK, {
                                            method: "phone",
                                            location: "header"
                                        })
                                    }
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2 h-5 w-5"
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
                                    href={{ pathname: "/", hash: "contact" }}
                                    className="bg-primary mt-2 flex cursor-pointer items-center rounded-md px-4 py-2 text-white"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2 h-5 w-5"
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
