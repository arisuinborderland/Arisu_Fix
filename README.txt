ARISU FIX — PROJECT README
Version: AFV492
Updated: 2026-11-06

Current release: AFV492
Package version: 492.0.0
Production hosting: Cloudflare Pages
Production site: https://arisufix.pages.dev
Source repository: https://github.com/arisuinborderland/Arisu_Fix

RELEASE NOTES
- AFV490: restores the AFV487 same-document loading overlay while keeping loading CSS and JavaScript separate; removes the standalone loading-page redirect that could replay during browser mode switches.
- AFV489: fixes the standalone loading loop by routing /home to a generated homepage.html copy instead of /index.html, avoiding Cloudflare Pages' automatic /index.html-to-/ canonicalization from re-triggering the root loading redirect. The build generates the copy from the final header-injected homepage so both stay synchronized; adds regression coverage.
- AFV486: removes obsolete WhatsApp card CSS selectors for a removed supporting paragraph and a removed nested recommendation-label span. The current markup uses only the kicker, heading, SVG recommendation bolt, and CTA; preserves all active icon, card, button, animation, and responsive rules.
- AFV485: removes obsolete Daily Bible Verse system-theme styling, duplicate scenic-background declarations, and disabled pseudo-element rules. Preserves the approved scenic WebP card, desktop/mobile dimensions, image crop, typography, and spacing; adds focused regression coverage.
- AFV484: restores the approved homepage Account Recovery Assistance / “Let’s Connect.” card in a narrowly scoped update. Preserves the Daily Bible Verse, WhatsApp contact card, Service Status, shared Header, and all unrelated homepage sections; updates the homepage stylesheet cache key and regression test expectations.
- AFV479: applies the approved About/milestone mobile layout consistently across Homepage, Customer Reviews, Recovery Proofs, and About. Uses the official shared-header logo, places the calendar beside the creation date, keeps the description below, centers Explore My Story, and preserves the verified badge, footer cards, copyright, bottom navigation, and desktop layout, with a dedicated desktop milestone grid to prevent oversized calendar SVGs and off-center CTAs.
- AFV474: aligns the mobile logo wrapper's rounded clipping with the official circular logo image, preventing mismatched edges at browser zoom levels; preserves the 44px logo size, wordmark, subtitle, verified badge, and header layout.
- AFV473: moves the shared verified badge one additional pixel right (2px total spacing) across all five public headers; preserves vertical alignment and animation.
- AFV472: adds a consistent 1px horizontal gap between the Fix wordmark and verified badge across all five shared headers; preserves vertical alignment and badge animation.
- AFV471: makes Reviews and Proofs mobile headers match the homepage's 58px geometry, 44px logo, visible brand row, and centered verified badge; overrides legacy page-specific compression rules and refreshes CSS cache keys.
- AFV470: synchronizes release metadata with the AFV470 header-scroll.js cache token used by Reviews and Proofs; includes the Reviews/Proofs scroll-state restoration fix.
- AFV469: fixes top-edge clipping on Reviews and Proofs by allowing overflow on the shared header container, overriding the inherited page-wide .topbar overflow:hidden rule. Preserves the logo's circular crop, header geometry, and badge animation; refreshes shared-header cache keys.
- AFV468: fixes cross-page verified-badge vertical alignment by clearing inherited brand-row block padding and centering the badge against the AFV465 wordmark. Preserves badge scale, glow, and check-draw animations; refreshes shared-header cache keys across all five public pages.
- AFV467: fixes the homepage verified badge check animation by removing the mobile !important dash-offset override; adds a regression test and refreshes the homepage stylesheet cache token.
- AFV467: restores the homepage verified blue check-draw by removing the !important SVG dash-offset that blocked the keyframe animation; aligns header regression tests with the approved wordmark typography and refreshes homepage/shared-header cache tokens.
- AFV465: combines the exact loading-screen logo replacement with the approved Soft Blue-Violet Glass Pill subtitle treatment in one shared-header update.
- AFV465 refreshes shared header branding: reuses the exact transparent loading-screen logo and styles Recovery Contact as a soft blue-violet glass pill with a subtle sparkle icon. Preserves header dimensions, Arisu title, verified badge, background, divider, spacing, and other page content.
- AFV463 uses the reference's left-side light blue uniformly across the full shared header and restores a clearly visible blue bottom divider. Existing dark navy/slate brand text and all header layout remain unchanged.
- AFV463 removes the bright multicolor line beneath the shared pastel header and changes the brand name and Recovery Contact subtitle to high-contrast dark blue-gray. No header layout or dimensions changed.
- AFV463 changes only the shared header background to the reference-matched pastel blue-periwinkle-lavender gradient. Header layout, typography, logo, verified badge, and action controls remain unchanged.
- AFV460 replaces only the homepage loading-screen logo with the official Arisu Fix logo and synchronizes release metadata and the loading-screen logo cache token. Existing loading-screen dimensions, layout, animation, and all other UI are preserved.
- AFV459 isolates the homepage accordion feature and its required build, markup, accessibility, and mobile footer dependencies. It preserves the existing AFV434 main baseline and removes the retired homepage safety reminder block as requested.
- AFV434 carries the approved six-step About Process Flow onto the latest main baseline, consolidates About page styling, and removes 27 lines of retired About-specific footer selectors while preserving the shared footer and current homepage, Reviews, Proofs, and Story Viewer work.

- AFV425 removes superseded Reviews and Recovery Proofs header layout layers overridden by the later compact Flex and shared-header contracts. The active header, final action-button geometry, brand ellipsis, hover behavior, and reduced-motion handling are preserved. Reviews and Proofs stylesheet cache tokens and package release metadata are synchronized to AFV425.

- AFV424 removes the retired `.site-footer` and `.proofs-footer` CSS layers after confirming the five source pages no longer use those components. It preserves the four-page `.reference-footer`, Privacy's generic footer, and the shared header. It also removes the obsolete homepage About CTA inline styles and stale scroll-reveal target; updates affected cache tokens and regression tests.
- AFV423 fixes the desktop homepage verified badge checkmark. Root cause was a desktop-only `stroke-dashoffset: 24 !important` declaration that overrode the SVG check-draw animation and kept the white check hidden. Removed the forced offset, retained the blue badge pulse, check-draw keyframes, mobile behavior, and reduced-motion fallback.
- AFV423 cleanup: removed 153 lines of superseded header sizing, empty-rail, and page-specific button overrides from site-header.css. The approved AFV421 shared header contract and navy-indigo theme remain; obsolete desktop-header.css and homepage-header-theme.css files and references are removed from the production path. The AFV421 mobile header layout is the approved visual baseline: 58px single row, 39px profile mark, 7px logo-to-copy gap, and shared 18px verified badge.
- AFV423 fixes the homepage-only mobile header height mismatch. Root cause was a special two-row grid with an empty/hidden second action row, 2px row gap, and 6px bottom padding; this added vertical space to Home while other pages used the 58px single-row header. Home now uses the same fixed 58px single-row header and hides desktop-only header actions on mobile. Desktop homepage action links are preserved.
- AFV423 replaces duplicated public-page header markup with one build-time shared HTML component and one shared stylesheet. All five public pages now receive identical logo, verified badge, typography, spacing, theme, and responsive alignment; homepage-only action links are supplied through a dedicated slot. The static build injects the component before deployment, with no runtime header flash.
- AFV419 fixes the About/Privacy mobile header offset: their page-specific header overrides used wider 16px gutters and 10px logo-to-copy gaps than the shared public-page header. Aligns both pages to 12px/7px at standard mobile widths and 10px/7px with a 37px logo at <=380px. Updates shared header cache keys and release metadata.
- AFV418 refines About/Privacy mobile spacing and aligns their header logo, brand text, and verified badge with the Recovery Proofs reference. Privacy Policy now uses a compact icon/text grid and tighter title/date/section rhythm; About heading-to-card spacing is reduced. Desktop layout and shared badge animation are preserved.
- AFV417 removes the About-only topbar hook and legacy padding/background rules. About and Privacy now use the exact compact mobile header contract: 58px shell, 39px logo, 16px side gutters, 10px brand gap, and 34px logo below 380px. Refreshes shared theme cache keys across all five pages.
- AFV416 aligns About and Privacy mobile headers with the homepage compact header (43px profile mark, 58px minimum shell, 10px 12px 11px padding, 9px brand gap) and removes the inherited-background override so the shared navy-indigo theme remains visible. Refreshes the shared header stylesheet cache key across all five public pages.
- AFV415 removes conflicting duplicate mobile header overrides and uses one authoritative 66px About/Privacy header shell matching Home, Reviews, and Proofs. Refreshes the shared header stylesheet cache key across all five public pages.
- AFV414 restores the homepage verified check-draw animation on mobile while preserving the existing blue badge pulse, and normalizes About/Privacy mobile header dimensions and alignment to the shared header shell. Preserves AFV413 and earlier fixes.
- AFV414 restores the mobile verified check-draw animation while preserving the blue badge pulse, and explicitly normalizes About and Privacy mobile header sizing and grid alignment after page-specific styles. Refreshes the shared header stylesheet cache token across all five public pages.
- AFV413 fixes the Creation Date stacked layout, removes legacy desktop rules disabling the homepage verified check animation, restores the About mobile header hook, normalizes About/Privacy desktop header sizing, and refreshes shared stylesheet cache tokens. Preserves AFV412 and earlier behavior.
- AFV412 restores the October 14, 2026 Creation Date milestone, normalizes shared header markup and desktop sizing across all five public pages, and restores only the homepage verified check draw. Preserves AFV411 loading and AFV410 navigation/footer behavior.
- AFV411 fixes the homepage loading-screen session guard: first-paint visibility, retry after interrupted loading, and background scroll lock. Preserves AFV410 navigation/footer updates.
- AFV410 applies the Soft Curve cyan/blue/violet mobile navigation and compacts the shared footer while preserving the approved structure.
- AFV408 adds the shared navy-to-indigo header theme and soft cyan-to-violet separator across the five public pages. Includes the stylesheet in the production build and refreshes its cache token.
- AFV405 adds the shared More menu to the five public pages and includes its JS/CSS in the production build allowlist. Updates package metadata and validation expectations to AFV405.
- AFV402 replaces the homepage loading success checkmarks with cyan terminal prompts; preserves the green 200 OK badges, loading behavior, and layout.
- AFV393 updates the homepage loading bar to the Stories-style purple-magenta-cyan gradient while preserving real initialization progress and the neon glow.
- AFV391 strengthens the homepage loading bar's cyan-blue-violet neon glow and refreshes its cache token; the displayed width remains tied to real initialization progress.
- AFV390 introduces the homepage loading bar's soft cyan-blue-violet neon glow; the displayed width remains tied to real initialization progress.
- AFV389 compacts the Recovery Stories empty-state popup on mobile, reducing artwork height, card padding, heading/message spacing, and button height while preserving desktop sizing.
- AFV389 replaces the Recovery Stories empty-state mascot with the approved girl, robot, and floating story-card illustration; updates responsive sizing and cache tokens.
- AFV389 refines the Recovery Stories empty-state illustration sizing and refreshes the Story Viewer stylesheet cache token across the five Story Viewer pages.
- AFV379 shows the homepage loading overlay once per browser tab session; reloads and in-site Home navigation do not replay it.
- AFV379 adds smooth fade-in and fade-out transitions to the homepage loading overlay, with reduced-motion support.
- AFV379 switches the homepage loading bar to a minimalist pulsing neon gradient and removes the brand-assets check, leaving three initialization rows. Homepage only.
- AFV379 replaces the static gradient progress bar with a blue-purple liquid-fill bar and subtle animated wave layers. Homepage loading screen only.
- AFV379 makes the homepage loading card wider and vertically more compact to match the approved mobile reference. Homepage-only CSS adjustment.
- AFV379 replaces the inline loading-screen emblem with the dedicated transparent Arisu Fix logo asset in assets/images; preserves the approved blurred homepage overlay and reference layout.
- AFV379 matches the approved loading-screen reference more closely: detailed playing-card/AF shield energy-ring emblem, larger brand lockup, divider, four status rows, and pill-shaped status badges. Homepage-only change.
- AFV371 keeps the minimalist startup card while blurring and softly tinting the live homepage behind it. Adds an original AF/spade shield emblem beside the Arisu Fix title; homepage only.
- AFV370 smooths the homepage loading progress bar with consecutive 1% increments through 99%, then shows 100% only after initialization checks finish. The counter runs quickly without skipping displayed values.
- AFV369 improves the homepage-only terminal-style loading screen with sequential typewriter text, one-at-a-time 200 OK status lines, and an intentional 3–5 second minimum presentation. The overlay still waits for actual page load before reporting checks complete.
- AFV367 keeps the first Recovery Story image hidden until its full load completes, avoiding partial progressive rendering during cold-cache image downloads.
- AFV366 reduces the cold first-open delay for Recovery Stories by starting the Story-list request immediately after the page load event instead of waiting for browser idle time. The Stories count request remains idle-scheduled because it is not required to open the viewer.
- AFV365 adds a compact, centered glassmorphism Back to Site button for mobile and desktop, with translucent dark violet, subtle violet border/glow, and backdrop blur.
- AFV365 fixes Story progress when the operating system requests reduced motion: the essential 7-second progress transition remains visible, while only the decorative moving sheen is suppressed.
- AFV363 adds an animated purple-pink-cyan Story progress line with a subtle moving light sheen and an accessible current/total counter that updates during navigation and background refresh. Reduced-motion preferences suppress the sheen animation.
- AFV363 orders Stories oldest-first within saved sort positions. New uploads and newly published drafts receive the next sort position and appear after existing Stories; Admin drag-and-drop ordering remains supported.
- AFV361 changes Story progress fills from width transitions to left-origin transform scale animations, retaining the existing 7-second duration while avoiding layout-width changes. Refreshes Story Viewer CSS/JS cache tokens across all pages.
- AFV360 advances to the next Story on right tap and closes the viewer on the last/only Story; left tap on the first Story stays put. Rapid navigation taps are queued while a destination image loads. Progress only pauses on a 160 ms long-press, not on quick taps, and background refresh no longer rebuilds progress segments when the Story count is unchanged.
- AFV359 preconnects to Google Fonts origins and defers automatic Stories count/list API requests until after page load and browser idle time. Cached Stories count remains visible immediately; opening Stories before idle still fetches data on demand.
- AFV358 generates a delivery-sized WebP version of the Daily Bible Verse scenic banner during the production build, preloads that WebP at high priority, and updates all CSS background references to use it. The source JPEG remains unchanged; existing layout and animation behavior are preserved.
- Defers Recovery Story image downloads until the visitor opens Stories; the first image is decoded before opening, while next-Story warming and signed-URL refresh remain active. This keeps non-critical Story media out of the homepage's initial network budget.
- AFV357 preloads the Daily Bible Verse banner background image with high fetch priority and keeps the above-the-fold verse visible for first paint. Its scroll-reveal animation remains active when scrolling away and back; no CSS layout, mobile styling, Stories, Reviews, Proofs, WhatsApp, or backend behavior is changed.
- AFV356 adds a valid root-level robots.txt to the production build allowlist. It allows public site crawling and disallows the story-admin page from crawler access. Cloudflare's automatic noindex header remains intact on preview deployments.
- AFV355 generates seven responsive WebP variants from existing original images during the production build. Homepage profile, social, recovery-proof, and review images use smaller delivery files; the review lightbox loads the full-resolution WebP only when opened. The latest AFV346 Stories signed-URL caching behavior and singular WhatsApp CTA are preserved.
- AFV346 improves Story image loading by reusing recent signed URLs across reloads for up to 40 minutes, warming the first images early, and keeping the visible image in place while a renewed URL loads.
- AFV328 removes verified duplicate CSS declarations from proofs.css, story-admin.css, story-viewer.css, and styles.css while preserving the compact mobile header dimensions.
- AFV328 refreshes cache-busting tokens for the modified stylesheets; unchanged asset and historical release tokens are retained.
- AFV327 restores a true desktop two-column layout on the homepage, gives Recovery Proofs and Customer Feedback equal fixed heights, and prevents the Reviews preview from growing vertically. Mobile behavior remains unchanged.
- AFV325 fixes broken desktop Recovery Proof thumbnails by removing masking pseudo-element overlays, restoring full-source contain sizing, and keeping a 2px gap above the button. Applies to desktop homepage only.
- AFV324 extends the two Recovery Proof preview frames on desktop homepage to end 2px above the View Recovery Proofs button; mobile layout is unchanged.
- AFV323 polishes only the desktop homepage Recovery Proof thumbnails: square side-by-side previews, a restrained mask over the embedded cyan frame rails, and unchanged original proof assets / Recovery Proofs page. Mobile layout is untouched.
- AFV322 presents both desktop homepage Recovery Proof composite previews side by side at a ratio closer to their source, so the complete proof images are easier to inspect without blank gutters or extreme cropping. Mobile layout is unchanged.
- AFV321 improves the desktop homepage Recovery Proof preview legibility with taller image rows and a matched taller feedback card; the mobile layout is unchanged.
- AFV320 fills the desktop homepage Recovery Proofs preview cards with `object-fit: cover` to eliminate large blank side gutters. This intentionally crops some vertical content; the full proofs remain available by opening the Recovery Proofs page. Refreshes the homepage stylesheet cache token.
- AFV319 adds the same empty-story modal markup to the proofs, about, privacy, and reviews pages so the shared Story Viewer can render the consistent gradient empty state outside the homepage. Refreshes Story Viewer asset cache tokens to AFV319.
- AFV318 removes all empty-state decorative pseudo-element overlays that caused persistent dots and crossing lines, leaving a smooth navy-to-blue gradient with subtle radial color depth.
- AFV317 consolidates the Stories empty-state background CSS into one clean rule set, removes dotted texture entirely, and uses a smooth navy-to-blue gradient with subtle cyan light ribbons. The PR preview must be redeployed before visual confirmation.
- AFV316 removes the dotted texture from the Stories empty-state background and replaces it with a cleaner premium navy-to-blue gradient, soft cyan corner glow, and restrained flowing light accents.
- AFV315 refines the Stories empty-state background to better match the reference, reducing the full-card dot density and making corner light streaks more subtle.

- AFV314 updates the Stories empty-state background to match the blue neon reference: cyan glowing border, curved light streaks, dotted texture, and subtle blue particles. It removes the empty-state X control and updates the stylesheet cache token.

- AFV313 replaces the full-screen empty state with a compact premium modal (Option 1) inside the existing Story Viewer; normal story playback and view tracking are unchanged.

- AFV313 consolidates legacy homepage/global header CSS rules while preserving AFV313 layout and sizing. It also keeps Recovery Proofs and Customer Reviews header button dimensions match the homepage at desktop, standard mobile, and narrow-phone breakpoints; corrects the verified badge vertical offset and bumps cache keys.
- AFV313 makes Privacy Policy and About button widths on narrow phones match the homepage reference, removing conflicting legacy breakpoint sizes on proofs and reviews pages.
- AFV313 keeps the verified badge vertically centered without an artificial offset.
- AFV313 updates package and lockfile versions; no deployment was performed.
- AFV313 established the shared mobile header layout; AFV313 removes remaining content-page size discrepancies.
- Production Stories API is implemented with Cloudflare Pages Functions under functions/api/.
- Recovery Story views are deduplicated in the database by story and browser-tab session.
- Story image URLs refresh when the viewer opens; signed URLs are issued for one hour.
- Public Story uploads are limited to 3 MiB per image, matching server validation.
- Story cleanup processes up to 20 records per run to stay within Pages Functions subrequest limits.
- `.nvmrc` pins the Cloudflare build to Node.js 24; `npm test` runs the full Node test suite.
- Persist the view-session UUID immediately so mobile browsers can retain it if a view request is interrupted by a reload.
- Static public output is built through build.js using an explicit allowlist; backend code, tests, and documentation are not copied into dist/.
- The generated dist/ directory is build output and should not be included in a source ZIP.
- Obsolete Vercel API handlers and their legacy tests have been removed after review; production Story endpoints remain under functions/api/.

RELEASE NOTES
- AFV379 aligns the release version with the homepage loading-screen cache tokens and once-per-tab-session behavior.

VALIDATION
- GitHub Actions workflow: Cloudflare Project Validation.
- The workflow runs npm test and npm run build on pushes to main and pull requests.
- Automated validation does not replace live browser checks of the deployed site and Stories Admin.
- Live browser checks are separate from GitHub Actions validation.
