ARISU FIX — PROJECT README
Version: AFV182
Updated: 2026-10-23

Current release: AFV182
Package version: 182.0.0
Source ZIP folder: AFV182/

AFV182 RELEASE SUMMARY
- Fixed build validation so Vercel-generated node_modules/.bin symbolic links are not treated as project source files.
- Preserved the explicit public output allowlist and backend/source exclusions.
- Kept source tests and staging scripts out of public dist output.

Build and test
- npm test
- npm run build

Deployment note
Vercel deployment must be verified from the actual preview/deployment logs. Local build success does not prove a live deployment succeeded.

Documentation map
- RELEASE_HISTORY.txt: historical release notes
- tests/: automated regression tests
- scripts/: maintenance and staging verification utilities
