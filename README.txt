ARISU FIX — PROJECT README
Version: AFV190
Updated: 2026-10-23

Current release: AFV190
Package version: 190.0.0
Source ZIP folder: AFV190/

AFV190 RELEASE SUMMARY
- Kept only the “About This Website” button on the homepage; positioned it visibly above the footer and fixed mobile navigation.
- Moved the complete “PLEASE READ — Terms & Limitations” card, including the legitimate recovery notice, onto the dedicated About page.
- Updated homepage/footer Terms links to open about.html#terms.
- Updated package version, cache-busting references, and release documentation to AFV190.

Build and test
- npm test
- npm run build

Deployment note
Vercel deployment must be verified from the actual preview/deployment logs. Local build success does not prove a live deployment succeeded.

Documentation map
- RELEASE_HISTORY.txt: historical release notes
- tests/: automated regression tests
- scripts/: maintenance and staging verification utilities
