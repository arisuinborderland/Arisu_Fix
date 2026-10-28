ARISU FIX — PROJECT README
Version: AFV327
Updated: 2026-10-28

Current release: AFV327
Package version: 327.0.0
Production hosting: Cloudflare Pages
Production site: https://arisufix.pages.dev
Source repository: https://github.com/arisuinborderland/Arisu_Fix

RELEASE NOTES
- AFV326 restores a true desktop two-column layout on the homepage, gives Recovery Proofs and Customer Feedback equal fixed heights, and prevents the Reviews preview from growing vertically. Mobile behavior remains unchanged.
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
