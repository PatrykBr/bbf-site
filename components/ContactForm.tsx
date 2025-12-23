"use client";

import { useState, useCallback } from "react";
import { validateContactForm } from "@/lib/utils";
import type { ContactFormData, ContactApiResponse } from "@/lib/types";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [honeypot, setHoneypot] = useState(""); // Hidden field for bot detection
    const [formRenderedAt] = useState(() => Date.now()); // Track when form was rendered
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<FormStatus>("idle");
    const [statusMessage, setStatusMessage] = useState("");

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));

            // Clear error when user starts typing
            if (errors[name]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            // Validate form
            const validation = validateContactForm({
                name: formData.name,
                email: formData.email,
                message: formData.message
            });

            if (!validation.isValid) {
                setErrors(validation.errors);
                return;
            }

            setStatus("submitting");
            setErrors({});

            try {
                const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...formData,
                        _honeypot: honeypot,
                        _formRenderedAt: formRenderedAt
                    })
                });

                const result: ContactApiResponse = await response.json();

                if (result.success) {
                    setStatus("success");
                    setStatusMessage(result.message);
                    // Reset form
                    setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        message: ""
                    });
                } else {
                    setStatus("error");
                    setStatusMessage(result.message || "Something went wrong. Please try again.");
                    console.error("[Contact Form] Error:", result.error);
                }
            } catch (error) {
                setStatus("error");
                setStatusMessage("Unable to send message. Please try again or contact us directly.");
                console.error("[Contact Form] Network error:", error);
            }
        },
        [formData, honeypot, formRenderedAt]
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field - hidden from users, bots will fill it */}
            <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                <label htmlFor="_honeypot">Leave this field empty</label>
                <input
                    type="text"
                    id="_honeypot"
                    name="_honeypot"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>
            {/* Name Field */}
            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`focus:ring-brand-light w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your Name"
                    disabled={status === "submitting"}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`focus:ring-brand-light w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your Email"
                    disabled={status === "submitting"}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Phone Field (Optional) */}
            <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                    Phone Number <span className="font-normal text-gray-400">(Optional)</span>
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="focus:ring-brand-light w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:border-transparent focus:ring-2"
                    placeholder="Your Phone Number"
                    disabled={status === "submitting"}
                />
            </div>

            {/* Message Field */}
            <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                    Message <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`focus:ring-brand-light w-full resize-none rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us about your project..."
                    disabled={status === "submitting"}
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
            </div>

            {/* Status Message */}
            {status === "success" && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                    {statusMessage}
                </div>
            )}

            {status === "error" && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{statusMessage}</div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-brand-dark hover:bg-brand-light flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                {status === "submitting" ? (
                    <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Sending...
                    </>
                ) : (
                    <>
                        Send Message
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    </>
                )}
            </button>
        </form>
    );
}
