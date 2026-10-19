"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { contactInfo, phoneHref } from "@/lib/data/contact";
import { ContactAction } from "./ContactAction";

const navLinks = [
    { href: "/", label: "Home", section: "home" },
    { href: "/work", label: "Work", section: "work" },
    { href: "/#about", label: "About", section: "about" }
] as const;

export function Header() {
    const pathname = usePathname();
    return <Navigation key={pathname} pathname={pathname} />;
}

function Navigation({ pathname }: { pathname: string }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const activeSectionForNav =
        pathname === "/"
            ? activeSection
            : pathname.startsWith("/work") || pathname === "/fitted-kitchens" || pathname === "/fitted-wardrobes"
              ? "work"
              : "";

    useEffect(() => {
        if (pathname !== "/") return;

        let observer: IntersectionObserver;
        const observeSections = () => {
            observer?.disconnect();
            observer = new IntersectionObserver(
                entries => {
                    const visible = entries.find(entry => entry.isIntersecting);
                    if (visible) setActiveSection(visible.target.id);
                },
                {
                    // Percentage root margins use viewport width, so use pixels for the header offset.
                    rootMargin: `-96px 0px -${Math.max(0, window.innerHeight - 97)}px 0px`
                }
            );
            for (const id of ["home", "work", "contact", "about"]) {
                const element = document.getElementById(id);
                if (element) observer.observe(element);
            }
        };
        observeSections();
        window.addEventListener("resize", observeSections);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", observeSections);
        };
    }, [pathname]);

    return (
        <header
            onKeyDown={event => {
                if (event.key === "Escape" && isMenuOpen) {
                    setIsMenuOpen(false);
                    menuButtonRef.current?.focus();
                }
            }}
            className="bg-brand-dark/90 fixed top-0 right-0 left-0 z-50 backdrop-blur-xs [&_a]:focus-visible:outline-white [&_button]:focus-visible:outline-white"
        >
            <div className="mx-auto px-6 py-2 sm:px-10 lg:px-25">
                <div className="flex h-16 items-center justify-between md:h-20">
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex h-full items-center gap-3">
                        <Image
                            src="/logo.webp"
                            alt="Bespoke Broncel Furniture"
                            width={715}
                            height={349}
                            className="h-[75%] w-auto"
                            loading="eager"
                            sizes="(min-width: 768px) 123px, 99px"
                        />
                    </Link>

                    <div className="hidden flex-col items-end gap-1 md:flex">
                        <div className="flex items-center gap-4">
                            <ContactAction
                                method="phone"
                                href={phoneHref}
                                className="text-sm font-semibold text-white/90 hover:text-white"
                            >
                                {contactInfo.phone}
                            </ContactAction>
                            <ContactAction className="bg-brand-light rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                                Contact us
                            </ContactAction>
                        </div>
                        <nav aria-label="Main navigation" className="flex items-center gap-8">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setActiveSection(link.section)}
                                    aria-current={activeSectionForNav === link.section ? "location" : undefined}
                                    className={`border-b-2 py-1 text-sm font-semibold tracking-wide transition-colors ${activeSectionForNav === link.section ? "border-brand-light text-white" : "border-transparent text-white/80 hover:text-white"}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <ContactAction
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-brand-light inline-flex min-h-11 items-center rounded-lg px-5 text-sm font-medium text-white"
                        >
                            Contact
                        </ContactAction>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex size-11 items-center justify-center text-white"
                            ref={menuButtonRef}
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-navigation"
                        >
                            <svg
                                className="size-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <nav
                    id="mobile-navigation"
                    aria-label="Mobile navigation"
                    hidden={!isMenuOpen}
                    className="border-t border-white/10 py-2 md:hidden"
                >
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            aria-current={activeSectionForNav === link.section ? "location" : undefined}
                            className="flex min-h-11 items-center font-medium text-white/80 hover:text-white"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <ContactAction
                        method="phone"
                        href={phoneHref}
                        className="flex min-h-11 items-center text-sm text-white/80 hover:text-white"
                    >
                        {contactInfo.phone}
                    </ContactAction>
                </nav>
            </div>
        </header>
    );
}
