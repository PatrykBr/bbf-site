"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ContactForm } from "./ContactForm";
import { contactInfo, businessHours } from "@/lib/data/contact";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5 }
    }
};

const hoverAnimation = {
    scale: 1.03,
    x: 8,
    transition: { duration: 0.2 }
};

export function ContactSection() {
    return (
        <section
            id="contact"
            className="bg-brand-light flex min-h-screen flex-col justify-center overflow-hidden py-20"
        >
            <div className="w-full px-4 sm:px-8 lg:px-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center text-3xl font-bold text-white sm:text-4xl"
                >
                    Get In Touch
                </motion.h2>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* Contact Methods */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm"
                    >
                        <h3 className="mb-6 text-xl font-semibold text-white">Contact Methods</h3>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            {/* Phone / WhatsApp (Preferred) */}
                            <motion.a
                                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                variants={itemVariants}
                                whileHover={hoverAnimation}
                                className="-m-3 flex cursor-pointer items-start gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
                            >
                                <div className="bg-brand-light flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                    <svg
                                        className="h-6 w-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="font-medium text-white">Phone / WhatsApp</span>
                                        <span className="bg-brand-light/50 rounded px-2 py-0.5 text-xs text-white">
                                            Preferred
                                        </span>
                                    </div>
                                    <span className="text-white">{contactInfo.phone}</span>
                                    <p className="mt-1 text-sm text-white/60">
                                        Available {businessHours.days}, {businessHours.hours}
                                    </p>
                                </div>
                            </motion.a>

                            {/* Email */}
                            <motion.a
                                href={`mailto:${contactInfo.email}`}
                                variants={itemVariants}
                                whileHover={hoverAnimation}
                                className="-m-3 flex cursor-pointer items-start gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500">
                                    <svg
                                        className="h-6 w-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <span className="mb-1 block font-medium text-white">Email</span>
                                    <span className="text-white">{contactInfo.email}</span>
                                    <p className="mt-1 text-sm text-white/60">We respond to emails within 24 hours</p>
                                </div>
                            </motion.a>

                            {/* Facebook */}
                            <motion.a
                                href={contactInfo.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                variants={itemVariants}
                                whileHover={hoverAnimation}
                                className="-m-3 flex cursor-pointer items-start gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]">
                                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="mb-1 block font-medium text-white">Facebook</span>
                                    <span className="text-white">Bespoke Broncel Furniture</span>
                                    <p className="mt-1 text-sm text-white/60">
                                        Follow us for latest updates and inspiration
                                    </p>
                                </div>
                            </motion.a>
                        </motion.div>

                        {/* Location Card with Background Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative mt-8 flex h-28 items-center justify-center overflow-hidden rounded-lg sm:h-40"
                        >
                            <Image
                                src="/contact-bg.webp"
                                alt="Furniture workshop"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

                            <div className="relative z-10 text-center">
                                <p className="text-xl font-bold text-white sm:text-2xl">Bespoke Broncel Furniture</p>
                                <p className="text-sm text-white/90 italic">South Yorkshire, UK</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="rounded-2xl bg-white p-8"
                    >
                        <h3 className="text-brand-dark mb-6 text-xl font-semibold">Send Us A Message</h3>
                        <ContactForm />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
