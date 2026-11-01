ARISU FIX — PROJECT README
Version: AFV369
Updated: 2026-11-01

Current release: AFV369
Package version: 369.0.0
Production hosting: Cloudflare Pages
Production site: https://arisufix.pages.dev
Source repository: https://github.com/arisuinborderland/Arisu_Fix

RELEASE NOTES
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

VALIDATION
- GitHub Actions workflow: Cloudflare Project Validation.
- The workflow runs npm test and npm run build on pushes to main and pull requests.
- Automated validation does not replace live browser checks of the deployed site and Stories Admin.
- Live browser checks are separate from GitHub Actions validation.
