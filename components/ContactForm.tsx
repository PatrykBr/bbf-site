"use client";

import { Suspense, useState, useEffect, useRef, type SubmitEvent } from "react";
import { validateContactForm } from "@/lib/contact";
import type { ContactFormData, ContactApiResponse } from "@/lib/types";
import { trackEnquiryResult } from "@/lib/posthog";
import { EnquiryProject } from "./EnquiryProject";

type FormStatus = "idle" | "submitting" | "success" | "error";

type FormState = {
    errors: Record<string, string>;
    status: FormStatus;
    statusMessage: string;
};

const initialState: FormState = {
    errors: {},
    status: "idle",
    statusMessage: ""
};

export function ContactForm({ projects }: { projects: { slug: string; name: string }[] }) {
    const [state, setState] = useState(initialState);
    const submittingRef = useRef(false);
    const formRenderedAtRef = useRef<number>(0);

    useEffect(() => {
        formRenderedAtRef.current = Date.now();
    }, []);

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (submittingRef.current) return;
        const form = e.currentTarget;
        const fields = new FormData(form);
        const formData: ContactFormData = {
            name: fields.get("name") as string,
            email: fields.get("email") as string,
            phone: fields.get("phone") as string,
            message: fields.get("message") as string
        };
        const honeypot = fields.get("website") as string;
        const projectSlug = (fields.get("projectSlug") as string | null) ?? undefined;

        const validation = validateContactForm(formData);
        if (!validation.isValid) {
            setState({ ...initialState, errors: validation.errors });
            const field = form.elements.namedItem(Object.keys(validation.errors)[0]);
            if (field instanceof HTMLElement) field.focus();
            return;
        }

        submittingRef.current = true;
        setState({ ...initialState, status: "submitting" });

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    projectSlug,
                    _honeypot: honeypot,
                    _formRenderedAt: formRenderedAtRef.current
                })
            });

            const result: ContactApiResponse = await response.json();

            if (response.ok && result.success) {
                if (!honeypot) trackEnquiryResult("success", projectSlug);
                form.reset();
                setState({ ...initialState, status: "success", statusMessage: result.message });
            } else {
                trackEnquiryResult("error", projectSlug);
                setState({
                    status: "error",
                    statusMessage: result.message || "Your message could not be sent. Please try again.",
                    errors: result.fieldErrors ?? {}
                });

                if (process.env.NODE_ENV === "development") {
                    console.error("[Contact form] Error:", result.error);
                }
            }
        } catch (error) {
            trackEnquiryResult("error", projectSlug);
            setState({
                ...initialState,
                status: "error",
                statusMessage: "Your message could not be sent. Please try again, or call or email us."
            });

            if (process.env.NODE_ENV === "development") {
                console.error("[Contact form] Network error:", error);
            }
        } finally {
            submittingRef.current = false;
        }
    }

    const { errors, status, statusMessage } = state;

    return (
        <form
            method="post"
            action="/api/contact"
            noValidate
            onSubmit={handleSubmit}
            onChange={event => {
                if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) return;
                const field = event.target.name;
                setState(current => {
                    const errors = { ...current.errors };
                    delete errors[field];
                    return { ...initialState, errors };
                });
            }}
        >
            <fieldset disabled={status === "submitting"} className="space-y-4">
                <Suspense fallback={null}>
                    <EnquiryProject projects={projects} />
                </Suspense>
                {/* Bots may fill this hidden field. Send its value as _honeypot. */}
                <div className="sr-only" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                        Name <span className="text-red-700">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        maxLength={80}
                        required
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className={`focus:ring-brand-dark w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                            errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Your name"
                    />
                    {errors.name ? (
                        <p id="name-error" className="mt-1 text-sm text-red-700">
                            {errors.name}
                        </p>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                        Email <span className="text-red-700">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        maxLength={254}
                        required
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`focus:ring-brand-dark w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                            errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Your email address"
                    />
                    {errors.email ? (
                        <p id="email-error" className="mt-1 text-sm text-red-700">
                            {errors.email}
                        </p>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                        Phone number <span className="font-normal text-gray-500">Optional</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        maxLength={30}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        className={`focus:ring-brand-dark w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Your phone number"
                    />
                    {errors.phone ? (
                        <p id="phone-error" className="mt-1 text-sm text-red-700">
                            {errors.phone}
                        </p>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                        Message <span className="text-red-700">*</span>
                    </label>
                    <p id="message-help" className="mb-2 text-sm leading-relaxed text-gray-600">
                        You can include your room layout, preferred finish or approximate measurements. These are
                        optional.
                    </p>
                    <textarea
                        id="message"
                        name="message"
                        maxLength={5000}
                        rows={5}
                        required
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? "message-help message-error" : "message-help"}
                        className={`focus:ring-brand-dark w-full resize-y rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                            errors.message ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Tell us what you would like made"
                    />
                    {errors.message ? (
                        <p id="message-error" className="mt-1 text-sm text-red-700">
                            {errors.message}
                        </p>
                    ) : null}
                </div>

                {status === "success" && (
                    <output
                        aria-live="polite"
                        className="block rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800"
                    >
                        {statusMessage}
                    </output>
                )}

                {status === "error" && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                    >
                        {statusMessage}
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-brand-dark hover:bg-brand-light flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {status === "submitting" ? (
                        <>
                            <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                            Send message
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </fieldset>
        </form>
    );
}
