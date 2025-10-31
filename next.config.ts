import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Enable typed routes for compile-time navigation safety
    typedRoutes: true,

    async rewrites() {
        return [
            {
                source: "/ingest/static/:path*",
                destination: "https://eu-assets.i.posthog.com/static/:path*"
            },
            {
                source: "/ingest/:path*",
                destination: "https://eu.i.posthog.com/:path*"
            },
            {
                source: "/ingest/decide",
                destination: "https://eu.i.posthog.com/decide"
            }
        ];
    },
    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,

    // Enable cacheComponents for partial prerendering (replaces experimental.ppr)
    cacheComponents: true,

    experimental: {
        // Tree-shake large vendor bundles automatically
        optimizePackageImports: ["posthog-js", "framer-motion"]
    },

    // Optimize images with modern formats
    images: {
        formats: ["image/avif", "image/webp"],
        minimumCacheTTL: 60,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        qualities: [60, 75, 90, 100]
    }
};

export default nextConfig;
