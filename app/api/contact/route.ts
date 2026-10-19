import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { randomUUID } from "node:crypto";
import { parseContactBody, getRateLimitIdentifier } from "@/lib/contact-request";
import { buildEmailHtml, buildEmailText } from "@/lib/contact-email";
import { contactInfo } from "@/lib/data/contact";
import { validateContactForm } from "@/lib/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ContactApiResponse } from "@/lib/types";
import { getPastWorkBySlug } from "@/lib/data/past-work";
import { getSiteUrl } from "@/lib/site-config";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const TO_EMAIL = process.env.RESEND_TO_EMAIL || contactInfo.email;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const BOT_MESSAGE = "Thanks for your enquiry. We'll reply within 24 hours.";

export async function POST(request: NextRequest): Promise<NextResponse<ContactApiResponse>> {
    const requestId = randomUUID();
    const rateLimitIdentifier = getRateLimitIdentifier(request.headers);

    try {
        const rateLimit = await checkRateLimit(
            rateLimitIdentifier,
            MAX_REQUESTS_PER_WINDOW,
            RATE_LIMIT_WINDOW_MS
        ).catch(() => null);
        if (!rateLimit) {
            logError(requestId, "Contact rate limit is unavailable");
            return NextResponse.json(
                {
                    success: false,
                    message: "This form cannot send emails right now. Please call or email us.",
                    error: "RATE_LIMIT_UNAVAILABLE"
                },
                { status: 503, headers: { "Retry-After": "60" } }
            );
        }
        const rateLimitHeaders = getRateLimitHeaders(rateLimit);

        if (!rateLimit.success) {
            logInfo(requestId, "Rate limit exceeded", {
                resetIn: rateLimit.resetIn
            });

            return NextResponse.json(
                {
                    success: false,
                    message: `Too many submissions. Please try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`,
                    error: "RATE_LIMIT_EXCEEDED"
                },
                {
                    status: 429,
                    headers: {
                        ...rateLimitHeaders,
                        "Retry-After": String(rateLimit.resetIn)
                    }
                }
            );
        }

        if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
            return NextResponse.json(
                {
                    success: false,
                    message: "The form could not be submitted. Please reload the page and try again.",
                    error: "INVALID_CONTENT_TYPE"
                },
                { status: 415, headers: rateLimitHeaders }
            );
        }

        const parsedBody = await parseContactBody(request);
        if (!parsedBody.success) {
            const isBodyTooLarge = parsedBody.code === "BODY_TOO_LARGE";

            return NextResponse.json(
                {
                    success: false,
                    message: isBodyTooLarge ? "Your message is too large." : "The form data could not be read.",
                    error: parsedBody.code
                },
                { status: isBodyTooLarge ? 413 : 400, headers: rateLimitHeaders }
            );
        }

        const body = parsedBody.data;

        // A filled hidden field indicates a likely bot submission.
        if (body._honeypot) {
            logInfo(requestId, "Honeypot triggered");

            return NextResponse.json(
                {
                    success: true,
                    message: BOT_MESSAGE
                },
                { headers: rateLimitHeaders }
            );
        }

        // Autofill can produce fast submissions. Ask for a retry so visitors can
        // still send their enquiries.
        const renderedAt = body._formRenderedAt;
        if (renderedAt && Number.isFinite(renderedAt)) {
            const elapsed = Date.now() - renderedAt;
            if (elapsed >= 0 && elapsed < 3000) {
                return NextResponse.json(
                    { success: false, message: "Please wait a few seconds and try again.", error: "TOO_FAST" },
                    { status: 400, headers: rateLimitHeaders }
                );
            }
        }

        const validation = validateContactForm({
            name: body.name,
            email: body.email,
            phone: body.phone,
            message: body.message
        });

        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Check the highlighted fields and try again.",
                    error: "VALIDATION_ERROR",
                    fieldErrors: validation.errors
                },
                { status: 400, headers: rateLimitHeaders }
            );
        }

        if (!resend) {
            logError(requestId, "Resend is not configured");

            return NextResponse.json(
                {
                    success: false,
                    message: "This form cannot send emails right now. Please call or email us.",
                    error: "RESEND_NOT_CONFIGURED"
                },
                { status: 500, headers: rateLimitHeaders }
            );
        }

        const project = body.projectSlug ? getPastWorkBySlug(body.projectSlug) : undefined;
        const dataToSend = {
            name: body.name.trim(),
            email: body.email.trim(),
            phone: body.phone?.trim(),
            message: project
                ? `${body.message.trim()}\n\nProject reference: ${project.name}\n${getSiteUrl(`/work/${project.slug}`)}`
                : body.message.trim()
        };

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [TO_EMAIL],
            subject: `Furniture enquiry from ${dataToSend.name}`,
            replyTo: dataToSend.email,
            html: buildEmailHtml(dataToSend),
            text: buildEmailText(dataToSend)
        });

        if (error) {
            logError(requestId, "Resend delivery failed", {
                resendErrorName: error.name
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Your message could not be sent. Please try again later.",
                    error: "DELIVERY_FAILED"
                },
                { status: 502, headers: rateLimitHeaders }
            );
        }

        logInfo(requestId, "Email sent", {
            emailId: data?.id
        });

        return NextResponse.json(
            {
                success: true,
                message: BOT_MESSAGE
            },
            { headers: rateLimitHeaders }
        );
    } catch (error) {
        logError(requestId, "Unexpected server error", {
            errorName: error instanceof Error ? error.name : "unknown"
        });

        return NextResponse.json(
            {
                success: false,
                message: "Your message could not be sent. Please try again.",
                error: "INTERNAL_ERROR"
            },
            { status: 500 }
        );
    }
}

function getRateLimitHeaders(rateLimit: Awaited<ReturnType<typeof checkRateLimit>>): HeadersInit {
    return {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetIn)
    };
}

function logInfo(requestId: string, message: string, context?: Record<string, unknown>) {
    console.info(`[Contact API][${requestId}] ${message}`, context ?? "");
}

function logError(requestId: string, message: string, context?: Record<string, unknown>) {
    console.error(`[Contact API][${requestId}] ${message}`, context ?? "");
}
