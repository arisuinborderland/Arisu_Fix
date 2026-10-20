ARIZO FIX — PROJECT README
Version: ArizoFixV10
Updated: 2026-10-20

## Deep audit and safe optimization — 2026-10-20
- Removed two desktop-clean PNG preview assets that were hidden by the final desktop CSS override and were still fetched by the browser. Removed their now-unused HTML image elements and obsolete CSS rules. The active full-color preview images remain unchanged; estimated source payload reduction: 1,508,884 bytes (about 1.44 MiB).
- Strengthened the production build to exclude README and internal audit reports, validate local HTML/CSS asset references, and syntax-check JavaScript before accepting a build.
- Rebuilt successfully: 32 public files; no README or audit reports in `dist/`; all local references resolve; all JavaScript files pass syntax validation.
- Reviewed CSP compatibility. Kept the existing policy because the site uses JavaScript-managed inline style properties/custom properties and Google Fonts; tightening `style-src` without browser testing could break effects or typography.
- Static runtime review found no inline event-handler attributes or inline script blocks in the four HTML pages, and all statically referenced `getElementById` IDs were found in the applicable pages.
- CSS parsed successfully; 0 exact duplicate selector/context/declaration rules found. Repeated selector/context groups remain where rules may serve cascade or responsive purposes.
- Browser visual regression and interactive runtime tests remain unverified: Chromium navigation to both local HTTP and file URLs is blocked by the execution environment. No claim of visual equivalence is made.

## ArizoFixV10 — Targeted cascade cleanup
- Removed one superseded `color` declaration from the earlier `.step-card p` rule. The later same-specificity, same-context `.step-card p { color: #56657c; }` remains authoritative.
- Kept later topbar action-link color/background/shadow changes because they appear to be intentional redesign overrides, not duplicates.
- Exact duplicate full CSS rules: 0. Duplicate declarations within individual rule blocks: 0.
- Repeated selector/context groups remain; counts alone do not prove redundancy. Browser visual testing has not been performed.

## ArizoFixV8 — Safe audit pass
- Updated active cache-busting references and package metadata to ArizoFixV8.
- Rechecked the CSS draft against V7 and retained the V7 declarations rather than keeping unverified broad removals.
- Revalidated build, JavaScript syntax, local references, and ZIP integrity; browser visual testing remains pending.

Purpose
This isolated cleanup project derives from ArizoFixV6. ArisuV592.zip and earlier Arizo Fix releases remain separate rollback references.

V7 CSS cleanup
- Consolidated three adjacent duplicate-selector rule pairs into one rule each, preserving declaration order.
- Removed only consecutive, exact duplicate declarations within CSS declaration blocks.
- Updated active CSS/HTML cache-busting references and package metadata to ArizoFixV7.
- Kept repeated selectors in different media queries or separated cascade locations when merging them could change responsive styling, specificity, or source-order behavior.
- No HTML layout, image assets, JavaScript functionality, or non-target CSS values were intentionally changed.

Validation limitations
- Production build, JavaScript syntax, static local references, and ZIP integrity were checked.
- Browser-based desktop/mobile visual regression and runtime interaction tests are not included in static validation.
