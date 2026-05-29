"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { validateContactForm } from "@/lib/utils";
import type { ContactFormData, ContactApiResponse } from "@/lib/types";

type FormStatus = "idle" | "submitting" | "success" | "error";

type FormState = {
    formData: ContactFormData;
    honeypot: string;
    errors: Record<string, string>;
    status: FormStatus;
    statusMessage: string;
};

type FormAction =
    | { type: "SET_FIELD"; name: string; value: string }
    | { type: "SET_HONEYPOT"; value: string }
    | { type: "SET_ERRORS"; errors: Record<string, string> }
    | { type: "SUBMIT_START" }
    | { type: "SUBMIT_SUCCESS"; message: string }
    | { type: "SUBMIT_ERROR"; message: string; fieldErrors?: Record<string, string> };

const initialState: FormState = {
    formData: { name: "", email: "", phone: "", message: "" },
    honeypot: "",
    errors: {},
    status: "idle",
    statusMessage: ""
};

function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case "SET_FIELD": {
            const errors = { ...state.errors };
            delete errors[action.name];
            return { ...state, formData: { ...state.formData, [action.name]: action.value }, errors };
        }
        case "SET_HONEYPOT":
            return { ...state, honeypot: action.value };
        case "SET_ERRORS":
            return { ...state, errors: action.errors };
        case "SUBMIT_START":
            return { ...state, status: "submitting", errors: {} };
        case "SUBMIT_SUCCESS":
            return {
                ...state,
                status: "success",
                statusMessage: action.message,
                errors: {},
                formData: { name: "", email: "", phone: "", message: "" }
            };
        case "SUBMIT_ERROR":
            return {
                ...state,
                status: "error",
                statusMessage: action.message,
                errors: action.fieldErrors ?? state.errors
            };
        default:
            return state;
    }
}

export function ContactForm() {
    const [state, dispatch] = useReducer(formReducer, initialState);
    const formRenderedAtRef = useRef<number>(0);

    useEffect(() => {
        formRenderedAtRef.current = Date.now();
    }, []);

    const updateField = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch({ type: "SET_FIELD", name: e.target.name, value: e.target.value });
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            const validation = validateContactForm(state.formData);
            if (!validation.isValid) {
                dispatch({ type: "SET_ERRORS", errors: validation.errors });
                return;
            }

            dispatch({ type: "SUBMIT_START" });

            try {
                const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...state.formData,
                        _honeypot: state.honeypot,
                        _formRenderedAt: formRenderedAtRef.current
                    })
                });

                const result: ContactApiResponse = await response.json();

                if (result.success) {
                    dispatch({ type: "SUBMIT_SUCCESS", message: result.message });
                } else {
                    dispatch({
                        type: "SUBMIT_ERROR",
                        message: result.message || "Something went wrong. Please try again.",
                        fieldErrors: result.fieldErrors
                    });

                    if (process.env.NODE_ENV === "development") {
                        console.error("[Contact Form] Error:", result.error);
                    }
                }
            } catch (error) {
                dispatch({
                    type: "SUBMIT_ERROR",
                    message: "Unable to send message. Please try again or contact us directly."
                });

                if (process.env.NODE_ENV === "development") {
                    console.error("[Contact Form] Network error:", error);
                }
            }
        },
        [state.formData, state.honeypot]
    );

    const { formData, errors, status, statusMessage, honeypot } = state;

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
                    onChange={e => dispatch({ type: "SET_HONEYPOT", value: e.target.value })}
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
                    onChange={updateField}
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`focus:ring-brand-light w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your Name"
                    disabled={status === "submitting"}
                />
                {errors.name ? (
                    <p id="name-error" className="mt-1 text-sm text-red-500">
                        {errors.name}
                    </p>
                ) : null}
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
                    onChange={updateField}
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`focus:ring-brand-light w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your Email"
                    disabled={status === "submitting"}
                />
                {errors.email ? (
                    <p id="email-error" className="mt-1 text-sm text-red-500">
                        {errors.email}
                    </p>
                ) : null}
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
                    onChange={updateField}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    className="focus:ring-brand-light w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:border-transparent focus:ring-2"
                    placeholder="Your Phone Number"
                    disabled={status === "submitting"}
                />
                {errors.phone ? (
                    <p id="phone-error" className="mt-1 text-sm text-red-500">
                        {errors.phone}
                    </p>
                ) : null}
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
                    onChange={updateField}
                    rows={5}
                    required
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`focus:ring-brand-light w-full resize-none rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us about your project..."
                    disabled={status === "submitting"}
                />
                {errors.message ? (
                    <p id="message-error" className="mt-1 text-sm text-red-500">
                        {errors.message}
                    </p>
                ) : null}
            </div>

            {/* Status Message */}
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

            {/* Submit Button */}
            <button
                type="submit"
                disabled={status === "submitting"}
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
                        Sending…
                    </>
                ) : (
                    <>
                        Send Message
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
        </form>
    );
}
