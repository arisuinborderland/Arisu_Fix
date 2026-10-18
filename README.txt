ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV320
Updated: 2026-10-18

V319: Raised the header Privacy Policy button by 2px using a scoped transform; other header elements are unchanged.

V318: Increased the “A CLEAR PROCESS” heading font size by 2px on mobile only; desktop sizing unchanged.

PROJECT OVERVIEW
Arisu Recovery Contact (branded on the site as Arisu Fix | Recovery Contact & Assistance) is a static, responsive website that presents account-recovery assistance information, official contact routes, safety guidance, customer feedback, and supporting site pages.

MAIN WEBSITE FEATURES
- Home page (index.html): introduction, service status, scam-awareness reminder, social profile previews, recovery proofs and customer feedback links, service categories, account-assistance process, safety guidance, site purpose, terms and limitations, and contact information.
- Account Recovery Assistance: describes legitimate account recovery support and common account-access issues. Assistance is intended for the account owner or an authorized administrator; it does not offer hacking, password bypassing, or unauthorized access.
- Daily Bible Verse: displays the site's daily verse feature and associated visual presentation.
- Social destinations: includes TikTok and Facebook Page previews/links. Verify the published links before changing official account destinations.
- Recovery Proofs (proofs.html): separate page for recovery-related proof images stored under proofs/.
- Customer Feedback (reviews.html): separate page for customer feedback content and its supporting assets under reviews/.
- Privacy Policy (privacy.html): separate privacy-information page with its own stylesheet and dynamic year helper.
- Responsive presentation: shared styles plus targeted layout and scroll behavior scripts support mobile and desktop layouts. Changes should be tested at both viewport sizes.

IMPORTANT PROJECT FILES
- index.html — main landing page and primary page content.
- privacy.html / privacy.css — privacy page and page-specific styling.
- proofs.html / proofs.css — recovery proof gallery and styling.
- reviews.html / reviews.css — customer feedback page and styling.
- styles.css — shared site styling, responsive rules, and visual components.
- script.js — primary interactive site behavior.
- desktop-layout.js — desktop-specific layout behavior.
- scroll-reveal.js — scroll reveal/animation behavior.
- scroll-restoration.js — scroll position/restoration behavior.
- privacy-year.js — dynamic year behavior on the privacy page.
- verse-lake-photo.jpg — background image used by the Bible verse design.
- favicon.* and apple-touch-icon.png — browser and device icons.
- social/profile preview images — visual assets used by the site.
- proofs/ and reviews/ — image assets for the proof and feedback pages.
- package.json — project metadata and build command.
- build.js — copies deployable site files into dist/ and verifies that README.txt files are excluded from public output.
- vercel.json — Vercel configuration and response/security headers. The Content-Security-Policy is configured in Report-Only mode; do not change it to enforcing mode without compatibility testing.
- .vercelignore — Vercel ignore configuration.

BUILD AND DEPLOYMENT
Requirements: Node.js 18 or newer.
1. Extract the ZIP and open a terminal in the ArisuV320 project folder.
2. Run: npm run build
3. The build output is generated in dist/.
4. Deploy the contents of dist/ to the static hosting target, or configure Vercel so the project build output directory is dist/.
5. README.txt and development/build configuration files are intentionally excluded from dist/ so internal documentation is not published as website content.

MAINTENANCE RULES
- Keep this README in the source project; do not publish it in the public website output.
- For each release, update the version and date above and align cache-busting version tokens across HTML, CSS, JavaScript, and referenced background images.
- Keep the ZIP structure clean: one top-level project folder only, with no generated dist/ folder included in the source ZIP.
- Avoid broad CSS refactors unless separately reviewed. The shared stylesheet contains accumulated rules that may interact with later overrides.
- After edits, run the build, check JavaScript syntax, verify ZIP integrity, and inspect the site at mobile and desktop widths. Static checks do not replace visual regression testing in a browser.
- Keep security headers and CSP changes under compatibility review; Report-Only CSP does not block resources but can report potential violations.

RELEASE NOTES — ARISUV305
- Restored the missing README project descriptions, feature inventory, file map, build/deployment notes, and maintenance checklist.
- Preserved the V304 website implementation and the mobile-only two-column account-recovery issue-list styling; this documentation correction does not intentionally change page layout or site behavior.
- Aligned project version/cache-busting references to ArisuV320.


LATEST CHANGE — ARISUV306
- Replaced the mobile reassurance note with “Clear guidance. Honest expectations. Every case is handled individually.”
- Added a mobile-only Soft Blue Glass gradient treatment. Desktop retains its previous text and styling.


ARISUV307 RELEASE NOTES
- Applied the Soft Blue Glass reassurance-note design to both desktop and mobile.
- Replaced the separate desktop/mobile wording with one shared message: “Clear guidance. Honest expectations. Every case is handled individually.”
- Desktop styling now uses the same light blue-white-violet gradient, blue accent icon, refined border, and subtle shadow. Mobile keeps compact spacing.
- No other sections were intentionally changed.


ArisuV320 release note: Added the same thin blue-to-cyan gradient divider with a centered accent dot above the ARISU RECOVERY CONTACT kicker in the Why Choose Arisu section. No other section layout intentionally changed.


ArisuV320 release note: Increased contrast and thickness of both horizontal divider lines around “OR VISIT MY OTHER SOCIAL MEDIA ACCOUNTS” and made its label font more prominent on desktop and mobile. No other section layout intentionally changed.
