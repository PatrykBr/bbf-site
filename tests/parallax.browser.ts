import assert from "node:assert/strict";
import { afterAll, beforeAll, test } from "bun:test";
import { chromium, type Browser, type BrowserContextOptions } from "playwright-core";
import { startNextServer } from "./helpers/next-server.ts";

let site: Awaited<ReturnType<typeof startNextServer>>;
let browser: Browser;

beforeAll(async () => {
    site = await startNextServer("start");
    browser = await chromium.launch({ channel: "chrome", headless: true });
}, 30_000);

afterAll(async () => {
    await browser?.close();
    await site?.stop();
});

const cases: { name: string; options: BrowserContextOptions; initialScroll?: number }[] = [
    { name: "desktop", options: { viewport: { width: 1920, height: 1044 } } },
    {
        name: "mobile",
        options: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true }
    },
    { name: "scrolled desktop", options: { viewport: { width: 1440, height: 1000 } }, initialScroll: 300 },
    { name: "reduced motion", options: { viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" } }
];

for (const { name, options, initialScroll = 0 } of cases) {
    test(`${name} keeps the background stable through hydration and preserves scroll depth`, async () => {
        const context = await browser.newContext(options);
        let releaseScripts = () => {};
        try {
            const page = await context.newPage();
            const errors: string[] = [];
            page.on("pageerror", error => errors.push(error.message));
            const gate = new Promise<void>(resolve => {
                releaseScripts = resolve;
            });
            let delayedScripts = 0;
            await page.route("**/_next/**/*.js*", async route => {
                delayedScripts++;
                await gate;
                await route.continue();
            });
            await page.goto(site.url, { waitUntil: "commit" });
            await page.waitForSelector("#home .parallax-image", { state: "attached" });
            await page.waitForFunction(() => {
                const image = document.querySelector<HTMLImageElement>("#home .parallax-image img");
                return image?.complete && getComputedStyle(document.body).getPropertyValue("--brand-dark").trim();
            });
            await page.evaluate(async scroll => {
                await document.fonts.ready;
                document.documentElement.style.scrollBehavior = "auto";
                scrollTo(0, scroll);
            }, initialScroll);
            await page.waitForTimeout(1400);
            assert.ok(delayedScripts > 0, "The test must delay hydration scripts");
            const readPosition = () =>
                page.locator("#home .parallax-image").evaluate(image => {
                    const matrix = new DOMMatrixReadOnly(getComputedStyle(image).transform);
                    return { y: matrix.m42, scale: matrix.m11 };
                });
            const before = await readPosition();
            releaseScripts();
            await page.waitForLoadState("networkidle");
            const after = await readPosition();
            assert.ok(Math.abs(after.y - before.y) < 0.5, "Hydration must not reposition the background");
            assert.equal(before.scale, 1);
            assert.equal(after.scale, 1);

            const result = await page.evaluate(async () => {
                const image = document.querySelector<HTMLElement>("#home .parallax-image")!;
                const copy = document.querySelector<HTMLElement>("#home .parallax-content")!;
                let styleWrites = 0;
                const observer = new MutationObserver(records => {
                    styleWrites += records.length;
                });
                for (const element of [image, copy]) {
                    observer.observe(element, { attributes: true, attributeFilter: ["style"] });
                }
                const samples = [];
                let covered = true;
                for (const y of [0, 300]) {
                    scrollTo(0, y);
                    await new Promise(requestAnimationFrame);
                    await new Promise(requestAnimationFrame);
                    samples.push(
                        new DOMMatrixReadOnly(getComputedStyle(image).transform).m42 -
                            new DOMMatrixReadOnly(getComputedStyle(copy).transform).m42
                    );
                    for (const photo of document.querySelectorAll(".parallax-image")) {
                        const frame = photo.parentElement!.getBoundingClientRect();
                        const bounds = photo.getBoundingClientRect();
                        covered &&=
                            bounds.top <= frame.top + 0.5 &&
                            bounds.bottom >= frame.bottom - 0.5 &&
                            bounds.left <= frame.left + 0.5 &&
                            bounds.right >= frame.right - 0.5;
                    }
                }
                observer.disconnect();
                return {
                    travel: samples[1] - samples[0],
                    styleWrites,
                    covered,
                    imageWidth: image.querySelector("img")!.naturalWidth,
                    overflow: document.documentElement.scrollWidth > innerWidth
                };
            });
            assert.equal(result.styleWrites, 0, "Scrolling must not update layer styles through JavaScript");
            assert.ok(result.imageWidth >= 1743, "The hero must retain its source resolution");
            assert.ok(result.covered, "The photographs must cover their frames throughout the effect");
            assert.ok(!result.overflow, "The layers must stay inside the viewport");
            if (options.reducedMotion === "reduce") assert.equal(result.travel, 0);
            else assert.ok(result.travel > 180, "The photo and text must visibly separate during scrolling");
            assert.deepEqual(errors, []);
        } finally {
            releaseScripts();
            await context.close();
        }
    }, 20_000);
}
