# Bespoke Broncel Furniture

A website for Bespoke Broncel Furniture, a fitted furniture business in South Yorkshire.

Visit [broncelfurniture.com](https://www.broncelfurniture.com).

## Screenshots

![Desktop home page with the furniture workshop, business name and contact links](docs/screenshots/home-desktop.webp)

<table>
    <tr>
        <th>Project gallery</th>
        <th>Mobile home page</th>
    </tr>
    <tr>
        <td width="72%"><img src="docs/screenshots/portfolio-desktop.webp" alt="Kitchen and wardrobe projects with category filters" width="720" /></td>
        <td width="28%"><img src="docs/screenshots/home-mobile.webp" alt="Home page on a phone, with the menu and contact buttons" width="280" /></td>
    </tr>
</table>

## What it does

- Visitors can filter kitchen and wardrobe projects and open a separate page for each project.
- The contact form validates enquiries in the browser and on the server. It checks for spam, limits submissions and sends emails through Resend.
- PostHog records page visits and portfolio interactions when analytics are enabled.
- Pages include search metadata, social sharing images and structured business information.
- Layouts adapt to screen size. Animations respect reduced-motion settings.

## Technology

- Next.js 16.4 and React 19.3 render the site.
- Bun 1.4.3 installs dependencies, runs scripts, checks types and runs tests.
- Tailwind CSS 4.3 supplies styles, and Motion 14 handles animations.
- Resend sends contact emails. PostHog provides optional analytics.
- ESLint checks code, and Prettier formats it.

Edit portfolio content in `lib/data/past-work.ts` and business details in `lib/data/contact.ts`.

## Local development

Install Bun 1.4.3 and Node.js 24.x. `.bun-version` and `packageManager` pin Bun. `bun.lock` records dependency versions. Next.js uses Node for some workers. `.node-version` pins the Node version for local tools and deployment hosts.

```bash
bun install --frozen-lockfile
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set the site URL, analytics options and email settings in `.env.local`. `.env.example` explains each setting. To send contact emails, provide a Resend API key and the sender and recipient addresses. Keep credentials out of Git.

## Quality checks

```bash
bun run check            # Run lint, type checks and unit tests in parallel.
bun run format:check
bun run build
bun run start            # Serve the production build with Bun.
bun run test:integration # Build first. The tests use a local email server.
bun run test:dev         # Stop any dev server first. Check pages and generated CSS.
bun run test:watch       # Rerun unit tests when files change.
bun run test:coverage    # Print coverage and write coverage/lcov.info.
```

Tests use `bun:test`. Bun mocks the clock, checks image files and runs the integration servers. `bun test` finds unit tests under `tests/`. Run the two `*.integration.ts` suites through their named scripts. Each suite stops its servers when it finishes. Contact tests use a local email server and do not send emails through Resend.

`bun run typecheck` generates Next.js route types, then runs Bun's built-in TypeScript 7 checker with `bun --check`. Links use typed routes, and project pages use the generated `PageProps` type. Next.js also checks types during the production build.

The full TypeScript 6 SDK remains installed for Next.js, ESLint and editor language servers, including Zed. Its JavaScript and DOM declarations let editors resolve standard types such as `Date` and `HTMLInputElement`.

As of 19 October 2026, `bun audit --production` reports no vulnerabilities. The full audit reports [an unpatched denial-of-service issue in `braces`](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), an indirect ESLint dependency. It affects deeply nested glob patterns passed to the lint tooling. `braces` is absent from the production dependency graph and Next.js server traces. Recheck with `bun audit` when updating dependencies.

## Scripts and deployment

The `dev`, `build` and `start` scripts select Bun's runtime with `--bun`. Next.js handles routing, React Server Components, image optimisation and bundling through Turbopack. ESLint checks Next.js, React and accessibility rules. Prettier sorts Tailwind classes. Both tools run under Bun. `bunfig.toml` selects Bun's shell on each platform and configures tests and coverage.

Use `bun add <package>`, `bun add --dev <package>` and `bun remove <package>` to manage dependencies. Commit `bun.lock` with dependency changes. CI and deployment hosts should install with `bun install --frozen-lockfile` and build with `bun run build`.

`vercel.json` selects the Next.js preset and Bun 1.4.x for Vercel Functions. It installs dependencies from the lockfile and runs lint, type checks and unit tests before the production build. Vercel manages the Bun patch version. Keep the project's Node.js setting on 24.x for build tools that need Node.

For production, set `NEXT_PUBLIC_SITE_URL` to `https://www.broncelfurniture.com`. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `RESEND_TO_EMAIL` for contact enquiries. The sender must use a domain verified in Resend. Leave `CONTACT_IP_HEADER` unset on Vercel so the app uses Vercel's client IP header.

Analytics use `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`. `POSTHOG_KEY` can supply a separate server-side project key. Without it, the server uses the public project key. The app does not read `POSTHOG_API_KEY` or `POSTHOG_ENV_ID`.

Share buttons use the current site's origin. Links copied in local development or a preview deployment stay in that environment. Search metadata uses `NEXT_PUBLIC_SITE_URL`.

Node.js stays on the 24 LTS line with matching `@types/node` declarations. ESLint stays on 9.x because the React, import and accessibility plugins required by Next.js do not support ESLint 10.

## Contact form and analytics

The contact API permits five requests per hour for each client identifier. Each server process keeps its own limits in memory. For a limit shared across several servers, configure rate limiting at the host.

On Vercel, the API uses the client IP header that Vercel overwrites. On another host, set `CONTACT_IP_HEADER` only if your reverse proxy overwrites that header and blocks direct access to the app. Without a trusted header, all submissions share one limit.

The form needs `RESEND_API_KEY` to send emails. Without it, the API returns an error in development and production. Normal submissions receive a success response only after Resend accepts the email.

Analytics are optional. The content security policy allows the origin in `NEXT_PUBLIC_POSTHOG_HOST`.

## Project structure

- `app/` contains Next.js routes, metadata and the contact API.
- `components/` contains page sections, galleries, modals and the contact form.
- `lib/data/` contains portfolio content and business details.
- `lib/` contains validation, analytics and shared functions.
- `public/` contains site assets and portfolio images.
