import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
    keyPrefix: "ip-limit",
    points: 1,
    duration: 60,
    blockDuration: 60
});

const emailLimiter = new RateLimiterMemory({
    keyPrefix: "email-limit",
    points: 3,
    duration: 60 * 60,
    blockDuration: 60 * 60
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
        const { name, email, phone, message } = await request.json();

        if (!email || !name || !message) {
            return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
        }

        try {
            await rateLimiter.consume(ip);
            await emailLimiter.consume(email.toLowerCase());
        } catch (rateLimiterError: unknown) {
            console.log("Rate limit exceeded:", ip, email);

            const msBeforeNext = (rateLimiterError as { msBeforeNext?: number }).msBeforeNext || 60000;
            const cooldownSeconds = Math.ceil(msBeforeNext / 1000);

            return NextResponse.json(
                {
                    error: "Too many submissions. Please try again later.",
                    cooldown: true,
                    cooldownSeconds
                },
                { status: 429 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const senderName = name.replace(/[^\w\s]/gi, "").trim();

        const mailOptions = {
            from: {
                name: "Broncel Furniture Website",
                address: process.env.SMTP_USER as string
            },
            replyTo: email,
            to: process.env.CONTACT_EMAIL || "broncelfurniture@gmail.com",
            subject: `New Enquiry from ${senderName} - Broncel Furniture`,
            headers: {
                "X-Priority": "1",
                "X-MSMail-Priority": "High",
                Importance: "high",
                "X-Contact-Form": "true",
                "X-Sender-IP": ip
            },
            text: `
New contact form submission from your website:

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
IP Address: ${ip}

Message:
${message}

---
This email was sent from the contact form on broncelfurniture.com
      `.trim(),
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #2c5282;">
    <h2 style="color: #2c5282; margin-top: 0;">New Website Enquiry</h2>
    <div style="background-color: white; padding: 20px; border-radius: 4px; margin-top: 20px;">
      <p style="margin-bottom: 20px;"><strong>Contact Details:</strong></p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>Name:</strong></td>
          <td style="padding: 8px 0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Email:</strong></td>
          <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2c5282;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Phone:</strong></td>
          <td style="padding: 8px 0;">${phone || "Not provided"}</td>
        </tr>
      </table>
      
      <div style="margin-top: 20px;">
        <p style="margin-bottom: 10px;"><strong>Message:</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
          ${message.replace(/\n/g, "<br>")}
        </div>
      </div>
    </div>
    
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #718096;">
      <p>This email was sent from the contact form on broncelfurniture.com</p>
    </div>
  </div>
</body>
</html>
      `.trim()
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
