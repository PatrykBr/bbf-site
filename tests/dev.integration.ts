import assert from "node:assert/strict";
import { afterAll, beforeAll, test } from "bun:test";
import { startNextServer } from "./helpers/next-server.ts";

let site: Awaited<ReturnType<typeof startNextServer>>;
beforeAll(async () => {
    site = await startNextServer("dev");
}, 70_000);
afterAll(async () => {
    await site?.stop();
});

test("Turbopack development compiles pages and Tailwind CSS", async () => {
    for (const pathname of ["/work/scandinavian-white-wood-kitchen", "/"]) {
        const response = await fetch(`${site.url}${pathname}`, { signal: AbortSignal.timeout(30_000) });
        const html = await response.text();
        assert.equal(
            response.status,
            200,
            `${pathname} failed; missing Tailwind loader: ${html.includes("esm-cache.loader.mjs")}`
        );
        assert.ok(!html.includes("Error evaluating Node.js code"), "Development CSS evaluation failed");

        const stylesheetPaths = [...html.matchAll(/<link\b[^>]*href="([^"]+\.css(?:\?[^"]*)?)"[^>]*>/g)].map(
            match => match[1]
        );
        assert.ok(stylesheetPaths.length > 0, "The page must include a compiled stylesheet");
        const styles = await Promise.all(
            stylesheetPaths.map(async pathname => {
                const response = await fetch(new URL(pathname.replaceAll("&amp;", "&"), site.url));
                assert.equal(response.status, 200, "Development stylesheet failed to load");
                return response.text();
            })
        );
        assert.ok(
            styles.some(css => css.includes(".bg-brand-dark")),
            "Tailwind must generate the site's utility classes"
        );
    }
}, 90_000);
