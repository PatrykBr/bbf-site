import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { afterAll, beforeAll, test } from "bun:test";
import { ESLint } from "eslint";

const require = createRequire(import.meta.url);
const { getRootDirs } = require("@next/eslint-plugin-next/dist/utils/get-root-dirs");
let root: string;

beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), "bbf-lint-"));
    await mkdir(join(root, "apps", "site", "pages"), { recursive: true });
    await mkdir(join(root, "apps", "other"));
    await writeFile(
        join(root, "apps", "site", "pages", "about.tsx"),
        "export default function Page() { return null; }"
    );
    await writeFile(join(root, "apps", "file.txt"), "Not an application directory");
});

afterAll(async () => {
    if (!root) return;
    assert.equal(dirname(root), tmpdir());
    await rm(root, { recursive: true, force: true });
});

test("Next.js lint root discovery handles exact paths, globs and arrays without including nested directories", () => {
    const site = join(root, "apps", "site");
    const other = join(root, "apps", "other");
    const context = { cwd: root, settings: {} };
    const roots = (rootDir: string | string[]) => getRootDirs({ ...context, settings: { next: { rootDir } } });
    const normalize = (paths: string[]) => paths.map(path => resolve(path).replaceAll("\\", "/")).sort();
    assert.deepEqual(getRootDirs(context), [root]);
    assert.deepEqual(normalize(roots(site)), normalize([site]));
    assert.deepEqual(normalize(roots(join(root, "apps", "*"))), normalize([site, other]));
    assert.deepEqual(normalize(roots([site, other])), normalize([site, other]));
    assert.deepEqual(roots(join(root, "missing")), []);
});

test("Next.js still rejects plain anchor links to pages found through a root glob", async () => {
    const eslint = new ESLint({
        overrideConfig: [{ settings: { next: { rootDir: join(root, "apps", "*") } } }]
    });
    const [result] = await eslint.lintText('export default function Example() { return <a href="/about">About</a>; }', {
        filePath: join(process.cwd(), "components", "LintExample.tsx")
    });
    assert.ok(result.messages.some(message => message.ruleId === "@next/next/no-html-link-for-pages"));
});
