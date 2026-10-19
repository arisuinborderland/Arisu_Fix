ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV417
Updated: 2026-10-19

ARISUV417 RELEASE SUMMARY — 2026-10-19
- Conservative maintenance based on ArisuV416; no intentional layout redesign or component sizing change.
- Removed eight verified same-selector/same-media duplicate declarations, keeping the later identical declarations that determine the cascade.
- Removed seven empty CSS rule/media-query blocks left by earlier edits; no active declarations were removed from those blocks because they contained none.
- Aligned active cache-busting tokens across all four HTML pages to ArisuV417.
- Removed one duplicated ArisuV389 changelog paragraph and corrected stale CSP/testing documentation.
- Validation: archive integrity, build, CSS/JavaScript syntax, local references, version tokens, and duplicate IDs checked. A full browser visual regression was not completed; verify desktop, tablet, and mobile before deployment.


ArisuV412 update: audited the TikTok and Facebook title-divider overrides. Removed the competing head-level and heading pseudo-elements, then made each 1px divider the h3 bottom border with 2px bottom padding so it follows the title position. Decorative arrows remain hidden on mobile. Browser rendering still needs visual confirmation.

ArisuV404 update: corrected mobile CTA typography by separating the left icon from label sizing. The document and star icons are anchored independently; labels use a full-width flex area with 13px type and normal wrapping, preventing inherited flex sizing from squeezing text. Both buttons remain 48px tall and full-width within their existing content areas. Preview images, outer cards, and unrelated sections are unchanged. Browser rendering still needs visual confirmation.

ArisuV399 update: lifted the mobile View All Reviews button by an additional 2px (translateY -6px to -8px). No preview image, preview container, outer card, or desktop layout rules were intentionally changed in this update.

ArisuV399 update: lifted the mobile View All Reviews button by 6px only. The V395 preview image and its bordered container remain unchanged.

ArisuV389 adjustment: reduced the actual bordered Customer Feedback preview card height by 6px at the bottom on mobile, using a targeted card-level rule. The View All Reviews button dimensions and normal-flow position are preserved. Existing Recovery Proofs and other layout rules are unchanged. Static ZIP integrity checked; live browser rendering not performed.

ArisuV395 adjustment: increased the outer Customer Feedback preview card height by 4px at the bottom (reversing part of the previous 20px reduction), and extended the actual review preview image by a further 6px at the bottom on mobile. The View All Reviews button remains unchanged.

ArisuV389 maintenance: reduced the actual layout gap between the Customer Feedback preview and View All Reviews button by 6px by changing its mobile margin-top from 2px to -4px. Preserved the existing transform and button dimensions; other card layout and desktop rules retained. Live browser rendering not performed.


ArisuV389 maintenance: raised both action buttons by 2px, moved the heading divider up 2px, lifted the entire Recovery Proofs content by 2px, and removed its decorative heading arrow. Preserved the 2px heading-to-preview spacing, card dimensions, links, and other sections. Static checks completed; live browser rendering not performed.

ArisuV389 maintenance: removed the conflicting high-specificity mobile flex/nowrap button override; consolidated Recovery Proofs button layout with explicit grid columns and important declarations. Set both Recovery Proofs and Customer Feedback cards to 8px top padding (2px tighter than V371), kept 2px preview spacing, and preserved all links and other sections. Static checks completed; live browser rendering not performed.
ArisuV367 adjustment: tightened mobile Recovery Proofs and Customer Feedback headings toward the card top, retained 2px spacing above preview images, moved the document icon toward the right side of the Recovery Proofs button, and changed its arrow to the diagonal ↗ style used by View All Reviews. Other layout sections and destinations preserved. Visual browser regression testing has not been performed.


ArisuV367 social card adjustment: removed TikTok and Facebook icons from the card headers and placed matching icons inside their respective profile buttons. Card headings now use text only; preview images have a 2px top spacing adjustment. Existing destinations, screenshots, buttons, and other site sections are preserved. Static ZIP checks completed; visual browser regression testing has not been performed.

ArisuV367 safe CSS cleanup: removed two ineffective #contact-descendant selectors for #serviceStatus after confirming the card is a sibling of #contact in index.html. Preserved the single mobile-only #serviceStatus positioning rule at margin-top: -2px. No intended visual change beyond the existing 2px lift.

ArisuV367 mobile adjustment: lifted the Service Status card by 2px. Removed older conflicting mobile margin-top overrides and replaced them with one direct ID selector; unrelated styles preserved.

ArisuV367 mobile spacing adjustment: lifted the outer PLEASE READ / Terms & limitations card by 4px on screens up to 640px; internal padding and desktop layout are unchanged.
ArisuV367 mobile spacing adjustment: reduced the bottom padding of the main Why Choose Arisu outer card by 8px (10px to 2px) on screens up to 640px; top and horizontal padding and desktop layout are unchanged.
ArisuV367 mobile spacing adjustment: reduced the outer bottom spacing after the Remember safety card by 8px on screens up to 640px; internal card padding and top spacing are unchanged.
ArisuV367 mobile spacing adjustment: reduced only the Remember: Keep Your Account Safe card top and bottom padding by 4px (12px to 8px) on screens up to 640px. Horizontal padding, desktop spacing, icon, typography, borders, and surrounding layout remain unchanged.
ArisuV367 mobile spacing adjustment: reduced the Clear guidance / Honest expectations note card top and bottom padding by another 2px (9px to 7px) on screens up to 640px. Horizontal padding, desktop spacing, typography, icon, borders, and surrounding layout remain unchanged.
ArisuV367 mobile spacing adjustment: reduced the Clear guidance / Honest expectations note card top and bottom padding by 2px (13px to 11px) on screens up to 640px. Horizontal padding, desktop spacing, typography, icon, borders, and surrounding layout remain unchanged.

ArisuV367 scroll-performance refinement: removed the broad mobile scroll-time animation pause selector that applied to every element and pseudo-element. The pause now targets only the floating WhatsApp decoration, and sticky-header blur is reduced while scrolling on mobile to lower compositing work. Scroll-reveal animation behavior and layout declarations are preserved. Validate scrolling on the deployed preview across mobile and desktop before treating performance as confirmed.

ArisuV367 maintenance audit: removed only CSS rules whose declarations were all superseded later by declarations for the exact same selector and media/support context, with equal or higher !important priority. This is a conservative cascade cleanup; final winning declarations were retained. CSS parser, JS syntax, build, and ZIP checks are required. Browser visual regression was not independently available.


ArisuV367 CSS cascade cleanup (preserve-first): Removed three earlier exact duplicate mobile declarations from styles.css where the same selector, media context, and declarations appeared again later. The later declarations remain in place, preserving the final cascade result.
ArisuV367 CSS refactor (preserve-first): Removed eight empty media-query blocks from styles.css. No style declarations or selector order were intentionally changed. Repeated selectors and !important rules were retained where their cascade role has not yet been proven redundant. Browser visual regression testing status was later reported by the user as passed; this was not independently reproduced during the V329 maintenance pass.
V325: Corrected the project folder name to match the release ZIP, refreshed active cache-busting tokens, and cleaned the build/deployment instructions. Audited the header CSS cascade and retained the existing scoped final overrides to avoid broad layout changes. CSP remains Report-Only pending compatibility testing.
V322: Added smart hide-on-scroll header behavior across pages: the sticky header hides while scrolling down, reappears on upward scroll, stays visible at the top, and respects reduced-motion preferences. Added thresholding and requestAnimationFrame scheduling to reduce jitter; preserved page layout and other features.

V321: Applied the Aurora Glass header gradient (soft blue → lavender → blush pink) with a subtle border and shadow; preserved header layout, buttons, and page sections. Updated active cache-busting tokens and package version.


V319: Raised the header Privacy Policy button by 2px using a scoped transform; other header elements are unchanged.

V318: Increased the “A CLEAR PROCESS” heading font size by 2px on mobile only; desktop sizing unchanged.

ArisuV367 conservative maintenance: removed 19 empty CSS at-rule blocks and 564 earlier declarations superseded by later declarations for the same selector, property, and at-rule context with equal or higher !important priority. No selector order or surviving declaration values were intentionally changed. Bumped active cache-busting tokens and package version. Build, syntax, and archive checks required; browser visual regression is not independently available in this environment.

ArisuV367 security/deployment review: retained Content-Security-Policy-Report-Only; do not switch to enforcing CSP until the deployed preview is tested in a browser. The current JavaScript updates CSS properties dynamically, so enforcement must be checked against scroll reveals, review lightbox, and image-interaction behavior. Confirm response headers on the deployed preview and run mobile/desktop visual regression before production. Active HTML cache-busting tokens and package version updated to ArisuV367. No visual CSS declarations or page content intentionally changed.

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
- vercel.json — Vercel configuration and response/security headers. The Content-Security-Policy is enforcing; re-test required resources and response headers when changing it.
- .vercelignore — Vercel ignore configuration.

BUILD AND DEPLOYMENT
Requirements: Node.js 18 or newer.
1. Extract the ZIP and open a terminal in the ArisuV367 project folder.
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
- Keep security headers and enforcing CSP changes under compatibility review; confirm deployed response headers and retest resources when the policy changes.

RELEASE NOTES — ARISUV305
- Restored the missing README project descriptions, feature inventory, file map, build/deployment notes, and maintenance checklist.
- Preserved the V304 website implementation and the mobile-only two-column account-recovery issue-list styling; this documentation correction does not intentionally change page layout or site behavior.
- Aligned project version/cache-busting references to ArisuV367.


LATEST CHANGE — ARISUV306
- Replaced the mobile reassurance note with “Clear guidance. Honest expectations. Every case is handled individually.”
- Added a mobile-only Soft Blue Glass gradient treatment. Desktop retains its previous text and styling.


ARISUV307 RELEASE NOTES
- Applied the Soft Blue Glass reassurance-note design to both desktop and mobile.
- Replaced the separate desktop/mobile wording with one shared message: “Clear guidance. Honest expectations. Every case is handled individually.”
- Desktop styling now uses the same light blue-white-violet gradient, blue accent icon, refined border, and subtle shadow. Mobile keeps compact spacing.
- No other sections were intentionally changed.


ArisuV367 release note: Added the same thin blue-to-cyan gradient divider with a centered accent dot above the ARISU RECOVERY CONTACT kicker in the Why Choose Arisu section. No other section layout intentionally changed.


ArisuV367 release note: Increased contrast and thickness of both horizontal divider lines around “OR VISIT MY OTHER SOCIAL MEDIA ACCOUNTS” and made its label font more prominent on desktop and mobile. No other section layout intentionally changed.

ArisuV367 mobile adjustment: added 2px spacing above the Service Status card; other layout styling preserved.

ArisuV367 fix: target #serviceStatus directly and set mobile margin-top to 2px so the rule applies to the actual card.

ArisuV367 change note (2026-10-19): Removed the duplicate TikTok and Facebook authenticity warning boxes from the social cards. The main Scam Awareness Reminder remains in place; social previews, links, buttons, and overall card structure are unchanged.

ArisuV367 update: Changed the Facebook social-card button label to “View Facebook Page” and applied equal full-width/minimum-height rules to match the TikTok button. Other button placement and card structure are preserved.
ArisuV367: removed the Recovery Proofs and Customer Feedback icon tiles from their headings and moved each icon into its matching bottom button. Added 2px top spacing to both headings and their preview areas. Existing card structure, image assets, links, and unrelated sections were preserved.

ArisuV367 update (2026-10-19): Corrected the mobile Customer Feedback heading and preview spacing, and rebuilt the View Recovery Proofs button as a three-column layout so its document icon appears before the label and its diagonal arrow remains separated at the right. No unrelated sections or links were intentionally changed.


ArisuV369 adjustment: corrected the mobile View Recovery Proofs button so the document icon stays on the left, the label remains centered, and the diagonal arrow stays at the far right, matching the View All Reviews button layout. No other sections were intentionally changed.


ArisuV369 adjustment: corrected mobile Recovery Proofs button label truncation. The document icon remains in the left column, the full label uses the flexible center column, and the diagonal arrow remains in the right column.

ArisuV371 maintenance: consolidated the accumulated V367-V369 mobile Recovery Proofs / Customer Feedback spacing and Recovery Proofs CTA overrides into one authoritative mobile block. Reordered CTA children to icon, label, arrow; the grid reserves separate columns and allows the label to wrap rather than overlap or truncate. Preserved other page styles and links. ZIP/CSS/HTML checks performed; live browser rendering not performed.

CSS cleanup: in the consolidated mobile rules, moved both Recovery Proofs and Customer Feedback headings up by 2px; retained 2px spacing from heading to preview.


ArisuV389: restored the proven V371 mobile Recovery Proofs button layout, retained 2px heading lift and 2px preview spacing, and made the Reviews star icon visible with left-icon / centered-label / right-arrow alignment.


ArisuV389: Customer Feedback mobile heading restored to the V368 positioning reference. Removed inherited top padding on the feedback content wrapper; preserved 2px heading-to-preview spacing and left existing button/card structure unchanged.

ArisuV389: Mobile-only adjustment based on the supplied screenshot. Lift both Recovery Proofs and Customer Feedback heading text by 2px and widen View All Reviews to match the Recovery Proofs button width without changing card dimensions.


ArisuV389 update: Added a subtle 1px divider under the Recovery Proofs and Customer Feedback headings on mobile, matching the social-profile heading divider style. Other layout dimensions and buttons were left unchanged.



ArisuV389 maintenance: raised Recovery Proofs and Customer Feedback mobile headings by an additional 4px (translateY -8px total); kept the heading divider, 2px preview spacing, buttons, and other layout unchanged.

ArisuV389: shortened the mobile Customer Feedback featured preview by an additional 6px and lifted its View All Reviews button by 6px. Other cards and Recovery Proofs button positioning remain unchanged.
ArisuV389 update: reduced the bottom height of the bordered Customer Feedback preview card by a further 6px (12px total relative to its original full height). View All Reviews button dimensions and position remain unchanged. Mobile-only targeted rule; other layout sections unchanged. ZIP integrity checked; live browser rendering not performed.
V389: Reduced the mobile Customer Feedback bordered preview card by an additional 8px; left the View All Reviews button and other layout rules unchanged.

ArisuV399: Removed the diagonal arrows from both mobile action buttons, retained the document and star icons, and matched their 48px height and visible width using Recovery Proofs as the reference. Other preview images and card layout were left unchanged.


ArisuV413 update: Restored original TikTok and Facebook preview images on desktop to remove the oversized colored side areas caused by transparent desktop-clean assets. Mobile preview behavior is unchanged.


ArisuV414 update: Added one desktop-only authoritative sizing rule for #serviceStatus so the Service Status card stretches to the same full content width as the WhatsApp feature card. Existing internal grid, mobile rules, and unrelated sections are preserved. Desktop browser rendering still requires visual confirmation.
