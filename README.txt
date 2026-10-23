ARISU FIX — PROJECT README
Version: AFV183
Updated: 2026-10-23

Current release: AFV183
Package version: 183.0.0
Source ZIP folder: AFV183/

AFV183 RELEASE SUMMARY
- Improved footer Stories count loading state and accessibility.
- Recorded browser-side count request duration and the server timing header for diagnostics.
- Preserved the independent lightweight count request, fallback count, and existing Stories viewer behavior.
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
