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
- Three-step explanation of the assistance process.
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
2. Open the Arisu_Recovery_Contact_Simple folder.
3. Double-click index.html to open it in a browser, or serve the folder using any
   static local server (for example, VS Code Live Server).
4. Test the WhatsApp, TikTok, Facebook, and Privacy Policy links on the device where
you will publish/use the site. App opening may depend on Android, browser, and installed
app settings; regular web links remain the fallback destinations.

DEPLOY TO NETLIFY
-----------------
1. Extract this ZIP.
2. Drag the extracted Arisu_Recovery_Contact_Simple folder into https://app.netlify.com/drop,
   or deploy it through your connected Git repository.
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
