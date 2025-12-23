import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
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

export async function POST(request: NextRequest): Promise<NextResponse<ContactApiResponse>> {
    try {
        // Get client IP for rate limiting
        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";

        // Check rate limit (5 submissions per hour per IP)
        const rateLimit = checkRateLimit(ip, 5, 60 * 60 * 1000);
        if (!rateLimit.success) {
            console.log(`[Contact API] Rate limit exceeded for IP: ${ip}`);
            return NextResponse.json(
                {
                    success: false,
                    message: `Too many submissions. Please try again in ${Math.ceil(rateLimit.resetIn / 60)} minutes.`,
                    error: "RATE_LIMIT_EXCEEDED"
                },
                { status: 429 }
            );
        }

        // Parse request body
        const body: ContactFormSubmission = await request.json();

        // Honeypot check - if filled, it's likely a bot
        if (body._honeypot) {
            console.log(`[Contact API] Honeypot triggered for IP: ${ip}`);
            // Return success to not reveal the trap to bots
            return NextResponse.json({
                success: true,
                message: "Thank you for your message! We'll get back to you within 24 hours."
            });
        }

        // Time-based check - form submitted too quickly (less than 3 seconds)
        if (body._formRenderedAt) {
            const submissionTime = Date.now() - body._formRenderedAt;
            if (submissionTime < 3000) {
                console.log(`[Contact API] Submission too fast (${submissionTime}ms) for IP: ${ip}`);
                // Return success to not reveal the trap to bots
                return NextResponse.json({
                    success: true,
                    message: "Thank you for your message! We'll get back to you within 24 hours."
                });
            }
        }

        // Validate form data
        const validation = validateContactForm({
            name: body.name,
            email: body.email,
            message: body.message
        });

        if (!validation.isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please check the form for errors.",
                    error: JSON.stringify(validation.errors)
                },
                { status: 400 }
            );
        }

        // Check if Resend is configured
        if (!resend) {
            console.error("[Contact API] Resend not configured. Set RESEND_API_KEY environment variable.");

            // In development, log the message instead of sending
            if (process.env.NODE_ENV === "development") {
                console.log("[Contact API] Development mode - Message received:", {
                    name: body.name,
                    email: body.email,
                    phone: body.phone || "Not provided",
                    message: body.message
                });

                return NextResponse.json({
                    success: true,
                    message: "Message logged (dev mode). Configure RESEND_API_KEY for actual email delivery."
                });
            }

            return NextResponse.json(
                {
                    success: false,
                    message: "Email service is not configured. Please contact us directly.",
                    error: "RESEND_NOT_CONFIGURED"
                },
                { status: 500 }
            );
        }

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [TO_EMAIL],
            subject: `New Contact Form Submission from ${body.name}`,
            replyTo: body.email,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #21450d; font-family: 'Outfit', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #21450d;">
            <tr>
              <td style="padding: 0;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #21450d;">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #162e08 0%, #21450d 50%, #2d5a14 100%); padding: 40px 40px 35px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                      <img src="cid:company-logo" alt="Bespoke Broncel Furniture" style="max-height: 70px; max-width: 220px; margin-bottom: 20px;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                        ✉️ New Message Received
                      </h1>
                      <p style="margin: 12px 0 0; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 400;">
                        Someone reached out via your website contact form
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Contact Card -->
                  <tr>
                    <td style="padding: 30px 40px 20px;">
                      <table role="presentation" style="width: 100%; background: rgba(255,255,255,0.08); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                        <tr>
                          <td style="padding: 24px 26px;">
                            <!-- Name -->
                            <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                              <tr>
                                <td style="width: 44px; vertical-align: top;">
                                  <div style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 10px; text-align: center; line-height: 38px; font-size: 17px;">
                                    👤
                                  </div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 14px;">
                                  <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500;">Name</p>
                                  <p style="margin: 4px 0 0; color: #ffffff; font-size: 17px; font-weight: 600;">${escapeHtml(
                                      body.name
                                  )}</p>
                                </td>
                              </tr>
                            </table>
                            
                            <!-- Email -->
                            <table role="presentation" style="width: 100%; margin-bottom: 16px;">
                              <tr>
                                <td style="width: 44px; vertical-align: top;">
                                  <div style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 10px; text-align: center; line-height: 38px; font-size: 17px;">
                                    📧
                                  </div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 14px;">
                                  <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500;">Email</p>
                                  <a href="mailto:${escapeHtml(
                                      body.email
                                  )}" style="display: inline-block; margin: 4px 0 0; color: #a8d98a; font-size: 17px; font-weight: 600; text-decoration: none;">
                                    ${escapeHtml(body.email)}
                                  </a>
                                </td>
                              </tr>
                            </table>
                            
                            ${
                                body.phone
                                    ? `
                            <!-- Phone -->
                            <table role="presentation" style="width: 100%;">
                              <tr>
                                <td style="width: 44px; vertical-align: top;">
                                  <div style="width: 38px; height: 38px; background: rgba(255,255,255,0.15); border-radius: 10px; text-align: center; line-height: 38px; font-size: 17px;">
                                    📱
                                  </div>
                                </td>
                                <td style="vertical-align: middle; padding-left: 14px;">
                                  <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500;">Phone / WhatsApp</p>
                                  <a href="tel:${escapeHtml(
                                      body.phone
                                  )}" style="display: inline-block; margin: 4px 0 0; color: #a8d98a; font-size: 17px; font-weight: 600; text-decoration: none;">
                                    ${escapeHtml(body.phone)}
                                  </a>
                                </td>
                              </tr>
                            </table>
                            `
                                    : ""
                            }
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Message Section -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="margin: 0 0 12px; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">
                        💬 Message
                      </p>
                      <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(
                            body.message
                        )}</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Quick Actions -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="mailto:${escapeHtml(
                                body.email
                            )}?subject=Re: Your inquiry to Bespoke Broncel Furniture" style="display: inline-block; background: #ffffff; color: #21450d; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px;">
                              Reply to ${escapeHtml(body.name.split(" ")[0])}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: rgba(0,0,0,0.15); padding: 22px 40px; border-top: 1px solid rgba(255,255,255,0.08);">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center;">
                            <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 600;">
                              Bespoke Broncel Furniture
                            </p>
                            <p style="margin: 6px 0 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                              Crafting Dreams Into Reality
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
            text: `
New Contact Form Submission

Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone || "Not provided"}

Message:
${body.message}

---
Sent from Bespoke Broncel Furniture website
      `,
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
            console.error("[Contact API] Resend error:", error);
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to send message. Please try again later.",
                    error: error.message
                },
                { status: 500 }
            );
        }

        console.log("[Contact API] Email sent successfully:", data?.id);

        return NextResponse.json({
            success: true,
            message: "Thank you for your message! We'll get back to you within 24 hours."
        });
    } catch (error) {
        console.error("[Contact API] Unexpected error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again.",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// Helper function to escape HTML
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
