import assert from "node:assert/strict";
import { afterAll, beforeAll, test } from "bun:test";
import { getAllPastWork } from "../lib/data/past-work.ts";
import { services } from "../lib/data/services.ts";
import { startNextServer } from "./helpers/next-server.ts";

let site: Awaited<ReturnType<typeof startNextServer>>;
let canonicalSiteUrl: string;

beforeAll(async () => {
    site = await startNextServer("start");
    const { html } = await page("/");
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical, "The homepage must declare its canonical domain");
    canonicalSiteUrl = new URL(canonical).origin;
}, 30_000);

afterAll(async () => {
    await site?.stop();
});

async function page(path: string) {
    const response = await fetch(`${site.url}${path}`);
    return { response, html: await response.text() };
}

function structuredData(html: string): Record<string, unknown>[] {
    return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match =>
        JSON.parse(match[1])
    );
}

test("sitemap pages return indexable HTML with their own canonical and sharing URLs", async () => {
    const { response, html: sitemap } = await page("/sitemap.xml");
    assert.equal(response.status, 200);
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
    assert.equal(urls.length, 18);
    assert.equal(new Set(urls).size, urls.length);
    for (const path of ["/work", "/fitted-kitchens", "/fitted-wardrobes"]) {
        assert.ok(urls.includes(`${canonicalSiteUrl}${path}`));
    }
    assert.ok(!sitemap.includes("<lastmod>"), "Unknown content update dates must be omitted");

    const titles = new Set<string>();
    for (const url of urls) {
        const { response, html } = await page(new URL(url).pathname);
        assert.equal(response.status, 200, url);
        assert.ok(html.includes(`<link rel="canonical" href="${url}"`), url);
        assert.ok(html.includes(`<meta property="og:url" content="${url}"`), url);
        assert.ok(!html.includes('content="noindex"'), url);
        assert.equal([...html.matchAll(/<h1\b/g)].length, 1, url);
        assert.equal([...html.matchAll(/<header\b/g)].length, 1, url);
        assert.equal([...html.matchAll(/<main\b/g)].length, 1, url);
        assert.equal([...html.matchAll(/<footer\b/g)].length, 1, url);
        assert.ok(html.includes('href="#main-content"'), url);
        const title = html.match(/<title>(.*?)<\/title>/)?.[1];
        assert.ok(title, url);
        assert.ok(!titles.has(title), `Duplicate title on ${url}`);
        titles.add(title);
        assert.ok(structuredData(html).length > 0, url);
    }
}, 30_000);

test("visitors and crawlers can follow the homepage to every project without using filters", async () => {
    const { html: home } = await page("/");
    assert.ok(home.includes('href="/work"'));
    const gallery = home.match(/<section id="work"[\s\S]*?<\/section>/)?.[0];
    assert.ok(gallery);
    assert.equal([...gallery.matchAll(/href="\/work\/[^\"]+"/g)].length, 12);
    assert.ok(gallery.includes('href="/work"'));
    const sectionIds = [...home.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(sectionIds[sectionIds.indexOf("work") + 1], "contact");
    assert.ok(sectionIds.indexOf("contact") < sectionIds.indexOf("about"));
    const { html: work } = await page("/work");
    for (const item of getAllPastWork()) {
        assert.ok(work.includes(`href="/work/${item.slug}"`), item.slug);
    }
    for (const [path, category] of [
        ["/fitted-kitchens", "kitchen"],
        ["/fitted-wardrobes", "wardrobe"]
    ] as const) {
        assert.ok(home.includes(`href="${path}"`));
        const { html } = await page(path);
        const information = html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0];
        assert.ok(information, path);
        assert.ok(information.includes(services[category].introduction), path);
        for (const section of services[category].sections) {
            assert.ok(information.includes(section.heading), path);
            assert.ok(information.includes(section.text), path);
        }
        for (const item of getAllPastWork()) {
            assert.equal(html.includes(`href="/work/${item.slug}"`), item.category === category, item.slug);
        }
        const service = structuredData(html).find(data => data["@type"] === "Service");
        assert.deepEqual(service?.provider, { "@id": `${canonicalSiteUrl}/#business` });
    }
});

test("project breadcrumbs link real pages and business data uses only the public service area", async () => {
    const { html } = await page("/work/navy-blue-shaker-kitchen");
    const schemas = structuredData(html);
    const breadcrumbs = schemas.find(data => data["@type"] === "BreadcrumbList");
    const items = breadcrumbs?.itemListElement as { position: number; item: string }[];
    assert.deepEqual(
        items.map(item => item.position),
        [1, 2, 3]
    );
    assert.deepEqual(
        items.map(item => item.item),
        [`${canonicalSiteUrl}/`, `${canonicalSiteUrl}/work`, `${canonicalSiteUrl}/work/navy-blue-shaker-kitchen`]
    );
    assert.ok(html.includes('aria-label="Breadcrumb"'));
    assert.ok(html.includes('href="/fitted-kitchens"'));

    const business = schemas.find(data => data["@type"] === "Organization");
    assert.equal(business?.["@id"], `${canonicalSiteUrl}/#business`);
    assert.equal(business?.logo, `${canonicalSiteUrl}/logo.webp`);
    assert.deepEqual(business?.areaServed, { "@type": "AdministrativeArea", name: "South Yorkshire, England" });
    assert.ok(business && !("address" in business));
});

test("missing projects return 404 and noindex without a homepage canonical", async () => {
    const { response, html } = await page("/work/missing-seo-test-project");
    assert.equal(response.status, 404);
    assert.ok(html.includes('content="noindex"'));
    assert.ok(!html.includes('rel="canonical"'));
});
