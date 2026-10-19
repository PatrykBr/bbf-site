import type { ContactFormData } from "./types.ts";

function escapeHtml(value: string): string {
    return value.replace(
        /[&<>"']/g,
        character =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]!
    );
}

export function buildEmailHtml(body: ContactFormData): string {
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a">
<h1 style="color:#0e370d">New furniture enquiry</h1>
<p><strong>Name:</strong> ${escapeHtml(body.name)}<br>
<strong>Email:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a><br>
<strong>Phone:</strong> ${escapeHtml(body.phone || "Not provided")}</p>
<h2>Message</h2>
<div style="white-space:pre-wrap">${escapeHtml(body.message)}</div>
<hr><p>Bespoke Broncel Furniture</p>
</body></html>`;
}

export function buildEmailText(body: ContactFormData): string {
    return `New furniture enquiry

Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone || "Not provided"}

Message:
${body.message}

---
Sent from the Bespoke Broncel Furniture website.`;
}
