ARISU FIX — PROJECT README
Version: AFV313
Updated: 2026-10-27

Current release: AFV313
Package version: 313.0.0
Production hosting: Cloudflare Pages
Production site: https://arisufix.pages.dev
Source repository: https://github.com/arisuinborderland/Arisu_Fix

RELEASE NOTES
- AFV313 replaces the full-screen empty state with a compact premium modal (Option 1) inside the existing Story Viewer; normal story playback and view tracking are unchanged.

- AFV313 consolidates legacy homepage/global header CSS rules while preserving AFV313 layout and sizing. It also keeps Recovery Proofs and Customer Reviews header button dimensions match the homepage at desktop, standard mobile, and narrow-phone breakpoints; corrects the verified badge vertical offset and bumps cache keys.
- AFV313 makes Privacy Policy and About button widths on narrow phones match the homepage reference, removing conflicting legacy breakpoint sizes on proofs and reviews pages.
- AFV313 keeps the verified badge vertically centered without an artificial offset.
- AFV313 updates package and lockfile versions; no deployment was performed.
- AFV313 established the shared mobile header layout; AFV313 removes remaining content-page size discrepancies.
- Production Stories API is implemented with Cloudflare Pages Functions under functions/api/.
- Recovery Story views are deduplicated in the database by story and browser-tab session.
- Story image URLs refresh when the viewer opens; signed URLs are issued for one hour.
- Public Story uploads are limited to 3 MiB per image, matching server validation.
- Story cleanup processes up to 20 records per run to stay within Pages Functions subrequest limits.
- `.nvmrc` pins the Cloudflare build to Node.js 24; `npm test` runs the full Node test suite.
- Persist the view-session UUID immediately so mobile browsers can retain it if a view request is interrupted by a reload.
- Static public output is built through build.js using an explicit allowlist; backend code, tests, and documentation are not copied into dist/.
- The generated dist/ directory is build output and should not be included in a source ZIP.
- Obsolete Vercel API handlers and their legacy tests have been removed after review; production Story endpoints remain under functions/api/.

VALIDATION
- GitHub Actions workflow: Cloudflare Project Validation.
- The workflow runs npm test and npm run build on pushes to main and pull requests.
- Automated validation does not replace live browser checks of the deployed site and Stories Admin.
- Live browser checks are separate from GitHub Actions validation.
