V_168 UPDATE
- Desktop opening layout now prioritizes the Daily Bible Verse, account-recovery intro, WhatsApp contact card, and contact availability.
- Social links, recovery proofs, and feedback collage are placed lower on desktop; mobile keeps its previous section order.
- Preserved the existing animated blue badge and 7-day recovery warranty section.

ARISU RECOVERY CONTACT — PREMIUM RESPONSIVE WEBSITE
===================================================
A static, mobile-responsive contact page with premium gradients, contact links,
account-safety information, recovery expectations, FAQ, Terms, and Privacy Policy.
No backend, database, build tools, or package installation are required.

MAIN FEATURES
-------------
- WhatsApp contact button with a prefilled greeting. Uses a standard HTTPS wa.me link instead of intent:// deep links to improve
compatibility with TikTok and other in-app browsers. Visitors still
review and send the message themselves.
- Direct TikTok profile card: https://www.tiktok.com/@arisuryohei2020
- Direct Facebook Page card: https://www.facebook.com/share/19gap1qLBf/
- The TikTok and Facebook cards are clickable across their full surface.
- Floating WhatsApp contact shortcut.
- Five-step explanation of the assistance process, including a 7-day recovery warranty for successfully recovered accounts.
- Clear notes about service fees, case-by-case timelines, and non-guaranteed results.
- Account-safety reminder: never share passwords, one-time codes, 2FA codes, backup
codes, or recovery codes.
- Expandable FAQ section, About section, Terms & limitations section, and a dedicated
privacy.html page linked from both the header and footer.
- Responsive layouts, keyboard focus styling, reduced-motion support, and dynamic
footer year.

PROJECT FILES
-------------
index.html       Main contact page and information sections
privacy.html     Privacy Policy page
styles.css       Responsive design and premium visual styling
script.js        WhatsApp and social destination logic; current-year update
arisu-profile.png Arisu profile image used in header/footer/About
proofs/          Put proof screenshots/images here (see proofs/README.txt)
README.txt       This guide

RUN LOCALLY
-----------
1. Extract this ZIP.
2. Open the single `Arisu Recovery Contact` folder. The website files are directly
   inside it; there is no second nested project folder.
3. Double-click index.html to open it in a browser, or serve this folder using any
   static local server (for example, VS Code Live Server).
4. Test the WhatsApp, TikTok, Facebook, and Privacy Policy links on the device where
you will publish/use the site. App opening may depend on Android, browser, and installed
app settings; regular web links remain the fallback destinations.

DEPLOY TO NETLIFY
-----------------
1. Extract this ZIP.
2. Deploy the single `Arisu Recovery Contact` folder through your connected Git repository
   or upload the folder to your static host.
3. Open the published URL on desktop and mobile and manually test each external destination.

SAFETY AND LIMITATIONS
----------------------
- This is an independent website, not an official Meta, Facebook, or Instagram service.
- Do not ask visitors for passwords, login codes, 2FA codes, backup codes, or recovery codes.
- Recovery is not guaranteed. Only the platform can make final account decisions; timelines
  and outcomes vary by case.
- If a service fee applies, explain it and obtain agreement before work starts. This website
  does not promise a fixed fee or recovery timeline for all cases.
- Information users share through WhatsApp, TikTok, Facebook, or any other external service
  is governed by that provider's own privacy practices and terms.
- External destinations and actual installed-app launching should be checked on a live
  internet connection and on the target device before publishing.

UPGRADE NOTES (OCTOBER 2026)
----------------------------
- Refined the design with subtle gradients, improved card styling, and responsive spacing.
- Preserved the supplied WhatsApp, TikTok, Facebook Page, and Privacy Policy destinations.
- Made the full TikTok and Facebook cards clickable.
- Added How It Works, service-fee/result transparency, account safety, FAQ, About, Terms,
  a floating WhatsApp shortcut, and a complete footer.
- Repaired a malformed closing section tag and removed a duplicate script include.
- Local validation included HTML parse checks, CSS syntax parsing, internal anchor checks,
  destination checks, JavaScript syntax checking, and desktop/Android URL logic simulation.
  External websites and actual phone app launches still require manual live-device verification.


ADD RECOVERY PROOFS
-------------------
1. Put each real proof image inside the proofs folder.
2. Open script.js and find the recoveryProofs array near the bottom.
3. Add an object for each proof using the exact image path, title, caption, and optional date.
   Example: { title: "Account access restored", image: "proofs/account-restored.jpg", caption: "Shared with permission. Results vary.", date: "October 2026" }
4. Save, test locally, then redeploy the folder to Netlify. This is a static website;
   images added on your computer are not published until you redeploy.
5. Get permission and redact personal information before publishing any screenshot.


HEADER SHORTCUT
The Recovery Proofs button is located immediately before Privacy Policy in the top header. Tap it to jump directly to the Recovery proofs & case updates gallery.


RECOVERY PROOFS PAGE
Open proofs.html to view the standalone Recovery Proofs page. The Recovery Proofs button in the main header now opens this separate page, matching the standalone Privacy Policy page style. Add authorized image entries to the recoveryProofs array in script.js and place image files in the proofs folder.


RECOVERY PROOFS IMAGE UPDATE
- The gallery currently uses proofs/6707.jpg (the correct image supplied for this update).
- The image is displayed in full, without cropping, with an on-page watermark overlay.
- To add another image, copy it into the proofs folder and add an object to the recoveryProofs array in script.js.
- Before publishing, make sure you have permission and redact personal information that should not be public.
- Watermarks and right-click deterrents cannot prevent screenshots or all copying.
PERMANENT WATERMARK NOTE
The public proof image at proofs/6707.jpg has a repeated diagonal ARISU RECOVERY CONTACT • PUBLIC EXAMPLE watermark baked into the JPEG pixels. The original unwatermarked image is not included in this package. This discourages casual reuse but cannot prevent screenshots or guarantee that AI tools cannot remove a watermark.


Recovery proof case-label update (October 2026)
The current gallery label is “Suspended Account — 180 Days” with “Violation: Account Integrity”. The screenshot itself does not prove successful recovery, so the public caption explicitly says the outcome is not verified by this screenshot. Only change it to “Successfully Recovered” when separate reliable confirmation supports that claim and you have permission to publish it.


UPDATE: Recovery Proofs now has separate Suspended Account Section and Disabled Account Section. Add each proof in script.js with category: "suspended" or category: "disabled".


IN-APP BROWSER COMPATIBILITY UPDATE
- WhatsApp, TikTok, and Facebook links use standard HTTPS URLs.
- Removed Android intent:// redirects that can trigger "Action can’t be completed" in some in-app browsers.
- WhatsApp opens through wa.me with a prefilled message; the browser may still ask the visitor to continue to WhatsApp.
- The “Powered by Netlify” badge is not in the website HTML/CSS/JS and may be injected by the hosting/preview environment.


WhatsApp in TikTok's in-app browser
- Main WhatsApp buttons now try the consumer WhatsApp app using the whatsapp://send scheme.
- If the in-app browser blocks that scheme, use the visible HTTPS fallback link.
- A website cannot guarantee that Android opens WhatsApp Messenger instead of WhatsApp Business when the phone has Business set as the default handler. Check Android Settings > Apps > WhatsApp Business > Open by default / Set as default, clear supported-link defaults if available, and then set WhatsApp Messenger to open supported links. Menu names vary by phone.


CUSTOMER REVIEWS (Version 63)
-----------------------------
- Homepage shows three compact screenshot previews and a View All Reviews link.
- View All Reviews opens reviews.html, a separate full gallery page.
- Review screenshots are stored in the reviews/ folder.
- Replace placeholders only with genuine customer feedback shared with permission.


Version 73 update: Slightly increased the mobile card icons, headings, descriptions, buttons, and review thumbnails while keeping the four-card 2x2 collage and aligned bottom actions.


Version 74 update: Enlarged the three Customer Feedback screenshot previews on mobile so more of each screenshot is visible, while keeping View All Reviews below them and preserving the four-card collage layout.


CUSTOMER FEEDBACK PREVIEWS (VERSION 76)
--------------------------------------
- The homepage currently shows three review slots only; slots 04, 05, and 06 have been removed.
- Homepage thumbnails keep the same portrait aspect ratio as the source images, so they are not stretched or forced into an overly tall fixed box.
- Slot 01 is a reference image mentioning Pinoy Cyber Tech, not an Arisu testimonial. Slots 02 and 03 are placeholders until genuine, permission-approved customer screenshots are available.
- `reviews.html` contains the same three slots in the full review gallery.


V_92 CODE MAINTENANCE NOTES
- Synchronized CSS and JavaScript cache-busting tokens across pages.
- Added safe noopener/noreferrer attributes to external links opened in new tabs where needed.
- Added responsive media defaults, visible keyboard focus styles, hidden-state consistency, and reduced-motion support.
- JavaScript syntax checked with Node.js; HTML IDs and local asset references audited.
- Existing layout, copy, recovery flows, links, proof assets, and gradient theme were preserved.

V_94 hotfix: restored intact V_92 homepage markup and removed only the exact duplicate review disclaimer element. Avoided broad regex replacements across nested HTML. Verified key sections remain present.


V_95 SAFE MAINTENANCE NOTES
- Standardized external styles.css and script.js cache tokens across pages to prevent stale assets after deployment.
- Preserved existing page content, CSS rules, JavaScript logic, media assets, and links; no feature or layout was intentionally removed.
- Historical per-version audit text files are intentionally omitted from the release ZIP to keep the project package tidy.


V_166 DESKTOP FIRST-SCREEN UPDATE
--------------------------------
- Updated the desktop home page to match the approved reference: Daily Bible Verse banner, account-recovery badge, centered heading, WhatsApp contact card, then Contact Availability.
- The TikTok, Facebook, Recovery Proofs, and feedback content remains in the page below the initial contact area; it was not deleted or permanently hidden.
- Desktop-only rules are scoped to viewports 761px and wider. The existing mobile layout and scripts were not intentionally changed.
- Updated shared stylesheet cache-busting tokens to arc-v166 so browsers can load the new styling.
- Removed accumulated CODE_AUDIT*.txt snapshots because they are not needed to run the site.


VERSION 167 UPDATE (OCTOBER 2026)
---------------------------------
- Added Step 05: 7-Day Recovery Warranty for all successfully recovered accounts.
- Preserved the approved V_166 desktop first-screen composition and kept the mobile layout in its existing responsive flow.
- Updated the main stylesheet cache version so browsers load the new warranty styling.

VERSION 169 UPDATE (OCTOBER 2026)
---------------------------------
- Implemented the newly approved desktop layout proportions for the WhatsApp and Contact Availability cards: larger icon tiles, clearer typography, taller CTA button, and more comfortable spacing.
- Increased desktop Bible verse typography and card padding to improve readability while retaining the agreed first-screen order.
- All new layout rules are scoped to desktop widths (900px and above); mobile styling remains unchanged.
- TikTok, Facebook, and other social/proof content remain available below the contact section and are not removed.
- Updated the home-page stylesheet cache token to arc-v169.

SOCIAL LINK PREVIEW
- The public Open Graph/Twitter preview image is social-preview.jpg (1200 x 630 px).
- The HTML pages reference https://arisufix.vercel.app/social-preview.jpg?v=arc198.
- Keep social-preview.jpg at the project root when deploying so link preview crawlers can fetch it.
