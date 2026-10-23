ARISU FIX — PROJECT README
Version: AFV184
Updated: 2026-10-23

Current release: AFV184
Package version: 184.0.0
Source ZIP folder: AFV184/

AFV184 RELEASE SUMMARY
- Added Vercel edge caching for successful public Stories counts (15-second freshness with stale-while-revalidate) while leaving browser responses no-store.
- Added a 10-minute browser-storage cache so repeat visits can display the latest known Stories count immediately while the endpoint refreshes in the background.
- Kept the live endpoint authoritative, preserving fallback to the full Stories list when the count endpoint fails.
- Preserved Stories viewer layout and behavior; updated release version and active cache-busting references.

Build and test
- npm test
- npm run build

Deployment note
Vercel deployment must be verified from the actual preview/deployment logs. Local build success does not prove a live deployment succeeded.

Documentation map
- RELEASE_HISTORY.txt: historical release notes
- tests/: automated regression tests
- scripts/: maintenance and staging verification utilities
