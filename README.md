# Gian Kausari — Personal portfolio

An interactive editorial portfolio and private single-owner CMS, built from `PLAN.md`.

## Run locally

```powershell
npm install
npm run setup:owner
npm run db:generate
npm run dev
```

Open http://localhost:3000. The initial projects, profile copy, experience, and email are editable demonstration content. No real employment, client work, or performance outcomes are claimed.

`setup:owner` creates `.env.local` and `.owner-access.txt` only when configuration does not already exist. The password is random, stored as a salted scrypt hash in the environment, and the plaintext access file is ignored by Git. Open that file privately to retrieve your credentials. Do not commit or share it.

## Private workspace

Press **Ctrl/Cmd + Shift + L** on the public page, or use the private route listed in `.owner-access.txt`. There is no login link in the public navigation or footer. The server resolves the random login slug; it is not passed into the public React payload.

The dashboard supports:

- Profile, bio, location, email, social links, résumé and availability.
- Photo upload with 1:1 or 4:5 canvas crop, zoom and vertical framing.
- Project creation, editing, deletion, drag ordering, keyboard-accessible move buttons, drafts, featured state, cover upload and case studies.
- Experience and skill creation, editing, deletion and ordering.
- Preview of unsaved changes, discard, save and immediate public cache revalidation.
- Owner-only floating edit controls on the public page.

Auth.js uses encrypted HttpOnly session cookies, an eight-hour JWT session and a single-owner email whitelist. Every save/upload rechecks authorization on the server. Unauthenticated dashboard requests and common login guesses return 404. Private routes have noindex metadata and are excluded from the sitemap. The built-in Auth.js sign-in page is disabled.

The secret URL is a convenience, not a replacement for authentication: a keyboard trigger necessarily has a discoverable server endpoint. The endpoint does not grant access. The local credential-attempt limiter is process-local; configure a shared rate limiter or provider-level protection for multiple production instances.

## Storage

Without `DATABASE_URL`, content persists atomically in `.data/portfolio.json` and uploads in `.data/media/`. These are private runtime files ignored by Git. This mode is suitable for a local instance or a persistent single-server filesystem. Back up the `.data` directory.

With `DATABASE_URL`, content uses Prisma and PostgreSQL:

```powershell
# Set DATABASE_URL in .env.local first, then:
npm run db:generate
npm run db:push
```

The CMS stores one Zod-validated JSON document in `PortfolioContent`, rather than the four relational tables illustrated in the plan. This deliberately makes a complete publish (including ordering) atomic. Enabling PostgreSQL starts with the demonstration data unless a document already exists; export/import your local `.data/portfolio.json` if migrating existing content. Database provisioning is not performed automatically.

With `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`, signed uploads use Cloudinary. Without them, uploads use local storage. The upload endpoint accepts signature-checked PNG/JPEG/WebP and PDF files up to 8 MB, rejects other formats, uses random server filenames and checks same-origin requests. Published media is publicly readable, so only upload material intended for the portfolio.

## Before deployment

1. Configure PostgreSQL and run `npm run db:push` against the intended database.
2. Configure Cloudinary for serverless hosting. Local disk is not durable on Vercel; the app refuses the local content/upload fallback there.
3. Set fresh `AUTH_SECRET`, `OWNER_EMAIL`, `OWNER_PASSWORD_HASH`, `SECRET_LOGIN_SLUG` and `SITE_URL` in your hosting environment. Use a unique password and rotate the local credentials. `SITE_URL` enables the public sitemap.
4. Replace sample content and `hello@example.com` in the dashboard.
5. Use HTTPS and verify login, publishing and uploads against the deployed URL.

No external database, media account, or deployment has been created by this project setup.

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
```

The project keeps the starter's Next.js 16 App Router and React 19. `proxy.ts` is the Next.js 16 equivalent of the plan's middleware file. Styling uses Tailwind v4 plus scoped native CSS; Motion, Lenis, next-themes, React Hook Form and Zod handle interaction, scrolling, themes and forms. Reduced-motion preferences disable continuous animations, and touch screens use a mobile menu and stacked layouts.

## References

- [Next.js proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Auth.js credentials provider](https://authjs.dev/getting-started/authentication/credentials)
- [Prisma PostgreSQL](https://docs.prisma.io/docs/orm/core-concepts/supported-databases/postgresql)
- [Cloudinary signed uploads](https://cloudinary.com/documentation/upload_images)

The bundled travel preview uses [Unsplash landscape photography](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b). The other project previews and hero illustration are rendered with CSS.

## Verification notes

The local browser suite uses generated test credentials and Edge headless at 320, 375, 768 and 1440 px. It checks private-route HTTP status, sign-in/out, theme persistence, clipboard, case studies, unsaved preview, publish/revalidation, draft privacy, project deletion, quick edit, photo crop dimensions, upload MIME validation and HttpOnly cookies. Run `npm run qa:browser` against a running local server; set `QA_URL` for a different local port and `QA_BROWSER` for a different Chromium executable. It temporarily edits the sample profile, creates a test project and uploads a test image, then restores/removes those through the editor. Run it on disposable local content.

Screenshot artifacts and axe results are written to `.artifacts/` (ignored by Git). There is no earlier screenshot baseline, so automated visual-regression comparison is inconclusive; current desktop/mobile screenshots were inspected directly. Automated axe checks are not a manual screen-reader audit. The Lighthouse >95 and 60 FPS values in PLAN.md are targets, not measured guarantees.

`npm audit --omit=dev` reports no known production vulnerabilities in the checked lockfile. A `deepmerge-ts` override to 8.x removes the Prisma configuration dependency advisory; Prisma generation and the application build are checked with that override. Five development-tool advisory entries remain in ESLint’s `braces` dependency chain; the registry currently has no patched `braces` release. Do not use `npm audit fix --force`, which proposes a major framework-linter downgrade.
