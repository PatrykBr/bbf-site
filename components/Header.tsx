"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { contactInfo } from "@/lib/data/contact";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [isNavigating, setIsNavigating] = useState(false);

    const navLinks = [
        { href: "/", label: "HOME", section: "home" },
        { href: "/#work", label: "WORK", section: "work" },
        { href: "/#about", label: "ABOUT", section: "about" }
    ];

    const handleNavClick = (section: string) => {
        setIsNavigating(true);
        setActiveSection(section);
        // Re-enable observer updates after scroll completes
        setTimeout(() => setIsNavigating(false), 1000);
    };

    useEffect(() => {
        const sections = ["home", "work", "about", "contact"];

        const observers: IntersectionObserver[] = [];

        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (!element) return;

            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !isNavigating) {
                            // Map contact section to "about" since it's not in nav
                            const navSection = sectionId === "contact" ? "about" : sectionId;
                            setActiveSection(navSection);
                        }
                    });
                },
                { threshold: [0.1, 0.2, 0.3], rootMargin: "-80px 0px -40% 0px" }
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => {
            observers.forEach(observer => observer.disconnect());
        };
    }, [isNavigating]);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-brand-dark/90 fixed top-0 right-0 left-0 z-50 backdrop-blur-xs"
        >
            <div className="mx-auto px-6 py-2 sm:px-10 lg:px-25">
                <div className="flex h-16 items-center justify-between md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex h-full items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative aspect-715/349 h-[75%]"
                        >
                            <Image
                                src="/logo.webp"
                                alt="Bespoke Broncel Furniture"
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation - Two Row Layout */}
                    <div className="hidden flex-col items-end gap-1 md:flex">
                        {/* Top Row: Phone & Contact Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-4"
                        >
                            <a
                                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                className="flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                                <span>{contactInfo.phone}</span>
                            </a>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href="/#contact"
                                    className="bg-brand-light inline-block rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                >
                                    Contact Us
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Bottom Row: Navigation Links with Animated Underline */}
                        <nav className="flex items-center gap-8">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (index + 1) }}
                                    className="relative py-1"
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => handleNavClick(link.section)}
                                        className={`text-sm font-semibold tracking-wide transition-colors ${
                                            activeSection === link.section
                                                ? "text-white"
                                                : "text-white/80 hover:text-white"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                    {activeSection === link.section && (
                                        <motion.div
                                            layoutId="activeSection"
                                            className="bg-brand-light absolute right-0 -bottom-0.5 left-0 -mx-1 h-[2.5px] rounded-xs"
                                            transition={{ type: "spring", stiffness: 380, damping: 25 }}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </nav>
                    </div>

                    {/* Mobile Menu Button & Contact */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Link
                            href="/#contact"
                            className="bg-brand-light rounded-lg px-5 py-1.5 text-sm font-medium text-white"
                        >
                            Contact
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-white"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-white/10 py-4 md:hidden"
                        >
                            <nav className="flex flex-col gap-4">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block font-medium text-white/80 transition-colors hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                                <motion.a
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                    className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                    {contactInfo.phone}
                                </motion.a>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
