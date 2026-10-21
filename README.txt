ARISU FIX — PROJECT README
Version: AFV117
Updated: 2026-10-21

## AFV117 — Separate floating icon position
- Customer Reviews only: moved the Arisu floating menu container upward by 64px above its prior bottom anchor on mobile, and set a separate desktop offset, leaving the Back to Home button at the bottom.
- Updated active cache-busting references and package version to AFV117 / 115.0.0.
- Source ZIP excludes dist/.

## AFV117 — Floating menu positioned above Back to Home on Customer Reviews
- Adjusted only the Customer Reviews page stacking: the floating shortcut icon sits above the existing Back to Home button, with safe-area-aware spacing.
- Kept the Back to Home button in its existing bottom position; aligned active cache-busting references and package version to AFV117 / 115.0.0.
- Replaced the static “Back to homepage” link with a fixed floating “Back to Home” button on reviews.html.
- The button stays visible while scrolling up or down and links directly to index.html.
- Added a home icon, keyboard focus styling, mobile safe-area spacing, and reduced-motion support.
- Kept the change limited to the Customer Reviews page and aligned active cache-busting references and package version to AFV112 / 111.0.0.
- Excluded dist/ from the source ZIP.

## AFV110 — Replace Free Web Tools with Customer Reviews
- Replaced the header Free Web Tools link with an internal Customer Reviews link to reviews.html.
- Changed its small tool icon to a star icon matching the Customer Reviews theme.
- Renamed the Customer Feedback card action from “View All Reviews” to “Customer Reviews”; it still opens reviews.html.
- Kept the existing button styling, placement, and other page content unchanged.
- Updated active HTML cache-busting references and package version to AFV110 / 110.0.0.
- Excluded dist/ from the source ZIP.

## AFV109 — Refine Screenshot 03 issue wording
- Changed Screenshot 03 issue text to “Two Factor Authentication (No Email & Number Access)”.
- Preserved the October 21, 2026 date, highlighted styling, image, lightbox, and all other layout.
- Updated active cache-busting references and package version to AFV109 / 109.0.0.
- Excluded dist/ from the source ZIP.


## AFV105 — Screenshot 02 issue details
- Replaced all reference-image caption text under Screenshot 02 with a highlighted recovery-case description: “Suspended Account (Rejected ID)” and date “August 8, 2026”.
- Updated Screenshot 02 accessible label and alt text.
- Kept Screenshot 01, Screenshot 03, screenshots, gallery layout, and lightbox behavior unchanged.
- Updated active cache-busting references and release metadata to AFV105 / 105.0.0.
- Excluded dist/ from the source ZIP.

## AFV105 — Highlight Screenshot 01 issue details
- Styled Screenshot 01 issue/date metadata as a compact soft-gradient highlight with a clear title hierarchy.
- Scoped the change to Screenshot 01 only; preserved screenshots, other cards, gallery layout, and lightbox behavior.
- Updated active cache-busting references and release metadata to AFV105 / 104.0.0.
- Excluded dist/ from the source ZIP.

## AFV103 — Move issue details to Screenshot 01
- Moved “Issue: Instagram Login Error Loop.” and “Date: Aug 22, 2026” from Screenshot 03 to Screenshot 01.
- Restored the reference-image label and explanatory caption to Screenshot 03 because it mentions Pinoy Cyber Tech, not Arisu Recovery Service.
- Updated the affected image alt text; preserved screenshots, lightbox behavior, and layout.
- Updated active cache-busting references and release metadata to AFV102 / 102.0.0.
- Excluded dist/ from the source ZIP.

## AFV100 — Add Customer Feedback Screenshot 03
- Replaced the editable Screenshot 03 placeholder with the user-provided screenshot at reviews/review-slot-3.jpg.
- Updated the gallery card to open the image in the existing review lightbox.
- Labeled the image accurately as a reference screenshot mentioning Pinoy Cyber Tech, not a testimonial for Arisu Recovery Service.
- Preserved other cards, layout, and existing AFV99 pink/purple WhatsApp light trails.
- Updated active cache-busting references and release metadata to AFV100 / 100.0.0.
- Excluded dist/ from the source ZIP.

## AFV99 — Hot Pink + Electric Purple + White Core WhatsApp light trails
- Changed only the two rotating WhatsApp button border trail colors to hot pink and electric purple with bright white cores.
- Preserved the 3px trail thickness, animation timing, glow behavior, reduced-motion support, button text, icon, link, dimensions, position, and surrounding layout.
- Updated active HTML/CSS/JS cache-busting tokens and release metadata to AFV99.
- Excluded dist/ from the source ZIP; build output is generated locally by the build process.

## AFV96 — Targeted cache-busting and internal README cleanup
- Updated six Daily Bible Verse background-image cache tokens in styles.css from AFV91 to AFV96.
- Aligned active cache-busting references across all HTML pages to AFV96.
- Updated the version/date headers in proofs/README.txt and reviews/README.txt to AFV96 / 2026-10-21.
- Updated package metadata to 96.0.0.
- Preserved the AFV95 dual cyan-blue and violet WhatsApp border animation and all layout, links, and assets.
- Excluded dist/ from the source ZIP; build output is generated locally by the build process.

## AFV95 — Dual cyan-blue and violet rotating WhatsApp button border trails
- Replaced the single mint-green comet with two contrasting light trails: cyan-blue and violet, rotating around the full button border.
- Kept the WhatsApp button text, icon, dimensions, position, destination, and surrounding layout unchanged.
- Used CSS only and retained `prefers-reduced-motion` support.
- Updated active cache-busting references and package metadata to AFV95 / 95.0.0.
- Excluded the `dist/` directory from the release ZIP; production output is generated by the build process.

## AFV93 — Dual rotating WhatsApp button border trails
- Replaced the single border trace with two separated mint-green light trails rotating around the main “Message Us on WhatsApp” button border.
- Kept the button text, icon, dimensions, placement, link behavior, and other page layout unchanged.
- Used CSS only and respected `prefers-reduced-motion`.
- Updated active HTML cache-busting references and package metadata to AFV93 / 93.0.0.


## AFV91 — Additional mobile heading size refinement
- Reduced the mobile-only “How account assistance works” heading from clamp(29px, 7vw, 37px) to clamp(22px, 5.8vw, 25px).
- Preserved the AFV90 mobile reductions for “What Services I Offer” and “Why Choose Arisu?”.
- Kept desktop typography and unrelated layout, spacing, cards, and features unchanged.
- Updated active HTML/CSS cache-busting references and package metadata to AFV91 / 91.0.0.

## AFV89 — Targeted version and CSS redundancy cleanup
- Fixed mobile header font breakpoint order: 14px/10px applies through 420px, and the subtitle reduces to 9px through 380px; broad mobile rules no longer override those sizes.
- Updated six active scenic Bible image cache-busting references to AFV89.
- Removed only confirmed redundant CSS declarations for Terms intro spacing, duplicate WhatsApp sizing rules, reduced-motion check stroke offset, and the dark-mode copy of the default verse pseudo-element background.
- Preserved distinct responsive styling and all card positioning values.
- Rebuilt and compared production output with AFV88; no public output files were added or removed.

## AFV88 — Desktop outer-card spacing
- Increased desktop-only gaps between the Why Choose Arisu section and Purpose card, Purpose and Terms cards, and Terms and About This Website cards to approximately 12px.
- Consolidated desktop positioning offsets for the three target cards to -50px and set their section top margins to 12px.
- Preserved the tablet/mobile offsets and all internal card spacing.

## AFV86 — Purpose / Terms outer spacing (desktop only)
- Aligned the Terms card vertical translation to -58px on desktop (min-width: 900px), matching the Purpose card translation and restoring the existing 6px section gap.
- Preserved the previous -64px Terms card translation for tablet/mobile widths below 900px.
- No inner card spacing, content, or unrelated card positions were changed.
- Updated active cache-busting tokens and package metadata to AFV86 / 86.0.0.

## AFV85 — Corrected desktop Services section spacing
- Removed the ineffective +24px margin rule that was overridden by the legacy #services reset. Added one high-specificity desktop-only rule setting the Services section margin-top to 18px; mobile/tablet rules and heading internals remain unchanged.
- Removed no unrelated selectors or declarations; the service heading's internal offset remains unchanged so the spacing between the heading and service cards is preserved.
- Kept tablet/mobile spacing, Customer Feedback rounded preview, and its 6px top/bottom spacing unchanged.
- Updated active HTML/CSS cache-busting tokens and package version metadata to AFV85 / 85.0.0.

## AFV83 — Desktop spacing below social showcase
- Increased the desktop-only gap between the Recovery Proofs / Customer Feedback cards and the “What Services I Offer” section by 6px.
- Kept the Customer Feedback rounded preview and its 6px internal spacing unchanged.
- Mobile and tablet spacing remains unchanged.

## AFV76 — Legacy asset tokens and redundant CSS cleanup
- Replaced six stale `AFV58` cache-busting tokens for `verse-lake-photo.jpg` with `AFV76`.
- Removed the redundant mobile-only reduced-motion override; the broader reduced-motion rule already disables animation for the same selectors.
- Removed a redundant mobile `.social-feedback-card` radius declaration because an identical global declaration later in the stylesheet applies at all viewport widths.
- Preserved responsive `.terms-security` rules and other layout declarations.
- Updated package version metadata to `76.0.0`.
## AFV72 — Legitimate card spacing
- Set the gap below the Terms & limitations paragraph and above the Legitimate Account Recovery Only card to 2px.
- Changed only the existing `.terms-intro` bottom-margin rules; preserved the legitimate card itself and all other layout values.

## AFV49 — Services heading icon adjustment
- No other layout or content changes were intended.

## AFV49 — CSS audit cleanup
- Removed two historical CSS comments describing completed cleanup actions.
- Reviewed repeated selectors and CSS cascade contexts; no exact duplicate rule groups were found, so no declarations were removed without proof of redundancy.
- Preserved current visual declarations and layout offsets.

## AFV71 — Terms outer-card bottom spacing diagnosis
- Removed the relative top offset from the inner security card so it no longer leaves a misleading visual gap at the bottom of the outer Terms card.
- Kept the existing 2px bottom padding on the outer Terms card; no other layout values intentionally changed.

## AFV109 — Raise Customer Feedback label by 4px
- Moved only the CUSTOMER FEEDBACK label upward by 4px on the reviews page.
- Left surrounding padding, description, screenshots, and other layout unchanged.
- Excluded dist/ from the source ZIP.

## AFV117 — Recovery Proofs floating controls
- Converted the Recovery Proofs “← Back to site” control into a fixed floating button, matching the Customer Reviews return-home button style and keeping it visible while scrolling on the album overview.
- Positioned the Arisu floating menu at the same elevated offset used on Customer Reviews, above the fixed Back to site button with spacing.
- Updated active cache-busting references and package version to AFV117 / 116.0.0.
- Source ZIP excludes dist/.

## AFV117 — Recovery Proofs Back to Home
- Renamed the fixed Recovery Proofs return control to “Back to Home” and added a matching inline home icon.
- Kept its existing homepage destination, fixed positioning, and floating Arisu icon placement.
- Updated active cache-busting references and package version to AFV117 / 117.0.0.
- Source ZIP excludes dist/.
