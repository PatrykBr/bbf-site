# Bespoke Broncel Furniture

A responsive website developed for **Bespoke Broncel Furniture**, a fitted furniture business in South Yorkshire.

**Live site:** [broncelfurniture.com](https://www.broncelfurniture.com)

## What it does

- Presents past kitchen and wardrobe projects in a responsive, category-filterable gallery with individual shareable project views.
- Provides a contact form with client-side and server-side validation, anti-spam checks, rate limiting and email delivery via Resend.
- Captures optional site and portfolio interaction analytics with PostHog.
- Supports search and sharing through SEO metadata, Open Graph images, canonical URLs and structured business information.
- Uses a mobile-first interface with Framer Motion animations and reduced-motion support.

## Technology

- **Next.js 16**, **React 19**, **TypeScript**
- **Tailwind CSS 4**, **Framer Motion**
- **Resend** for contact email delivery
- **PostHog** for analytics
- **ESLint**, **Prettier** and TypeScript checking

The project is intentionally a straightforward website rather than a general-purpose CMS. Portfolio data is maintained in `lib/data/past-work.ts`.

## Local development

Requirements: Node.js 24.x and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `.env.example` file documents configuration for the public site URL, optional PostHog analytics and Resend contact-form delivery. Provide your own email API key and sender/recipient configuration to test actual form delivery. Do not commit credentials.

## Quality checks

```bash
npm run check        # ESLint + TypeScript
npm run format:check
npm run build
```

## Project structure

- `app/`: Next.js routes, metadata and the contact API
- `components/`: page sections, gallery, modal and contact form
- `lib/data/`: portfolio and business content
- `lib/`: shared data access, utilities, validation and analytics
- `public/`: site assets and portfolio images

Developed as a practical full-stack project serving a real small business.
