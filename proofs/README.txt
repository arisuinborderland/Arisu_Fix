ARISU FIX — PROJECT README
Version: AFV118
Updated: 2026-10-21

## AFV118 — Shared floating menu on Recovery Proofs and Customer Reviews
- Replaced all previous caption content under Screenshot 03 with “Two Factor Authentication (No Email & Number Access)” and date “October 21, 2026”.
- Matched Screenshot 03 caption styling to the highlighted recovery-case format used for Screenshots 01 and 02.
- Updated Screenshot 03 accessible label and image alt text; preserved its image, lightbox behavior, and all other cards/layout.
- Updated active cache-busting references and package version to AFV109 / 109.0.0.
- Excluded dist/ from the source ZIP.


## AFV29 — MY SERVICES card bottom spacing
- Reduced the MY SERVICES outer heading card bottom padding to 2px on desktop and mobile.
- Updated only the existing card padding declarations; other positioning offsets remain unchanged.

## AFV29 — Targeted intro spacing adjustment
- Adjusted one existing CSS rule for `.services-intro` from `top: -6px` to `top: -20px` so the description moves upward and visually sits 2px from the subtitle, while keeping the subtitle and heading offsets unchanged.
- No additional CSS override was added.

Put authorized proof screenshots/images in this folder, then edit the
recoveryProofs array in ../script.js. Supported fields are:
- category: "suspended" or "disabled"
- title: the displayed account status/title
- image: relative path such as "proofs/example.jpg"
- alt: accessible description of the image
- violation: displayed violation label
- date: optional date label

Example:
  {
    category: "suspended",
    title: "Suspended Account",
    image: "proofs/example.jpg",
    alt: "Account status example with personal details redacted",
    violation: "Account Integrity",
    date: "October 2026"
  }

The website is static and has no upload backend; redeploy after adding or
changing files. Obtain permission, redact sensitive account/person details,
and never imply that an example guarantees a similar recovery outcome.


V63 maintenance: removed only five repeated global :root custom-property declarations whose values were identical to earlier declarations. Responsive rules and component-specific CSS were left unchanged.


V65 maintenance note: Updated cache-busting version tokens across HTML/CSS asset references to ArisuV65. No styling rules or application logic were intentionally changed.
