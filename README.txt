ARISU FIX — PROJECT README
Version: AFV264
Updated: 2026-10-24

Current release: AFV264
Package version: 264.0.0
Source ZIP folder: AFV264/

AFV264 RELEASE SUMMARY
- Aligned Story Admin image-size validation with the server-side 3 MiB upload limit.
- Improved partial batch-upload failure handling so successfully uploaded images are removed from the remaining retry selection where supported.
- Updated active AFV cache-busting references, package metadata, and regression tests to AFV264 / 264.0.0.
- Kept generated dist/ output out of the delivered source ZIP.

Validation notes
- Automated tests and production build should be run against this branch before merging.
- Staging smoke tests require isolated staging-only environment variables and must be run separately.
- Live Vercel deployment and browser-based visual comparison have not been verified by this source change.
