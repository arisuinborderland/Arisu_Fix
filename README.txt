ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV228
Updated: 2026-10-18

CHANGES IN V228 — CONSERVATIVE REGRESSION AUDIT
- Audited the actual ArisuV227.zip source archive before making changes.
- No confirmed website-code regression was established by static inspection; working HTML, CSS, JavaScript, assets, and page structure were preserved without redesign.
- Updated this README and package.json version to ArisuV228 / 228.0.0 for the audited delivery.
- Static validation passed: ZIP integrity, JavaScript syntax checks, PostCSS parsing for all four CSS files, production build, and local HTML src/href reference checks.
- Production build generated 30 public files and excluded README.txt from dist.
- Desktop/mobile visual regression remains NOT VERIFIED: the headless Chromium run did not complete, so no visual-equivalence claim is made.
- Old ArisuV223 / ArisuV222 strings found in styles.css and script.js are historical comments, not active cache-busting references; left unchanged to avoid unnecessary edits.

REGRESSION AUDIT RESULTS — 2026-10-18
PASS — Source ZIP integrity
PASS — JavaScript syntax: build.js, desktop-layout.js, privacy-year.js, script.js, scroll-restoration.js, scroll-reveal.js
PASS — CSS parsing: styles.css, privacy.css, proofs.css, reviews.css
PASS — Production build
PASS — README.txt excluded from generated public dist
PASS — Local HTML src/href references (0 missing references)
PASS — Active HTML and Bible background-image cache-busting references synchronized to ArisuV228 in the final package
NOT VERIFIED — Desktop and mobile visual layout in a browser
NOT VERIFIED — Full interactive behavior in a live browser (WhatsApp navigation, menu/shortcuts, scroll reveal, and dynamic verse behavior)
NO CONFIRMED REGRESSIONS — No website-code fixes applied; avoid changing working sections without reproducible evidence.

CHANGES IN V227 — DEEPER CONSERVATIVE CSS DEDUPLICATION
- Removed 26 earlier CSS rule blocks that were exact duplicates of later rules: identical selector, declarations, importance flags, and matching at-rule context. Kept the last occurrence to preserve the effective cascade.
- Reviewed repeated selector groups separately; retained selectors with differing declarations or responsive contexts because they may be intentional overrides.
- Re-versioned active HTML and Bible background cache-busting references to ArisuV227.
- Synced package.json to 227.0.0.
- CSS parsing and production build validation are required; browser-based visual regression testing has not been performed in this package step.

CHANGES IN V226 — CONSERVATIVE CSS DUPLICATE CLEANUP
- Removed one exact duplicate .social-collage CSS rule with identical declarations in the same cascade scope.
- Checked for repeated identical declarations inside individual CSS rules; none were found.
- Updated active HTML cache-busting references to ArisuV226 and updated the five verse-lake-photo.jpg cache tokens to ArisuV226.
- Synced package.json version to 226.0.0.
- Did not merge repeated selectors with different declarations: many are later overrides that can affect responsive layouts and animation behavior.
- This is a conservative cleanup, not a full CSS rewrite; visual equivalence still requires browser-based regression testing.

CHANGES IN V225 — VERSION SYNC AND CACHE REFERENCES
- Updated active HTML cache-busting references to ArisuV225.
- Synced package.json version to 225.0.0.
- Preserved historical CSS/JS comments pending rule-by-rule regression review.
- Updated all five verse-lake-photo.jpg cache-busting query strings in styles.css from ArisuV222 to ArisuV224.
- Kept the image path and background styling unchanged; only the cache token changed.

CHANGES IN V223 — MOBILE FLOATING QUICK-ACCESS SIZE FIX
- Reduced the floating quick-access button to a compact 46px circular control on screens up to 600px.
- Preserved desktop button sizing and position.
- Respected mobile safe-area insets and retained the existing shortcut menu behavior.

CHANGES IN V222 — LEGACY TOKEN AUDIT
- Consolidated the final About This Website and Why I Built This Site style overrides into one canonical responsive block.
- Preserved the prior final spacing values across desktop, mobile, and narrow-mobile breakpoints, including the About content offset, card insets, divider spacing, and kicker size.
- Kept the warranty/process section gap fix and left the V220 footer-location rules unchanged.
- Updated active HTML cache-busting references to ArisuV221 and synchronized package.json to 221.0.0.
- Did not bulk-delete earlier shared section rules because their effects may extend to other cards and breakpoints.
- Replaced the stale ArisuV176 JavaScript comment label with ArisuV222; the comment describes CSS-driven animation behavior, not an executable version dependency.
- Updated the four verse-lake-photo.jpg cache-busting query strings from ArisuV180 to ArisuV222 after confirming the referenced local image exists.
- Updated active HTML cache-busting references to ArisuV222 and synchronized package.json to 222.0.0.

VALIDATION
- ZIP integrity checked before editing.
- CSS parser validation, JavaScript syntax checks, and production build are run before delivery.
- This is a targeted static cascade cleanup. A browser-based desktop/mobile visual regression test was not available in this run, so visual equivalence is not claimed as fully verified.

PROJECT NOTES
- The large standalone “Where We're Based” Location section was removed in V217.
- Compact location details remain in the footer: “Cavite, Philippines” and “Online assistance worldwide”.
