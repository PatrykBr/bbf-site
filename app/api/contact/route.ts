import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHash, randomUUID } from "crypto";
import { isIP } from "net";
import fs from "fs";
import path from "path";
import { validateContactForm } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ContactApiResponse, ContactFormData } from "@/lib/types";

// Extended form data that includes anti-spam fields
interface ContactFormSubmission extends ContactFormData {
    _honeypot?: string; // Hidden field - should always be empty
    _formRenderedAt?: number; // Timestamp when form was rendered
}

// Read logo file and convert to base64 for inline email embedding
const logoPath = path.join(process.cwd(), "public", "logo.webp");
const logoBase64 = fs.existsSync(logoPath) ? fs.readFileSync(logoPath).toString("base64") : null;

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email recipient
const TO_EMAIL = process.env.RESEND_TO_EMAIL || "broncelfurniture@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const MAX_BODY_BYTES = 10 * 1024;
const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const BOT_MESSAGE = "Thank you for your message! We'll get back to you within 24 hours.";

interface ParsedBodySuccess {
    success: true;
    data: ContactFormSubmission;
}

interface ParsedBodyFailure {
    success: false;
    code: "INVALID_JSON" | "BODY_TOO_LARGE";
}

type ParsedBodyResult = ParsedBodySuccess | ParsedBodyFailure;

export async function POST(request: NextRequest): Promise<NextResponse<ContactApiResponse>> {
    const requestId = randomUUID();
    const clientIp = getClientIp(request);
    const rateLimitIdentifier = getRateLimitIdentifier(request, clientIp);

    try {
        const rateLimit = await checkRateLimit(rateLimitIdentifier, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS);
        const rateLimitHeaders = getRateLimitHeaders(rateLimit);

        if (!rateLimit.success) {
            logInfo(requestId, "Rate limit exceeded", {
                clientIpHash: hashValue(clientIp),
                resetIn: rateLimit.resetIn,
                source: rateLimit.source
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

        if (!request.headers.get("content-type")?.includes("application/json")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid content type.",
                    error: "INVALID_CONTENT_TYPE"
                },
                { status: 415, headers: rateLimitHeaders }
            );
        }

        const parsedBody = await parseJsonBody(request, MAX_BODY_BYTES);
        if (!parsedBody.success) {
            const isBodyTooLarge = parsedBody.code === "BODY_TOO_LARGE";

            return NextResponse.json(
                {
                    success: false,
                    message: isBodyTooLarge ? "Request is too large." : "Invalid request payload.",
                    error: parsedBody.code
                },
                { status: isBodyTooLarge ? 413 : 400, headers: rateLimitHeaders }
            );
        }

        const body = parsedBody.data;

        // Honeypot check - if filled, it's likely a bot
        if (body._honeypot) {
            logInfo(requestId, "Honeypot triggered", {
                clientIpHash: hashValue(clientIp)
            });

            return NextResponse.json(
                {
                    success: true,
                    message: BOT_MESSAGE
                },
                { headers: rateLimitHeaders }
            );
        }

        // Time-based check - form submitted too quickly (less than 3 seconds)
        if (body._formRenderedAt) {
            const submissionTime = Date.now() - body._formRenderedAt;
            if (submissionTime < 3000) {
                logInfo(requestId, "Submission rejected by speed trap", {
                    clientIpHash: hashValue(clientIp),
                    submissionTime
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: BOT_MESSAGE
                    },
                    { headers: rateLimitHeaders }
                );
            }
        }

        // Validate form data
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
                    message: "Please check the form for errors.",
                    error: "VALIDATION_ERROR",
                    fieldErrors: validation.errors
                },
                { status: 400, headers: rateLimitHeaders }
            );
        }

        // Check if Resend is configured
        if (!resend) {
            logError(requestId, "Resend is not configured");

            // In development, log the message instead of sending
            if (process.env.NODE_ENV === "development") {
                logInfo(requestId, "Accepted contact form in development mode", {
                    clientIpHash: hashValue(clientIp)
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: "Message logged (dev mode). Configure RESEND_API_KEY for actual email delivery."
                    },
                    { headers: rateLimitHeaders }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    message: "Email service is not configured. Please contact us directly.",
                    error: "RESEND_NOT_CONFIGURED"
                },
                { status: 500, headers: rateLimitHeaders }
            );
        }

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [TO_EMAIL],
            subject: `New Contact Form Submission from ${body.name}`,
            replyTo: body.email,
            html: buildEmailHtml(body),
            text: buildEmailText(body),
            attachments: logoBase64
                ? [
                      {
                          content: logoBase64,
                          filename: "logo.webp",
                          contentId: "company-logo",
                          contentType: "image/webp"
                      }
                  ]
                : []
        });

        if (error) {
            logError(requestId, "Resend delivery failed", {
                resendErrorName: error.name
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to send message. Please try again later.",
                    error: "DELIVERY_FAILED"
                },
                { status: 502, headers: rateLimitHeaders }
            );
        }

        logInfo(requestId, "Email sent successfully", {
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
                message: "An unexpected error occurred. Please try again.",
                error: "INTERNAL_ERROR"
            },
            { status: 500 }
        );
    }
}

function buildEmailHtml(body: ContactFormSubmission): string {
    const phoneRow = body.phone
        ? `
            <!-- Phone -->
            <table role="presentation" style="width: 100%;">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <div style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 10px; text-align: center; line-height: 38px; font-size: 17px;">📱</div>
                </td>
                <td style="vertical-align: middle; padding-left: 14px;">
                  <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500;">Phone / WhatsApp</p>
                  <a href="tel:${escapeHtml(body.phone)}" style="display: inline-block; margin: 4px 0 0; color: #a8d98a; font-size: 17px; font-weight: 600; text-decoration: none;">${escapeHtml(body.phone)}</a>
                </td>
              </tr>
            </table>`
        : "";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #21450d; font-family: 'Outfit', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #21450d;">
    <tr><td style="padding: 0;">
      <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #21450d;">
        <tr>
          <td style="background: linear-gradient(135deg, #162e08 0%, #21450d 50%, #2d5a14 100%); padding: 40px 40px 35px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <img src="cid:company-logo" alt="Bespoke Broncel Furniture" style="max-height: 70px; max-width: 220px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">✉️ New Message Received</h1>
            <p style="margin: 12px 0 0; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 400;">Someone reached out via your website contact form</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 40px 20px;">
            <table role="presentation" style="width: 100%; background: rgba(255,255,255,0.08); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <tr><td style="padding: 24px 26px;">
                <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                  <tr>
                    <td style="width: 44px; vertical-align: top;"><div style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 10px; text-align: center; line-height: 38px; font-size: 17px;">👤</div></td>
                    <td style="vertical-align: middle; padding-left: 14px;">
                      <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500;">Name</p>
                      <p style="margin: 4px 0 0; color: #ffffff; font-size: 17px; font-weight: 600;">${escapeHtml(body.name)}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                  <tr>
                    <td style="width: 44px; vertical-align: top;"><div style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 10px; text-align: center; line-height: 38px; font-size: 17px;">📧</div></td>
                    <td style="vertical-align: middle; padding-left: 14px;">
                      <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500;">Email</p>
                      <a href="mailto:${escapeHtml(body.email)}" style="display: inline-block; margin: 4px 0 0; color: #a8d98a; font-size: 17px; font-weight: 600; text-decoration: none;">${escapeHtml(body.email)}</a>
                    </td>
                  </tr>
                </table>
                ${phoneRow}
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 40px 30px;">
            <p style="margin: 0 0 12px; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">💬 Message</p>
            <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(body.message)}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 40px 30px; text-align: center;">
            <a href="mailto:${escapeHtml(body.email)}?subject=Re: Your inquiry to Bespoke Broncel Furniture" style="display: inline-block; background: #ffffff; color: #21450d; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px;">Reply to ${escapeHtml(body.name.split(" ")[0])}</a>
          </td>
        </tr>
        <tr>
          <td style="background: rgba(0,0,0,0.15); padding: 22px 40px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
            <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 600;">Bespoke Broncel Furniture</p>
            <p style="margin: 6px 0 0; color: rgba(255,255,255,0.5); font-size: 12px;">Crafting Dreams Into Reality</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailText(body: ContactFormSubmission): string {
    return `New Contact Form Submission

Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone || "Not provided"}

Message:
${body.message}

---
Sent from Bespoke Broncel Furniture website`;
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function hashValue(value: string): string {
    return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function logInfo(requestId: string, message: string, context?: Record<string, unknown>) {
    if (context) {
        console.log(`[Contact API][${requestId}] ${message}`, context);
        return;
    }

    console.log(`[Contact API][${requestId}] ${message}`);
}

function logError(requestId: string, message: string, context?: Record<string, unknown>) {
    if (context) {
        console.error(`[Contact API][${requestId}] ${message}`, context);
        return;
    }

    console.error(`[Contact API][${requestId}] ${message}`);
}

function getClientIp(request: NextRequest): string {
    const ipHeaders = ["x-vercel-forwarded-for", "cf-connecting-ip", "x-real-ip", "x-forwarded-for"];

    for (const header of ipHeaders) {
        const value = request.headers.get(header);

        if (!value) {
            continue;
        }

        for (const candidate of value.split(",")) {
            const ip = candidate.trim();

            if (isIP(ip)) {
                return ip;
            }
        }
    }

    return "unknown";
}

function getRateLimitIdentifier(request: NextRequest, clientIp: string): string {
    if (clientIp !== "unknown") {
        return `ip:${hashValue(clientIp)}`;
    }

    const userAgent = request.headers.get("user-agent") || "unknown";
    return `ua:${hashValue(userAgent)}`;
}

function getRateLimitHeaders(rateLimit: Awaited<ReturnType<typeof checkRateLimit>>): HeadersInit {
    return {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetIn)
    };
}

async function parseJsonBody(request: NextRequest, maxBodyBytes: number): Promise<ParsedBodyResult> {
    const contentLengthHeader = request.headers.get("content-length");
    const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN;

    if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
        return {
            success: false,
            code: "BODY_TOO_LARGE"
        };
    }

    let rawBody: string;
    try {
        rawBody = await request.text();
    } catch {
        return {
            success: false,
            code: "INVALID_JSON"
        };
    }

    if (Buffer.byteLength(rawBody, "utf8") > maxBodyBytes) {
        return {
            success: false,
            code: "BODY_TOO_LARGE"
        };
    }

    try {
        const parsed = JSON.parse(rawBody) as Record<string, unknown>;

        if (!parsed || typeof parsed !== "object") {
            return {
                success: false,
                code: "INVALID_JSON"
            };
        }

        const sanitizedBody: ContactFormSubmission = {
            name: typeof parsed.name === "string" ? parsed.name : "",
            email: typeof parsed.email === "string" ? parsed.email : "",
            phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
            message: typeof parsed.message === "string" ? parsed.message : "",
            _honeypot: typeof parsed._honeypot === "string" ? parsed._honeypot : undefined,
            _formRenderedAt: typeof parsed._formRenderedAt === "number" ? parsed._formRenderedAt : undefined
        };

        return {
            success: true,
            data: sanitizedBody
        };
    } catch {
        return {
            success: false,
            code: "INVALID_JSON"
        };
    }
}
