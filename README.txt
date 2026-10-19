ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV362
Updated: 2026-10-19
ArisuV362 safe CSS cleanup: removed two ineffective #contact-descendant selectors for #serviceStatus after confirming the card is a sibling of #contact in index.html. Preserved the single mobile-only #serviceStatus positioning rule at margin-top: -2px. No intended visual change beyond the existing 2px lift.

ArisuV362 mobile adjustment: lifted the Service Status card by 2px. Removed older conflicting mobile margin-top overrides and replaced them with one direct ID selector; unrelated styles preserved.

ArisuV348 mobile spacing adjustment: lifted the outer PLEASE READ / Terms & limitations card by 4px on screens up to 640px; internal padding and desktop layout are unchanged.
ArisuV347 mobile spacing adjustment: reduced the bottom padding of the main Why Choose Arisu outer card by 8px (10px to 2px) on screens up to 640px; top and horizontal padding and desktop layout are unchanged.
ArisuV343 mobile spacing adjustment: reduced the outer bottom spacing after the Remember safety card by 8px on screens up to 640px; internal card padding and top spacing are unchanged.
ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV362
Updated: 2026-10-19
ArisuV338 mobile spacing adjustment: reduced only the Remember: Keep Your Account Safe card top and bottom padding by 4px (12px to 8px) on screens up to 640px. Horizontal padding, desktop spacing, icon, typography, borders, and surrounding layout remain unchanged.
ArisuV337 mobile spacing adjustment: reduced the Clear guidance / Honest expectations note card top and bottom padding by another 2px (9px to 7px) on screens up to 640px. Horizontal padding, desktop spacing, typography, icon, borders, and surrounding layout remain unchanged.
ArisuV335 mobile spacing adjustment: reduced the Clear guidance / Honest expectations note card top and bottom padding by 2px (13px to 11px) on screens up to 640px. Horizontal padding, desktop spacing, typography, icon, borders, and surrounding layout remain unchanged.

ArisuV334 scroll-performance refinement: removed the broad mobile scroll-time animation pause selector that applied to every element and pseudo-element. The pause now targets only the floating WhatsApp decoration, and sticky-header blur is reduced while scrolling on mobile to lower compositing work. Scroll-reveal animation behavior and layout declarations are preserved. Validate scrolling on the deployed preview across mobile and desktop before treating performance as confirmed.

ArisuV331 maintenance audit: removed only CSS rules whose declarations were all superseded later by declarations for the exact same selector and media/support context, with equal or higher !important priority. This is a conservative cascade cleanup; final winning declarations were retained. CSS parser, JS syntax, build, and ZIP checks are required. Browser visual regression was not independently available.


ArisuV328 CSS cascade cleanup (preserve-first): Removed three earlier exact duplicate mobile declarations from styles.css where the same selector, media context, and declarations appeared again later. The later declarations remain in place, preserving the final cascade result.
ArisuV327 CSS refactor (preserve-first): Removed eight empty media-query blocks from styles.css. No style declarations or selector order were intentionally changed. Repeated selectors and !important rules were retained where their cascade role has not yet been proven redundant. Browser visual regression testing status was later reported by the user as passed; this was not independently reproduced during the V329 maintenance pass.
V325: Corrected the project folder name to match the release ZIP, refreshed active cache-busting tokens, and cleaned the build/deployment instructions. Audited the header CSS cascade and retained the existing scoped final overrides to avoid broad layout changes. CSP remains Report-Only pending compatibility testing.
V322: Added smart hide-on-scroll header behavior across pages: the sticky header hides while scrolling down, reappears on upward scroll, stays visible at the top, and respects reduced-motion preferences. Added thresholding and requestAnimationFrame scheduling to reduce jitter; preserved page layout and other features.

V321: Applied the Aurora Glass header gradient (soft blue → lavender → blush pink) with a subtle border and shadow; preserved header layout, buttons, and page sections. Updated active cache-busting tokens and package version.


V319: Raised the header Privacy Policy button by 2px using a scoped transform; other header elements are unchanged.

V318: Increased the “A CLEAR PROCESS” heading font size by 2px on mobile only; desktop sizing unchanged.

ArisuV332 conservative maintenance: removed 19 empty CSS at-rule blocks and 564 earlier declarations superseded by later declarations for the same selector, property, and at-rule context with equal or higher !important priority. No selector order or surviving declaration values were intentionally changed. Bumped active cache-busting tokens and package version. Build, syntax, and archive checks required; browser visual regression is not independently available in this environment.

ArisuV333 security/deployment review: retained Content-Security-Policy-Report-Only; do not switch to enforcing CSP until the deployed preview is tested in a browser. The current JavaScript updates CSS properties dynamically, so enforcement must be checked against scroll reveals, review lightbox, and image-interaction behavior. Confirm response headers on the deployed preview and run mobile/desktop visual regression before production. Active HTML cache-busting tokens and package version updated to ArisuV333. No visual CSS declarations or page content intentionally changed.

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
1. Extract the ZIP and open a terminal in the ArisuV333 project folder.
2. Run: npm run build
3. The build output is generated in dist/.
4. Deploy the contents of dist/ to the static hosting target, or configure Vercel so the project build output directory is dist/.
5. README.txt and development/build configuration files are intentionally excluded from dist/ so internal documentation is not published as website content.

MAINTENANCE RULES
- Keep this README in the source project; do not publish it in the public website output.
- For each release, update the version and date above and align active cache-busting version tokens across HTML, CSS, JavaScript, and referenced background images. Keep historical CSS comments when they document earlier changes; do not treat comments alone as active overrides.
- Keep the ZIP structure clean: one top-level project folder only, with no generated dist/ folder included in the source ZIP.
- The shared stylesheet contains accumulated rules that may interact with later overrides. Consolidate repeated selectors only after checking media-query context, specificity, source order, and visual regression risk.
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

ArisuV362 mobile adjustment: added 2px spacing above the Service Status card; other layout styling preserved.

ArisuV362 fix: target #serviceStatus directly and set mobile margin-top to 2px so the rule applies to the actual card.

ArisuV362 change note (2026-10-19): Removed the duplicate TikTok and Facebook authenticity warning boxes from the social cards. The main Scam Awareness Reminder remains in place; social previews, links, buttons, and overall card structure are unchanged.
