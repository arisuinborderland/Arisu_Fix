ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV152
Updated: 2026-10-18

PROJECT CONTENTS
- index.html: Main website.
- script.js: Main interactions, local Daily Bible Verse rotation, WhatsApp link setup, and floating quick-access reminder.
- styles.css: Main responsive styles for mobile and desktop.
- desktop-layout.js: Desktop layout behavior.
- scroll-reveal.js: Scroll-triggered reveal animations.
- scroll-restoration.js: Scroll position behavior.
- reviews.html / reviews.css / reviews/: Customer reviews page and assets.
- proofs.html / proofs.css / proofs/: Recovery proofs page and assets.
- privacy.html / privacy.css / privacy-year.js: Privacy policy page and year display.
- Bible verse artwork: bible-verse-hill.png, bible-verse-hill-mobile.jpg, verse-mountains.svg.
- build.js / package.json / vercel.json: Build and deployment configuration.

DAILY BIBLE VERSE
- Uses a local, date-based rotation. No Bible API request is made.
- The current local collection contains 20 World English Bible (WEB) verses.
- This is NOT a complete 66-book Bible database or full Bible reader.
- The displayed verse is selected locally based on the date; the page refreshes the selection if it remains open across local midnight.
- The translation label is WEB. Do not label this text as ESV or KJV.
- WEB is used as the public-domain translation for this local collection.

VERSION / CACHE CHECK
- HTML asset cache-busting references use ArisuV152.
- Bible artwork cache-busting references in styles.css use ArisuV152.
- Older version names in historical CSS comments and animation keyframe names are retained where they describe the history/naming of existing styles, not active cache-busting references.
- README.txt is excluded from the public build output by build.js.

BUILD / DEPLOY
1. Use Node.js 18 or later.
2. Run: npm run build
3. The generated public site is written to dist/.
4. Deploy the contents of dist/ according to the project's Vercel configuration.

IMPORTANT
- This version updates version references and project documentation only; it does not redesign the site.
- Keep the project in one folder inside the ZIP.
- Before publishing, test the main page and the Reviews, Recovery Proofs, and Privacy Policy pages on both mobile and desktop.
