import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { ContactFormData } from "./types.ts";

export interface ContactFormSubmission extends ContactFormData {
    _honeypot?: string;
    _formRenderedAt?: number;
}

type ParsedBody =
    { success: true; data: ContactFormSubmission } | { success: false; code: "INVALID_JSON" | "BODY_TOO_LARGE" };

export function getRateLimitIdentifier(headers: Headers): string {
    // Trust only an IP header that the hosting proxy overwrites.
    // Requests without a trusted IP share one rate limit.
    const header = process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : process.env.CONTACT_IP_HEADER;
    const ip = header ? headers.get(header)?.split(",")[0].trim() : undefined;
    return ip && isIP(ip) ? createHash("sha256").update(ip).digest("hex") : "unknown";
}

export async function parseContactBody(request: Request, maxBytes = 10 * 1024): Promise<ParsedBody> {
    if (Number(request.headers.get("content-length")) > maxBytes) {
        return { success: false, code: "BODY_TOO_LARGE" };
    }

    const reader = request.body?.getReader();
    if (!reader) return { success: false, code: "INVALID_JSON" };

    try {
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > maxBytes) {
                await reader.cancel();
                return { success: false, code: "BODY_TOO_LARGE" };
            }
            chunks.push(value);
        }

        const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return { success: false, code: "INVALID_JSON" };
        }

        return {
            success: true,
            data: {
                name: typeof parsed.name === "string" ? parsed.name : "",
                email: typeof parsed.email === "string" ? parsed.email : "",
                phone: typeof parsed.phone === "string" ? parsed.phone : undefined,
                message: typeof parsed.message === "string" ? parsed.message : "",
                _honeypot: typeof parsed._honeypot === "string" ? parsed._honeypot : undefined,
                _formRenderedAt: typeof parsed._formRenderedAt === "number" ? parsed._formRenderedAt : undefined
            }
        };
    } catch {
        return { success: false, code: "INVALID_JSON" };
    } finally {
        reader.releaseLock();
    }
}
