import type { NextConfig } from "next";

const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://eu.i.posthog.com https://eu-assets.i.posthog.com",
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
    async rewrites() {
        return [
            {
                source: "/ph/static/:path*",
                destination: "https://eu-assets.i.posthog.com/static/:path*"
            },
            {
                source: "/ph/:path*",
                destination: "https://eu.i.posthog.com/:path*"
            }
        ];
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders
            }
        ];
    },
    skipTrailingSlashRedirect: true
};

export default nextConfig;
