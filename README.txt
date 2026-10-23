ARISU FIX — PROJECT README
Version: AFV259
Updated: 2026-10-23

Current release: AFV259
Package version: 259.0.0
Source ZIP folder: AFV259/

AFV259 RELEASE SUMMARY
- Made the Recovery Stories upload panel more compact on mobile while preserving the existing visual identity.
- Added selected-image count, total selected file size, and an invalid-file count summary.
- Kept client-side file type and 3.5 MB per-image validation, with a clear summary before publishing.
- Updated the publish action to show the selected Story count and duration, disable when no valid images are selected, and prevent duplicate submissions while processing.
- Preserved existing authentication, backend endpoints, drafts, Story expiry, Active Stories management, and other site pages.
- Synchronized active cache-busting references, package metadata, and regression-test expectations to AFV259 / 259.0.0.
- Kept the generated dist/ directory out of the delivered source ZIP.

Validation notes
- Automated tests and production build are run during release preparation.
- Staging smoke tests require isolated staging-only environment variables and must be run separately.
- Live Vercel deployment and browser-based visual comparison have not been verified in this release.
