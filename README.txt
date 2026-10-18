ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV224
Updated: 2026-10-18

CHANGES IN V224 — BIBLE BACKGROUND CACHE TOKEN
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
