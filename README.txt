ARISU FIX — PROJECT README
Version: AFV265
Updated: 2026-10-25

Current release: AFV265
Package version: 265.0.0
Production hosting: Cloudflare Pages
Production site: https://arisufix.pages.dev
Source repository: https://github.com/arisuinborderland/Arisu_Fix

RELEASE NOTES
- AFV265 is the current project version recorded in package.json.
- Production Stories API is implemented with Cloudflare Pages Functions under functions/api/.
- Recovery Story views are deduplicated in the database by story and browser-tab session.
- Persist the view-session UUID immediately so mobile browsers can retain it if a view request is interrupted by a reload.
- Static public output is built through build.js using an explicit allowlist; backend code, tests, and documentation are not copied into dist/.
- The generated dist/ directory is build output and should not be included in a source ZIP.
- Obsolete Vercel API handlers and their legacy tests have been removed after review; production Story endpoints remain under functions/api/.

VALIDATION
- GitHub Actions workflow: Cloudflare Project Validation.
- The workflow runs npm test and npm run build on pushes to main and pull requests.
- Automated validation does not replace live browser checks of the deployed site and Stories Admin.
- Live browser checks are separate from GitHub Actions validation.
