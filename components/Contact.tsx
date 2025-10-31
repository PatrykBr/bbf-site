"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePostHog } from "posthog-js/react";
import {
    RATE_LIMIT_COOLDOWN_SECONDS,
    HTTP_STATUS_TOO_MANY_REQUESTS,
    SUCCESS_MESSAGE_DURATION
} from "../constants/config";
import { ContactEvents } from "../constants/analytics";
import { validateContactForm } from "@/utils/validation";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string>("");
    const [cooldown, setCooldown] = useState(false);
    const [cooldownTimeLeft, setCooldownTimeLeft] = useState(RATE_LIMIT_COOLDOWN_SECONDS);

    const posthog = usePostHog();

    useEffect(() => {
        if (!cooldown || cooldownTimeLeft <= 0) return;

        const timer = setTimeout(() => {
            setCooldownTimeLeft(prev => {
                const newValue = prev - 1;
                if (newValue <= 0) {
                    setCooldown(false);
                    return 0;
                }
                return newValue;
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [cooldown, cooldownTimeLeft]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => {
                const { [name]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateContactForm(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0 || cooldown) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === HTTP_STATUS_TOO_MANY_REQUESTS && data.cooldown) {
                    setCooldown(true);
                    setCooldownTimeLeft(data.cooldownSeconds || RATE_LIMIT_COOLDOWN_SECONDS);
                    setSubmitError(
                        `Rate limit exceeded. Please wait ${
                            data.cooldownSeconds || RATE_LIMIT_COOLDOWN_SECONDS
                        } seconds before trying again.`
                    );
                    return;
                }
                throw new Error(data.error || "Failed to send message");
            }

            setFormData({ name: "", email: "", phone: "", message: "" });
            setSubmitSuccess(true);

            setTimeout(() => setSubmitSuccess(false), SUCCESS_MESSAGE_DURATION);
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitError(error instanceof Error ? error.message : "Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="bg-secondary relative overflow-hidden py-20" aria-labelledby="contact-heading">
            <div className="relative z-10 container mx-auto px-6 md:px-8 lg:px-16">
                <div className="relative mb-16 text-center">
                    <div className="bg-secondary/30 absolute -top-10 left-1/2 hidden h-1 w-40 -translate-x-1/2 transform md:block"></div>
                    <h2
                        id="contact-heading"
                        className="font-poppins relative mb-4 inline-block text-4xl font-bold text-white md:text-5xl"
                    >
                        Get In Touch
                        <div className="bg-primary absolute -bottom-3 left-0 h-1 w-full"></div>
                    </h2>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:items-stretch">
                    {/* Contact Info - 2 columns */}
                    <div className="order-1 flex flex-col space-y-8 lg:order-1 lg:col-span-2 lg:space-y-0 xl:space-y-8">
                        {/* Contact Methods Card */}
                        <div className="border-secondary relative transform overflow-hidden rounded-lg border-l-4 bg-white/90 p-5 shadow-xl backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] sm:p-6 lg:flex lg:h-full lg:flex-col xl:flex-1">
                            <h3 className="text-primary relative mb-6 pb-3 text-xl font-bold sm:text-2xl">
                                Contact Methods
                                <span className="bg-secondary absolute bottom-0 left-0 h-0.5 w-16"></span>
                                <span className="bg-primary/10 absolute bottom-0 left-16 h-0.5 w-full"></span>
                            </h3>

                            <div className="relative z-10 space-y-6 sm:space-y-8 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
                                {/* Phone Contact */}
                                <a
                                    href="tel:+44 7523 706742"
                                    className="block cursor-pointer"
                                    onClick={() =>
                                        posthog.capture(ContactEvents.METHOD_CLICK, {
                                            method: "phone",
                                            location: "contact_section"
                                        })
                                    }
                                >
                                    <div className="group hover:bg-secondary/5 -m-2 flex items-start rounded-lg p-2 transition-colors duration-300 sm:-m-3 sm:p-3">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-all duration-300 group-hover:shadow-md sm:h-14 sm:w-14">
                                            <Image
                                                src="/phone.webp"
                                                alt="Phone Icon"
                                                width={25}
                                                height={25}
                                                className="object-contain transition-all duration-300 group-hover:brightness-110"
                                            />
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                <h4 className="text-dark-gray group-hover:text-primary text-sm font-medium transition-colors duration-300 sm:text-base">
                                                    Phone
                                                </h4>
                                                <span className="text-primary border-primary rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                                                    Preferred
                                                </span>
                                            </div>
                                            <div className="text-primary mt-1 inline-block text-base font-semibold transition-transform duration-300 group-hover:translate-x-1 sm:text-lg">
                                                +44 7523 706742
                                            </div>
                                            <p className="text-dark-gray/70 group-hover:text-dark-gray/90 mt-1 text-xs transition-colors duration-300 sm:text-sm">
                                                Available Monday-Friday, 9am-6pm
                                            </p>
                                        </div>
                                    </div>
                                </a>

                                {/* Email Contact */}
                                <a
                                    href="mailto:broncelfurniture@gmail.com"
                                    className="block cursor-pointer"
                                    onClick={() =>
                                        posthog.capture(ContactEvents.METHOD_CLICK, {
                                            method: "email",
                                            location: "contact_section"
                                        })
                                    }
                                >
                                    <div className="group hover:bg-secondary/5 -m-2 flex items-start rounded-lg p-2 transition-colors duration-300 sm:-m-3 sm:p-3">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-all duration-300 group-hover:shadow-md sm:h-14 sm:w-14">
                                            <Image
                                                src="/email.webp"
                                                alt="Email Icon"
                                                width={25}
                                                height={25}
                                                className="object-contain transition-all duration-300 group-hover:brightness-110"
                                            />
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                                            <h4 className="text-dark-gray group-hover:text-primary text-sm font-medium transition-colors duration-300 sm:text-base">
                                                Email
                                            </h4>
                                            <div className="text-primary mt-1 inline-block text-base text-[0.72rem] font-semibold break-all transition-transform duration-300 group-hover:translate-x-1 min-[430px]:text-base sm:text-lg lg:text-[0.85rem] xl:text-lg">
                                                broncelfurniture@gmail.com
                                            </div>
                                            <p className="text-dark-gray/70 group-hover:text-dark-gray/90 mt-1 text-xs transition-colors duration-300 sm:text-sm">
                                                We respond to emails within 24 hours
                                            </p>
                                        </div>
                                    </div>
                                </a>

                                {/* Facebook Contact */}
                                <a
                                    href="https://www.facebook.com/broncelfurniture/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block cursor-pointer"
                                    onClick={() =>
                                        posthog.capture(ContactEvents.METHOD_CLICK, {
                                            method: "facebook",
                                            location: "contact_section"
                                        })
                                    }
                                >
                                    <div className="group hover:bg-secondary/5 -m-2 flex items-start rounded-lg p-2 transition-colors duration-300 sm:-m-3 sm:p-3">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-all duration-300 group-hover:shadow-md sm:h-14 sm:w-14">
                                            <Image
                                                src="/facebook.webp"
                                                alt="Facebook Icon"
                                                width={25}
                                                height={25}
                                                className="object-contain transition-all duration-300 group-hover:brightness-110"
                                            />
                                        </div>
                                        <div className="ml-3 min-w-0 flex-1 sm:ml-4">
                                            <h4 className="text-dark-gray group-hover:text-primary text-sm font-medium transition-colors duration-300 sm:text-base">
                                                Facebook
                                            </h4>
                                            <div className="text-primary mt-1 inline-block truncate text-base text-[0.8rem] font-semibold transition-transform duration-300 group-hover:translate-x-1 min-[390px]:text-base sm:text-lg lg:text-[0.95rem] xl:text-lg">
                                                Bespoke Broncel Furniture
                                            </div>
                                            <p className="text-dark-gray/70 group-hover:text-dark-gray/90 mt-1 text-xs transition-colors duration-300 sm:text-sm">
                                                Follow us for latest updates and inspiration
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Studio Image Section */}
                        <div className="relative hidden h-24 overflow-hidden rounded-lg shadow-xl xl:flex">
                            <Image
                                src="/workshop.webp"
                                alt="Woodworking Workshop"
                                fill
                                className="object-cover"
                                style={{ objectPosition: "center 30%" }}
                            />
                            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                                <div className="px-6 pb-3 lg:px-8 lg:pb-4">
                                    <h3 className="mb-1 text-xl font-light tracking-wide text-white">
                                        Bespoke Broncel Furniture
                                    </h3>
                                    <div className="bg-secondary mb-2 h-px w-12"></div>
                                    <p className="text-sm tracking-wide text-white/80 uppercase">South Yorkshire, UK</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form - 3 columns */}
                    <div className="order-2 lg:order-2 lg:col-span-3">
                        <div className="border-primary relative h-full transform overflow-hidden rounded-lg border-t-4 bg-white/90 p-8 shadow-xl backdrop-blur-sm transition-transform duration-300 hover:scale-[1.01] md:p-10">
                            <div className="relative">
                                <h3 className="text-primary relative mb-6 inline-block pb-3 text-2xl font-bold">
                                    Send Us A Message
                                    <span className="bg-secondary absolute bottom-0 left-0 h-0.5 w-20"></span>
                                    <span className="bg-primary/10 absolute bottom-0 left-20 h-0.5 w-full"></span>
                                </h3>

                                <div className="min-h-[420px]">
                                    {submitSuccess ? (
                                        <div className="bg-secondary/10 border-secondary text-primary rounded-lg border p-8 text-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="text-secondary mx-auto mb-4 h-16 w-16"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <h4 className="mb-3 text-2xl font-bold">Thank You!</h4>
                                            <p className="mb-6 text-lg">
                                                Your message has been sent successfully. We&apos;ll get back to you
                                                soon.
                                            </p>
                                            <button
                                                onClick={() => setSubmitSuccess(false)}
                                                className="bg-secondary/10 text-secondary hover:bg-secondary cursor-pointer rounded-md px-6 py-2 font-medium transition-colors duration-300 hover:text-white"
                                            >
                                                Send another message
                                            </button>
                                        </div>
                                    ) : cooldown ? (
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="mx-auto mb-4 h-16 w-16 text-red-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <h4 className="mb-3 text-2xl font-bold">Please Wait</h4>
                                            <p className="mb-6 text-lg">
                                                You&apos;re submitting messages too quickly.
                                                <br />
                                                Please wait{" "}
                                                <span className="font-semibold">
                                                    {cooldownTimeLeft} second
                                                    {cooldownTimeLeft !== 1 ? "s" : ""}
                                                </span>{" "}
                                                before trying again.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                            {submitError && (
                                                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                                                    <p className="text-sm">{submitError}</p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="text-dark-gray mb-1 block text-sm font-medium"
                                                    >
                                                        Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            className={`bg-light-gray w-full rounded-md border px-4 py-3 ${
                                                                errors.name ? "border-red-500" : "border-gray-200"
                                                            } focus:ring-primary transition-all duration-200 focus:ring-2 focus:outline-none`}
                                                            placeholder="Your Name"
                                                        />
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            {errors.name && (
                                                                <span className="text-lg text-red-500">*</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {errors.name && (
                                                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="email"
                                                        className="text-dark-gray mb-1 block text-sm font-medium"
                                                    >
                                                        Email <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className={`bg-light-gray w-full rounded-md border px-4 py-3 ${
                                                                errors.email ? "border-red-500" : "border-gray-200"
                                                            } focus:ring-primary transition-all duration-200 focus:ring-2 focus:outline-none`}
                                                            placeholder="Your Email"
                                                        />
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            {errors.email && (
                                                                <span className="text-lg text-red-500">*</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {errors.email && (
                                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="text-dark-gray mb-1 block text-sm font-medium"
                                                >
                                                    Phone Number <span className="text-gray-400">(Optional)</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="bg-light-gray focus:ring-primary w-full rounded-md border border-gray-200 px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none"
                                                    placeholder="Your Phone Number"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="message"
                                                    className="text-dark-gray mb-1 block text-sm font-medium"
                                                >
                                                    Message <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        id="message"
                                                        name="message"
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        rows={5}
                                                        className={`bg-light-gray w-full rounded-md border px-4 py-3 ${
                                                            errors.message ? "border-red-500" : "border-gray-200"
                                                        } focus:ring-primary transition-all duration-200 focus:ring-2 focus:outline-none`}
                                                        placeholder="Tell us about your project..."
                                                    />
                                                    <div className="pointer-events-none absolute right-3 bottom-3">
                                                        {errors.message && (
                                                            <span className="text-lg text-red-500">*</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {errors.message && (
                                                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                                                )}
                                            </div>

                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className={`bg-primary w-full transform rounded-md px-6 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                                        isSubmitting
                                                            ? "cursor-not-allowed opacity-70"
                                                            : "cursor-pointer"
                                                    }`}
                                                >
                                                    <span className="relative flex items-center justify-center">
                                                        {isSubmitting ? (
                                                            <>
                                                                <svg
                                                                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    ></circle>
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    ></path>
                                                                </svg>
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Send Message
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="ml-2 h-5 w-5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                                    />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </span>
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
