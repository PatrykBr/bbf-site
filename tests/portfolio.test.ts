import assert from "node:assert/strict";
import { test } from "bun:test";
import { getAllPastWork, getAllPastWorkSlugs, getPastWorkBySlug } from "../lib/data/past-work.ts";
import { formatDate, getFacebookShareUrl, getShareUrl, getWhatsAppShareUrl, serializeJsonLd } from "../lib/utils.ts";

test("portfolio URLs, image assets, and identifiers are valid and unique", async () => {
    const items = getAllPastWork();
    assert.ok(items.length > 0);
    assert.equal(new Set(items.map(item => item.id)).size, items.length);
    assert.equal(new Set(getAllPastWorkSlugs()).size, items.length);
    for (const item of items) {
        assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        assert.equal(getPastWorkBySlug(item.slug), item);
        assert.ok(Number.isFinite(Date.parse(item.createdAt)));
        assert.ok(item.images.length > 0);
        for (const image of item.images) {
            assert.ok(image.alt);
            assert.ok(await Bun.file(new URL(`../public${image.url}`, import.meta.url)).exists(), image.url);
        }
    }
    assert.equal(getPastWorkBySlug("not-a-project"), undefined);
});

test("portfolio order puts featured items first, then newest first", () => {
    const items = getAllPastWork();
    for (let index = 1; index < items.length; index++) {
        const prev = items[index - 1],
            next = items[index];
        assert.ok(prev.isFeatured || !next.isFeatured);
        if (prev.isFeatured === next.isFeatured) assert.ok(prev.createdAt >= next.createdAt);
    }
});

test("share links retain the project path and campaign metadata", () => {
    const url = new URL(getShareUrl("navy-blue-shaker-kitchen", "copy"));
    assert.equal(url.pathname, "/work/navy-blue-shaker-kitchen");
    assert.equal(url.searchParams.get("utm_source"), "copy");
    assert.equal(url.searchParams.get("utm_campaign"), "past_work_share");
});

test("share links use the current site in local, preview and production environments", () => {
    for (const origin of ["http://localhost:3000", "https://preview.example.com", "https://www.broncelfurniture.com"]) {
        for (const method of ["copy", "facebook", "whatsapp"] as const) {
            const url = new URL(getShareUrl("industrial-loft-angled-wardrobe", method, origin));
            assert.equal(url.origin, origin);
            assert.equal(url.pathname, "/work/industrial-loft-angled-wardrobe");
            assert.equal(url.searchParams.get("utm_source"), method);
        }
    }
});

test("Facebook and WhatsApp share the project on the current site", () => {
    const origin = "http://localhost:3000";
    const slug = "industrial-loft-angled-wardrobe";
    const facebook = new URL(getFacebookShareUrl(slug, origin));
    const facebookProject = new URL(facebook.searchParams.get("u")!);
    assert.equal(facebookProject.origin, origin);
    assert.equal(facebookProject.pathname, `/work/${slug}`);
    const whatsapp = new URL(getWhatsAppShareUrl(slug, "Angled loft wardrobe", origin));
    const whatsappProject = new URL(whatsapp.searchParams.get("text")!.split(" ").at(-1)!);
    assert.equal(whatsappProject.origin, origin);
    assert.equal(whatsappProject.pathname, `/work/${slug}`);
});

test("JSON-LD cannot close the script tag and dates use UTC", () => {
    assert.ok(!serializeJsonLd({ name: "</script>" }).includes("<"));
    assert.equal(formatDate("2024-01-01T23:30:00Z"), "1 January 2024");
});
