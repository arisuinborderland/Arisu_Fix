ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV161
Updated: 2026-10-18

PROJECT CONTENTS
- index.html: Main website.
- styles.css: Responsive styles, including the authoritative Daily Bible Verse card rules.
- script.js: Main interactions, local Daily Bible Verse rotation, WhatsApp link setup, and floating quick-access reminder.
- desktop-layout.js: Desktop layout behavior.
- scroll-reveal.js / scroll-restoration.js: Scroll animations and scroll position behavior.
- reviews.html / reviews.css / reviews/: Customer reviews page and assets.
- proofs.html / proofs.css / proofs/: Recovery proofs page and assets.
- privacy.html / privacy.css / privacy-year.js: Privacy policy page and year display.
- verse-lake-photo.jpg: Photographic mountain lake sunrise background used by the Daily Bible Verse card.
- build.js / package.json / vercel.json: Build and deployment configuration.

DAILY BIBLE VERSE
- Uses a local, date-based rotation. No Bible API request is made.
- The current local collection contains 20 World English Bible (WEB) verses.
- This is not a complete 66-book Bible database or full Bible reader.
- The displayed verse is selected locally based on the date; the page refreshes the selection if it remains open across local midnight.
- WEB is a public-domain translation. Do not label this text as ESV or KJV.
- Desktop background positioning is unchanged in V159. Mobile uses a slightly enlarged and horizontally adjusted crop to make the cross on the right more visible.
- Left/right card padding remains unchanged; vertical spacing is controlled by the final responsive CSS block.

BUILD / DEPLOY
1. Use Node.js 18 or later.
2. Run: npm run build
3. The generated public site is written to dist/.
4. Deploy the generated contents of dist/ according to the Vercel configuration.

PACKAGING AND CLEANUP
- dist/ is generated build output, not source code. It is intentionally excluded from the source ZIP so files are not duplicated. Vercel runs `npm run build` and regenerates dist/ from source.
- The ZIP contains one clean project folder. No nested dist/ copy is included.
- Obsolete verse background assets and unused review placeholder SVGs were removed after confirming they were no longer referenced.
- Before publishing, test the main page and the Reviews, Recovery Proofs, and Privacy Policy pages on mobile and desktop.
