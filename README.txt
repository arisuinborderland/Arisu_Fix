ARISU FIX — PROJECT README
Version: AFV261
Updated: 2026-10-23

Current release: AFV261
Package version: 261.0.0
Source ZIP folder: AFV261/

AFV261 RELEASE SUMMARY
- Tightened the Recovery Stories Admin mobile layout, focusing on the file picker, empty preview area, caption, draft control, helper text, and publish action.
- Preserved the AFV260 image selection count, total file size summary, file validation, upload progress, and publish-state logic.
- Scoped the new compact styling to the Story Admin page at mobile/tablet widths; other site pages and backend behavior remain unchanged.
- Synchronized active cache-busting references, package metadata, tests, and README to AFV261 / 261.0.0.
- Kept the generated dist/ directory out of the delivered source ZIP.

Validation notes
- Automated tests and production build are run during release preparation.
- Staging smoke tests require isolated staging-only environment variables and must be run separately.
- Live Vercel deployment and browser-based visual comparison have not been verified in this release.
