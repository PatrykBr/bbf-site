import { randomUUID } from "node:crypto";
import { getPostHogServer } from "../lib/posthog-server.ts";
import { startNextServer } from "../tests/helpers/next-server.ts";

const rateLimitEnv = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? "",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? "",
    VERCEL_ENV: "service-check",
    CONTACT_IP_HEADER: "x-service-check-ip"
};

function testIp() {
    const hex = randomUUID().replaceAll("-", "");
    return `2001:db8:${hex.slice(0, 4)}:${hex.slice(4, 8)}::${hex.slice(8, 12)}`;
}

async function checkEnquiries() {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) throw new Error("Resend: RESEND_API_KEY is missing.");

    const testRecipient = "delivered+bbf-service-check@resend.dev";
    const site = await startNextServer("start", {
        ...rateLimitEnv,
        RESEND_API_KEY: apiKey,
        RESEND_BASE_URL: "https://api.resend.com",
        RESEND_TO_EMAIL: testRecipient
    });

    try {
        const response = await fetch(`${site.url}/api/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-service-check-ip": testIp() },
            body: JSON.stringify({
                name: "Website service check",
                email: testRecipient,
                message: "This enquiry checks the contact API using Resend's delivery simulator.",
                projectSlug: "navy-blue-shaker-kitchen"
            }),
            signal: AbortSignal.timeout(30_000)
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(
                `Resend: contact API returned HTTP ${response.status} (${result.error ?? "unknown error"}).`
            );
        }
        console.info("Resend: the contact API sent an enquiry to the delivery simulator.");
    } finally {
        await site.stop();
    }
}

async function checkSharedRateLimit() {
    if (!rateLimitEnv.TURSO_DATABASE_URL || !rateLimitEnv.TURSO_AUTH_TOKEN) {
        throw new Error("Rate limiting: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing.");
    }
    const sites: Awaited<ReturnType<typeof startNextServer>>[] = [];
    const headers = { "Content-Type": "application/json", "x-service-check-ip": testIp() };
    const post = (url: string) =>
        fetch(`${url}/api/contact`, {
            method: "POST",
            headers,
            body: JSON.stringify({ _honeypot: "service-check" }),
            signal: AbortSignal.timeout(10_000)
        });
    try {
        sites.push(await startNextServer("start", rateLimitEnv));
        sites.push(await startNextServer("start", rateLimitEnv));
        const responses = await Promise.all(Array.from({ length: 12 }, (_, index) => post(sites[index % 2].url)));
        if (
            responses.filter(response => response.status === 200).length !== 5 ||
            responses.filter(response => response.status === 429).length !== 7
        )
            throw new Error("Rate limiting: separate processes did not enforce a shared quota.");

        await sites[0].stop();
        sites[0] = await startNextServer("start", rateLimitEnv);
        if ((await post(sites[0].url)).status !== 429) {
            throw new Error("Rate limiting: restarting a process reset its quota.");
        }
        console.info("Rate limiting: two processes shared five allowed requests, and a restart preserved the limit.");
    } finally {
        await Promise.all(sites.map(site => site.stop()));
    }
}

async function checkAnalytics() {
    process.env.NEXT_PUBLIC_POSTHOG_ENABLE_LOCAL = "true";
    const posthog = getPostHogServer();
    if (!posthog) throw new Error("PostHog: POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_KEY is missing.");

    try {
        await posthog.captureImmediate({
            distinctId: `bbf-service-check-${randomUUID()}`,
            event: "service_check",
            properties: { source: "manual_service_check", $process_person_profile: false }
        });
        console.info("PostHog: ingestion accepted a synthetic service_check event.");
    } catch {
        throw new Error("PostHog: ingestion failed. Check the configured host and project key.");
    } finally {
        await posthog.shutdown();
    }
}

const results = await Promise.allSettled([checkEnquiries(), checkAnalytics(), checkSharedRateLimit()]);
for (const result of results) {
    if (result.status === "rejected") {
        console.error(result.reason instanceof Error ? result.reason.message : "The service check failed.");
        process.exitCode = 1;
    }
}
