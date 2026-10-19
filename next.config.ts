import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const isVercel = process.env.VERCEL === "1";
const vercelLiveScriptSource = isVercel ? " https://vercel.live" : "";
const analyticsOrigin = new URL(process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://t.broncelfurniture.com")
    .origin;

const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${analyticsOrigin}${vercelLiveScriptSource}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${analyticsOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
].join("; ");

const securityHeaders = [
    {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
    },
    {
        key: "X-Frame-Options",
        value: "DENY"
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff"
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()"
    }
];

const nextConfig: NextConfig = {
    typedRoutes: true,
    turbopack: { root: process.cwd() },
    outputFileTracingRoot: process.cwd(),
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders
            }
        ];
    }
};

export default nextConfig;
