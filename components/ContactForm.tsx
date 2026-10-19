"use client";

import { useReducer, useCallback, useEffect, useRef, type ChangeEvent, type SubmitEvent } from "react";
import { validateContactForm } from "@/lib/contact";
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
    | { type: "SET_FIELD"; name: keyof ContactFormData; value: string }
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
            return {
                ...state,
                status: "idle",
                statusMessage: "",
                formData: { ...state.formData, [action.name]: action.value },
                errors
            };
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
    const submittingRef = useRef(false);
    const formRenderedAtRef = useRef<number>(0);

    useEffect(() => {
        formRenderedAtRef.current = Date.now();
    }, []);

    const updateField = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        dispatch({
            type: "SET_FIELD",
            name: e.currentTarget.name as keyof ContactFormData,
            value: e.currentTarget.value
        });
    }, []);

    const handleSubmit = useCallback(
        async (e: SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (submittingRef.current) return;
            const form = e.currentTarget;

            const validation = validateContactForm(state.formData);
            if (!validation.isValid) {
                dispatch({ type: "SET_ERRORS", errors: validation.errors });
                const field = form.elements.namedItem(Object.keys(validation.errors)[0]);
                if (field instanceof HTMLElement) field.focus();
                return;
            }

            submittingRef.current = true;
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

                if (response.ok && result.success) {
                    dispatch({ type: "SUBMIT_SUCCESS", message: result.message });
                } else {
                    dispatch({
                        type: "SUBMIT_ERROR",
                        message: result.message || "Your message could not be sent. Please try again.",
                        fieldErrors: result.fieldErrors
                    });

                    if (process.env.NODE_ENV === "development") {
                        console.error("[Contact form] Error:", result.error);
                    }
                }
            } catch (error) {
                dispatch({
                    type: "SUBMIT_ERROR",
                    message: "Your message could not be sent. Please try again, or call or email us."
                });

                if (process.env.NODE_ENV === "development") {
                    console.error("[Contact form] Network error:", error);
                }
            } finally {
                submittingRef.current = false;
            }
        },
        [state.formData, state.honeypot]
    );

    const { formData, errors, status, statusMessage, honeypot } = state;

    return (
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
            {/* Bots may fill this hidden field. Send its value as _honeypot. */}
            <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                    type="text"
                    id="website"
                    name="website"
                    value={honeypot}
                    onChange={e => dispatch({ type: "SET_HONEYPOT", value: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>
            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    value={formData.name}
                    onChange={updateField}
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`focus:ring-brand-light w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your name"
                    disabled={status === "submitting"}
                />
                {errors.name ? (
                    <p id="name-error" className="mt-1 text-sm text-red-500">
                        {errors.name}
                    </p>
                ) : null}
            </div>

            <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    maxLength={254}
                    value={formData.email}
                    onChange={updateField}
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`focus:ring-brand-light w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your email address"
                    disabled={status === "submitting"}
                />
                {errors.email ? (
                    <p id="email-error" className="mt-1 text-sm text-red-500">
                        {errors.email}
                    </p>
                ) : null}
            </div>

            <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                    Phone number <span className="font-normal text-gray-400">Optional</span>
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    maxLength={30}
                    value={formData.phone}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    className={`focus:ring-brand-light w-full rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Your phone number"
                    disabled={status === "submitting"}
                />
                {errors.phone ? (
                    <p id="phone-error" className="mt-1 text-sm text-red-500">
                        {errors.phone}
                    </p>
                ) : null}
            </div>

            <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                    Message <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    maxLength={5000}
                    value={formData.message}
                    onChange={updateField}
                    rows={5}
                    required
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`focus:ring-brand-light w-full resize-none rounded-lg border px-4 py-2 transition-colors focus:border-transparent focus:ring-2 ${
                        errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Tell us what you would like made"
                    disabled={status === "submitting"}
                />
                {errors.message ? (
                    <p id="message-error" className="mt-1 text-sm text-red-500">
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
        </form>
    );
}
