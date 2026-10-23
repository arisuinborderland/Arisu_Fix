ARISU FIX — PROJECT README
Version: AFV181
Updated: 2026-10-23

Current release: AFV181
Stories count optimization: the navigation badge is fetched independently through `/api/story-count`. The endpoint uses a Supabase HEAD exact-count query without transferring Story rows or signing image URLs. A neutral loading marker remains until a count is available; browser Performance marks and the API Server-Timing header help diagnose latency.

Historical release notes: see `RELEASE_HISTORY.txt`.

CURRENT RELEASE STATUS
- Release: AFV181
- Package version: 181.0.0
- Source ZIP folder: AFV181/
- Generated production output: dist/ (created by `npm run build`; intentionally excluded from the source ZIP)
- Deployment target: Vercel

AFV181 RELEASE SUMMARY
- Uses an explicit allowlist for public production files instead of recursively copying project files.
- Keeps Vercel API handlers under `api/` and shared backend dependencies under `lib/`; backend source, SQL migrations, build tooling, package metadata, Vercel configuration, and documentation are excluded from `dist/`.
- Validates required backend files and relative backend dependencies, exact public output contents, active AFV cache-busting tokens, JavaScript syntax, and local HTML/CSS references during the build.
- Preserves existing page content, styles, and client-side behavior; this release focuses on Stories API cleanup reliability, decoded image validation, and regression tests.
- Cleanup treats a confirmed missing storage object as already deleted, while transient storage failures remain retryable.
- Story uploads use Sharp to decode and validate JPEG, PNG, and WebP files, with 3 MB file, 4096-pixel dimension, and 16-megapixel limits.
- Uses a lightweight Supabase HEAD exact-count request for the footer Stories badge, independent of signed image URLs.
- Exposes `Server-Timing` metrics for the count query and total handler time; the client records a `story-count-request` Performance measure.
- Includes automated Stories API regression tests. Run `npm test` after dependencies are installed.

BUILD AND DEPLOYMENT
1. Use Node.js 18 or newer.
2. Run `npm run build` from the project root. The build exits with an error if a configured validation fails.
3. Deploy the source project to Vercel so `/api/*` functions and their shared `lib/` dependencies remain available to the platform. Do not deploy `dist/` as the project root when using the Vercel API routes.
4. For staging verification, configure the staging-only environment variables required by `scripts/staging-stories-smoke.js` (including separate staging admin and expired-admin tokens), set `STAGING_CONFIRM_ISOLATED=YES` only after confirming the project is isolated, and run `npm run test:staging` against a Vercel preview deployment and a separate Supabase project. The script creates and removes only its own expired test row and refuses the known production hosts.
5. After deployment, verify live API behavior, environment variables, security headers, and browser rendering; a successful local build does not confirm live deployment behavior.

DOCUMENTATION MAP
- `README.txt` — current release metadata, current status, and build/deployment instructions only.
- `RELEASE_HISTORY.txt` — archived historical release notes, newest archived entries first.
- `proofs/README.txt` — instructions and safeguards for authorized Recovery Proof images.
- `reviews/README.txt` — instructions for the review image slots.

The historical notes are intentionally separated from the current status so older release entries do not imply that they describe the current build.
