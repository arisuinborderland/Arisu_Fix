ARISU FIX — PROJECT README
Version: AFV263
Updated: 2026-10-25

Current release: AFV263
Package version: 263.0.0
Production hosting: Cloudflare Pages
Production site: https://arisufix.pages.dev
Source repository: https://github.com/arisuinborderland/Arisu_Fix

RELEASE NOTES
- AFV263 is the current project version recorded in package.json.
- Production Stories API is implemented with Cloudflare Pages Functions under functions/api/.
- Static public output is built through build.js using an explicit allowlist; backend code, tests, and documentation are not copied into dist/.
- The generated dist/ directory is build output and should not be included in a source ZIP.
- Legacy Vercel files and tests are being reviewed separately; do not assume remaining api/ or lib/ files are safe to delete until references and tests are audited.

VALIDATION
- GitHub Actions workflow: Cloudflare Project Validation.
- The workflow runs npm test and npm run build on pushes to main and pull requests.
- Staging smoke tests are legacy Vercel-specific and require isolated staging-only environment variables; they are not part of the default test command.
- Live browser checks are separate from GitHub Actions validation.
