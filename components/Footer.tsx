import Link from "next/link";
import { contactInfo, companyInfo } from "@/lib/data/contact";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-brand-dark text-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
                    {/* Company Info */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">{companyInfo.name}</h3>
                        <p className="mb-4 text-sm leading-relaxed text-white/70">
                            Building your dream furniture with exceptional craftsmanship and attention to detail.
                        </p>
                        <div className="flex flex-col gap-2 text-sm text-white/70">
                            <a
                                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                className="transition-colors hover:text-white"
                            >
                                📞 {contactInfo.phone}
                            </a>
                            <p>📍 {companyInfo.location}</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" className="text-sm text-white/70 transition-colors hover:text-white">
                                Home
                            </Link>
                            <Link href="/#about" className="text-sm text-white/70 transition-colors hover:text-white">
                                About
                            </Link>
                            <Link href="/#work" className="text-sm text-white/70 transition-colors hover:text-white">
                                Work
                            </Link>
                            <Link href="/#contact" className="text-sm text-white/70 transition-colors hover:text-white">
                                Contact
                            </Link>
                        </nav>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Services</h3>
                        <nav className="flex flex-col gap-2">
                            <Link href="/#work" className="text-sm text-white/70 transition-colors hover:text-white">
                                Bespoke Wardrobes
                            </Link>
                            <Link href="/#work" className="text-sm text-white/70 transition-colors hover:text-white">
                                Custom Kitchens
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
                    <p className="text-sm text-white/60">
                        © {currentYear} {companyInfo.name}. All rights reserved.
                    </p>
                    <a
                        href={contactInfo.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 transition-colors hover:text-white"
                        aria-label="Facebook"
                    >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}
