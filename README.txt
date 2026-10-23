ARISU FIX — PROJECT README
Version: AFV186
Updated: 2026-10-23

Current release: AFV186
Package version: 186.0.0
Source ZIP folder: AFV186/

AFV186 RELEASE SUMMARY
- Improved Story Admin image picker with clearer full-width upload guidance and responsive image previews.
- Added per-image remove controls before upload and clearer invalid file-size feedback.
- Refined Upload Stories / Active Stories tab states and focus visibility.
- Added upload progress feedback for multi-image publishing.
- Added image thumbnails to Active Stories management while preserving expiry/status details and existing archive/delete confirmations.
- Preserved existing Story API behavior, 24-hour expiry rules, drafts, and permanent Recovery Proofs.
- Updated active cache-busting references and package/readme version metadata to AFV186.

Build and test
- npm test
- npm run build

Deployment note
Vercel deployment must be verified from the actual preview/deployment logs. Local build success does not prove a live deployment succeeded.

Documentation map
- RELEASE_HISTORY.txt: historical release notes
- tests/: automated regression tests
- scripts/: maintenance and staging verification utilities
