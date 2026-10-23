ARISU FIX — PROJECT README
Version: AFV255
Updated: 2026-10-23

Current release: AFV255
Package version: 255.0.0
Source ZIP folder: AFV255/

AFV255 RELEASE SUMMARY
- Fixed missing Story Viewer styling on About and Privacy Policy pages.
- Added regression coverage to require the viewer stylesheet on every page with Stories navigation.
- Performed a deeper source-level file audit based on AFV253.
- Synchronized active cache-busting references, package metadata, tests, and asset-guide versions to AFV255.
- Corrected stale version labels and removed unrelated AFV195 historical notes from the Recovery Proofs and Customer Reviews asset guides.
- Preserved application CSS declarations and runtime behavior; no unverified WhatsApp CSS consolidation was made.
- Excluded the generated dist/ directory from the delivered source ZIP.

Validation notes
- Automated tests and production build are run during release preparation.
- The build generates dist/ locally; dist/ is intentionally excluded from the delivered source ZIP.
- Staging smoke tests require isolated staging-only environment variables and must be run separately.
- Browser visual comparison and live Vercel deployment have not been verified in this release.
