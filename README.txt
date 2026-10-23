ARISU FIX — PROJECT README
Version: AFV189
Updated: 2026-10-23

Current release: AFV189
Package version: 189.0.0
Source ZIP folder: AFV189/

AFV189 RELEASE SUMMARY
- Moved the full “More Than Just Account Recovery” content to a dedicated About page.
- Replaced the homepage purpose/about section with a single “About This Website” button linking to about.html.
- Kept Terms & Limitations and the legitimate account recovery notice on the homepage.
- Added responsive About page styling and included the new page and stylesheets in the production build allowlist.
- Updated package version, active cache-busting references, and project folder name to AFV189.

Build and test
- npm test
- npm run build

Deployment note
Vercel deployment must be verified from the actual preview/deployment logs. Local build success does not prove a live deployment succeeded.

Documentation map
- RELEASE_HISTORY.txt: historical release notes
- tests/: automated regression tests
- scripts/: maintenance and staging verification utilities
