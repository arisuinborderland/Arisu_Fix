ARISU RECOVERY CONTACT — PROJECT README
Version: ArisuV570
Updated: 2026-10-20

ArisuV570 About This Website outer-card position update (2026-10-20): Starting from ArisuV569, changed only the existing selector `html body.home-page main > section.site-section.about-section > .about-card`, updating `translate: 0 -68px` to `translate: 0 -70px` to move the whole outer card upward by 2px. No other CSS selector or positioning rule was changed. Updated active HTML cache-busting references and package version to ArisuV570. Build, JavaScript syntax, and ZIP integrity checks performed; browser visual verification remains pending.


ArisuV569 Please Read outer-card bottom padding correction (2026-10-20): Starting from ArisuV568, changed only the mobile outer-card selector `html body.home-page main > section.site-section.terms-section > .terms-card`, reducing its effective bottom padding from 8px to 4px while preserving top padding at 2px. The previous broad selector was overridden by this more-specific mobile rule, so this corrects the actual winning declaration. Updated active HTML cache-busting references and package version. Build, JavaScript syntax, and ZIP integrity checks performed; browser visual verification remains pending.


ArisuV568 Please Read outer-card bottom spacing update (2026-10-20): Starting from ArisuV567, changed only the existing mobile Please Read card selector `html body.home-page main > section.site-section.terms-section .terms-card`, preserving top padding at 8px and reducing bottom padding from 8px to 4px (4px reduction). No other selector was modified. Updated active HTML cache-busting references and package version to ArisuV568. Build, JavaScript syntax, and ZIP integrity checks performed; browser visual verification remains pending.


ArisuV567 footer positioning update (2026-10-20): Starting from ArisuV566, changed only the footer selector `html body.home-page .site-footer` by setting its final `margin-top` to `-62px` so the footer moves upward and targets a 6px visual gap below the About This Website outer card, whose existing translate remains unchanged. No About-card or other element selector was modified. Updated active HTML cache-busting references and package version to ArisuV567. Build and syntax/integrity checks performed; browser visual verification remains pending.


ArisuV566 About This Website outer-card positioning update (2026-10-20): Starting from ArisuV565, changed only the existing authoritative CSS selector `html body.home-page main > section.site-section.about-section > .about-card`, replacing `translate: 0 -66px` with `translate: 0 -68px` to move the complete About This Website outer card upward by an additional 2px. No other CSS selector or positioning rule was changed. Updated active HTML cache-busting references and package version to ArisuV566. Build, syntax, and ZIP integrity checks performed; browser visual verification remains pending.


ArisuV565 About This Website outer-card positioning update (2026-10-20): Starting from ArisuV564, changed only the existing authoritative selector `html body.home-page main > section.site-section.about-section > .about-card`, replacing `translate: 0 -58px` with `translate: 0 -66px` to move the complete About This Website outer card upward by 8px. No other CSS selector or positioning rule was changed. Updated active HTML cache-busting references and package version to ArisuV565. Build, syntax, and ZIP integrity checks performed; browser visual verification remains pending.


ArisuV564 Please Read outer-card positioning update (2026-10-20): Starting from ArisuV563, changed only the existing authoritative selector `html body.home-page main > section.site-section.terms-section > .terms-card`, replacing `translate: 0 -58px` with `translate: 0 -64px` to move the complete Please Read outer card upward by 6px. No other CSS selector or positioning rule was changed. Updated active HTML cache-busting references and package version to ArisuV564. Build, syntax, and ZIP integrity checks performed; browser visual verification remains pending.

ArisuV563 single-card positioning fix (2026-10-20): Diagnosed that the previous V562 rule targeted `.recovery-service-card` (the inner Account Recovery service tile), not the “Arisu Recovery Contact” outer card. Starting from the V561 archive baseline, changed only `.why-arisu-section > .why-arisu-card` from `translate: 0 -56px` to `translate: 0 -50px` (6px down). All other outer-card offsets and layout rules remain byte-for-byte unchanged. Updated active HTML cache-busting references and package version to ArisuV563. Build/archive validation performed; browser visual verification remains pending.


ArisuV561 rollback (2026-10-20): Restored the previously used ArisuV559 layout and positioning after the ArisuV560 Recovery Contact adjustment caused layout problems. All prior outer-card offsets from the restored baseline are retained; no new layout adjustments were applied. Active cache-busting references and package version are aligned to ArisuV561. Browser visual verification is still required.


ArisuV557 About This Website outer-card positioning update (2026-10-20): Moved only the About This Website outer card up an additional 4px, replacing the prior authoritative translate value of -48px with -52px. No extra offset was stacked. Other card offsets remain unchanged: Account Deletion -44px, Arisu Recovery Contact -46px, Why I Built This Website -48px, and Please Read -48px. Preserved the existing horizontal centering transform and scroll-reveal behavior by using the independent translate property. Updated active HTML cache-busting references and package version to ArisuV557. Build/archive checks performed; browser visual verification remains pending.


ArisuV554 outer-card positioning update (2026-10-20): Starting from V553, moved Arisu Recovery Contact outer card up an additional 4px (cumulative -46px), Why I Built This Website up an additional 2px (cumulative -48px), Please Read up an additional 4px (cumulative -48px), and About This Website up an additional 4px (cumulative -48px). Replaced the prior final values in-place; no additional offsets were stacked. Account Deletion remains at -44px. Preserved scroll-reveal transform and responsive layout. Updated active HTML cache-busting references and package version to ArisuV554. Build/archive checks performed; browser visual verification remains pending.

ArisuV552 outer-card positioning update (2026-10-20): Raised Account Deletion, Arisu Recovery Contact / Why Choose Arisu, Why I Built This Site, Please Read, and About This Website outer cards by 40px on desktop and mobile. Removed their previous outer-card offsets (Account Deletion top -16px; Why Choose Arisu top -16px; mobile transforms on Purpose, Terms, and About cards) and replaced them with one authoritative scoped top: -40px rule. Set transform:none on the five outer cards to eliminate legacy transform offsets while preserving child-level animation/positioning. Updated active HTML cache-busting references and package version to ArisuV552. Static/build/archive checks performed; browser visual verification remains pending.


ArisuV551 Account Recovery outer-card positioning fix (2026-10-20): Raised the complete Account Recovery outer card an additional 4px, from 38px to 42px total, on desktop and mobile. Replaced the previous authoritative --arc-reveal-offset: -38px with -42px in the same single card-specific rule; removed the old value rather than stacking another offset. Audited for additional .recovery-service-card-specific top, margin, or transform positioning declarations; none found. Preserved the shared scroll-reveal animation and responsive layout. Updated active HTML cache-busting references and package version. Build and ZIP integrity checks performed; live browser visual verification remains pending.

ArisuV550 Account Recovery outer-card positioning fix (2026-10-20): Raised the complete Account Recovery outer card an additional 6px, from 32px to 38px total, on desktop and mobile. Replaced the prior authoritative --arc-reveal-offset: -32px with -38px in the single card-specific rule; did not stack a second offset. Audited the stylesheet for other .recovery-service-card positioning declarations and found no separate legacy top, margin, or transform offset on this card. Preserved shared scroll-reveal animation and responsive layout. Updated active HTML cache-busting references and package version. Build and ZIP integrity checks performed; live browser visual verification remains pending.

ArisuV548 MY SERVICES outer-card positioning fix (2026-10-20): Raised the complete rounded MY SERVICES heading card an additional 8px, from 26px to 34px total, on desktop and mobile using one final authoritative `top: -34px !important` rule. Confirmed there is only one active outer-card positioning rule; replaced the prior -26px rule rather than stacking another offset. Preserved inner heading offsets, card styling, section flow, scroll-reveal animation, service cards, and responsive rules. Updated active HTML cache-busting references and package version. Static/build/archive validation performed; live browser visual regression testing remains pending. Removed the former competing outer-card positioning block (`margin-top: -16px`, `top: -14px`, `transform: none`) and the desktop override that reset `top` to `0`, so the new offset cannot be cancelled by those stale rules. Preserved inner heading offsets, card styling, section flow, scroll-reveal animation, service cards, and responsive rules. Updated active HTML cache-busting references and package version. Static/build/archive validation performed; live browser visual regression testing remains pending.
ArisuV546 social collage positioning fix (2026-10-20): Raised TikTok, Facebook Page, Recovery Proofs, and Customer Feedback by 26px using one authoritative --arc-reveal-offset rule on the four card elements. Removed no unrelated layout spacing or reveal behavior; the existing scroll-reveal transform consumes the variable. Audited for competing top/translate/transform offset rules on these cards; none were retained as a second offset. Updated active cache-busting references and package version. Build, syntax, local-reference, and ZIP checks performed; live browser visual regression testing remains pending.
ArisuV545 divider positioning fix (2026-10-20): Replaced the ineffective relative top offset with the independent CSS translate property (translate: 0 -26px), which composes with the shared transform-based scroll-reveal animation. Kept the divider's existing margins, social-card flow, and responsive layout unchanged. Updated active cache-busting references and package version. Build and archive checks performed; live browser visual regression testing remains pending.
ArisuV543 Scam Awareness adjustment (2026-10-20): Lowered the card by 6px relative to ArisuV542. The single authoritative --arc-reveal-offset changed from -32px to -26px, leaving the card 26px above its baseline rather than 32px. Preserved scroll-reveal animation, card dimensions, section spacing, responsive layout, and interactions; no additional card-specific transform override was added. Updated active HTML cache-busting references and package version. Static/build/archive checks performed; live browser visual regression testing remains pending.
Change: Scam Awareness card keeps a verified 16px upward offset through scroll-reveal animation; final high-specificity variable rule removes ambiguity from older positioning rules.
ArisuV540 Scam Awareness positioning fix (2026-10-20): Preserved the requested 16px upward offset and made it survive the shared scroll-reveal transform by setting --arc-reveal-offset: -16px on the card. The reveal animation remains enabled; no parent section spacing, card dimensions, or other card content was changed. The old card-specific translateY(-8px) !important override remains removed. Updated active HTML cache-busting references and package version. Static/build/archive checks performed; live browser visual regression testing remains pending.
ArisuV539 Scam Awareness card positioning cleanup (2026-10-20): Raised only the Scam Awareness card by 16px using a single transform declaration in its base .scam-awareness-card rule. Removed the stale high-specificity !important transform override (previously translateY(-8px)); retained responsive sizing/spacing rules and the separate parent social-section spacing because it controls the wider section, not the card transform. Updated active HTML cache-busting references and package version. Static/build/archive checks performed; live browser visual regression testing remains pending.
ArisuV538 Service Status card bottom-spacing update (2026-10-20): Reduced the panel bottom edge by 8px. Desktop bottom padding changed from 16px to 8px; mobile bottom padding changed from 7px to 0px and the final benefit row uses a -1px bottom margin to achieve an 8px total card-height reduction. Preserved the top edge, SERVICE STATUS label, Online/Offline pill, and content positioning. Added final scoped CSS rules after auditing earlier base/mobile padding declarations; older values remain as baseline but are intentionally superseded by the final high-specificity rule. Updated active HTML cache-busting references and package version. Static/build/archive checks performed; live browser visual regression testing remains pending.
ArisuV537 Service Status label-only adjustment (2026-10-20): Lowered only the SERVICE STATUS text by 1px from V536, changing its dedicated transform from translateY(-8px) to translateY(-7px) (7px total upward offset). The Online/Offline pill, Service Status card, and all other content remain unchanged. Updated active HTML cache-busting references and package version. Static/build checks performed; live browser visual regression testing remains pending.
ArisuV530 Service Status positioning update (2026-10-20): Applied an additional translateY(-4px) to the Service Status card, making the cumulative transform -8px from the V528 baseline. Kept the existing top offsets and responsive rules unchanged. Removed generated dist/ from the deliverable ZIP. Static checks performed; live browser visual regression testing remains pending.
ArisuV528 Service Status positioning and archive cleanup (2026-10-20): Raised the Service Status card an additional 4px on desktop and mobile. Consolidated its vertical offset into one final authoritative responsive rule (desktop top: -8px; mobile top: -10px, preserving the prior mobile-only 2px offset), and removed the older mobile margin-top positioning rule that could compound the offset. Audited relevant Service Status positioning selectors and retained unrelated spacing/layout rules. Removed generated dist/ from the deliverable ZIP; build.js remains responsible for recreating it during builds. Updated active HTML cache-busting references and package version. Static/build checks performed; live browser visual regression testing remains pending.
ArisuV527 WhatsApp alignment update (2026-10-20): Raised the WhatsApp CTA by an additional 4px (8px cumulative from the ArisuV525 baseline) and shortened only the outer card bottom edge by an additional 4px. Added a scoped mobile compensation so the card also becomes 4px shorter there without negative padding. Preserved the card top edge, side spacing, content, responsive behavior, and interactions. Updated active HTML cache-busting references and package version. Static/build validation performed; live desktop/mobile browser visual regression testing remains pending.
ArisuV525 maintenance fix (2026-10-20): Removed the duplicate ArisuV524 WhatsApp changelog entry, aligned the Daily Bible Verse background image cache-busting tokens with ArisuV525, and made legacy CSS implementation comments version-neutral. Preserved the existing WhatsApp message, visual declarations, selectors, breakpoints, layout, and interactions. Static/build validation passed; live desktop/mobile browser regression testing remains pending.
ArisuV524 WhatsApp message update (2026-10-20): Set the pre-filled WhatsApp message to the latest exact wording supplied by the user, with blank lines around the website URL. Preserved the WhatsApp number, URL construction, button behavior, and layout. Updated active HTML cache-busting references and package version.
ArisuV522 WhatsApp message update (2026-10-20): Simplified the pre-filled WhatsApp message as requested. It credits the Arisu Fix website, includes the website URL, and ends after the account-recovery inquiry. Preserved WhatsApp number, link generation, button behavior, and layout. Updated active cache-busting references.
ArisuV521 WhatsApp message update (2026-10-20): Replaced the generic pre-filled WhatsApp message with a friendlier introduction that credits the Arisu Fix website, includes the website URL, and asks for guidance on the next steps. Preserved the WhatsApp number, URL construction, button targets, and all existing layout and interaction behavior. Updated active HTML cache-busting references and package version. Static validation passed; browser visual regression testing remains pending.
ArisuV520 targeted header Glassmorphism update (2026-10-20): Applied a restrained pearl-glass treatment to the existing Recovery Proofs and Free Web Tools header buttons. Preserved labels, destinations, click behavior, sizing, spacing, responsive breakpoints, and header layout. Added accessible focus styling, subtle hover/press feedback, and reduced-transparency/reduced-motion support. Updated active HTML cache-busting references and package version. Static validation passed; browser visual regression testing remains pending.
ArisuV519 selective floating-menu CSS cleanup (2026-10-20): Removed the earlier Aurora panel visual block superseded by the later Option 5 3D Glass Card rule, and removed the base menu-item background, border, and shadow declarations superseded by the Option 5 rule. Preserved geometry, widths, alignments, icon styling, mobile breakpoints, transitions, orb animation, reduced-motion behavior, and JavaScript interactions. Updated active HTML cache-busting references and package version. Static validation passed; browser visual regression testing remains pending.
ArisuV518 floating-menu design (2026-10-20): Applied selected Option 5 3D Glass Card styling to the floating shortcut panel and rows only. Preserved menu dimensions, mobile breakpoint sizing, icon colors, link targets, open/close logic, and floating orb animation. Updated active HTML cache-busting references and package version. Static checks passed; browser visual regression testing remains pending.
ArisuV517 Service Status indicator relocation (2026-10-20): Moved the animated status circle from beside SERVICE STATUS into the Online/Offline pill, immediately before its text. Preserved the existing Philippine-time availability logic, green/red state classes, pulse and reduced-motion behavior. Updated cache-busting references and package version. Static checks passed; browser visual regression testing remains pending.
ArisuV515 conservative CSS cleanup (2026-10-20): Removed one empty malformed max-width: 600px media-query block containing no declarations and removed one exact duplicate floating WhatsApp reduced-motion rule. Preserved all non-empty layout declarations, selector order, breakpoints, and animation definitions. Updated active HTML/CSS cache-busting references and package version to ArisuV515; made one old JavaScript comment version-neutral. Build and static checks passed; browser visual regression testing remains pending.
ArisuV514 legacy version-reference audit (2026-10-19): Reviewed live source files for version labels at or below ArisuV512. Removed the stale V_135 comment label in script.js and replaced V101/V112 suffixes in CSS animation identifiers with version-neutral names, updating all corresponding animation declarations and keyframes together. This is an identifier-only change; animation timings, properties, selectors, and behavior are unchanged. Historical version references in README.txt are intentionally retained as changelog history. Build and static validation passed; browser visual regression testing remains pending.
ArisuV513 README cleanup (2026-10-19): Removed two exact duplicate copies of the ArisuV440 MY SERVICES subtitle changelog entry, retaining the first occurrence and preserving the rest of the historical changelog. Similar generic validation-summary lines in different release-summary sections were retained because they belong to separate historical entries. No site HTML, CSS, JavaScript behavior, or layout rules were changed; browser visual regression testing remains pending.
ArisuV512 targeted cascade audit (2026-10-19): Reviewed winning declarations for Service Status, social collage, WhatsApp feature card, and floating WhatsApp icon. No !important declarations were removed because no safely redundant same-selector, same-context, same-property, same-importance duplicates were proven in those target groups. Removed one provably overridden non-important width declaration from the services heading base rule (later same-selector base rule sets width to min(100%,1100px)). Layout-affecting !important rules and responsive overrides were preserved. Browser visual regression testing remains pending.
ArisuV511 CSS selector audit (2026-10-19): Reviewed repeated selectors across stylesheet rule contexts. Repeated selector text alone is not proof of redundancy; declarations are spread across different properties, responsive breakpoints, and cascade overrides. No exact duplicate declarations with the same selector, at-rule context, property, value, and importance were found, so no CSS declarations were removed. This is a conservative audit-only release; browser visual regression testing remains pending.

ArisuV510 maintenance (2026-10-19): Removed the stale ArisuV327 version label from the header-scroll.js comment, keeping the comment version-neutral. Updated active source cache-busting tokens and package version to ArisuV510. No runtime JavaScript logic or CSS layout rules were intentionally changed. Build and static validation passed; browser visual regression testing remains pending.

ArisuV508 audit (2026-10-19): Removed 15 empty CSS rule blocks from styles.css, including unused placeholders affecting the social collage, Recovery Proofs, Daily Bible Verse, WhatsApp card, and Why Arisu sections. Empty blocks contained no declarations and had no visual or cascade effect. Kept non-empty visual overrides and their order unchanged; no selectors, declarations, breakpoints, or animation rules were consolidated. Build/syntax/ZIP checks passed; browser visual regression testing remains pending.
ArisuV508 Service Status audit (2026-10-19): Consolidated two adjacent max-width: 600px Service Status CSS blocks into one media query, preserving the exact declaration order and values. Kept the mobile margin-top: -2px and separate top: -4px positioning rules because they control distinct properties; kept the desktop width/flex rules and 850px/560px responsive layout rules unchanged. CSS parsing/build checks passed; browser visual regression testing remains pending.

ArisuV506 audit (2026-10-19): Removed 37 earlier !important declarations only where the exact same selector, property, and at-rule context had a later !important declaration that wins the cascade. No unique declarations, selectors, breakpoints, or layout values were changed. CSS parsing and build checks passed; browser visual regression testing remains pending.
ArisuV505 audit (2026-10-19): Removed the obsolete WhatsApp-card pulse block that was fully superseded by the later static-icon rules; the separate floating WhatsApp pulse remains intact. Removed version-specific labels from the floating-pulse comments. Confirmed the mobile-only pulse overrides the base pulse only at max-width 767px; reduced-motion rules remain in place. Service Status override audit completed: retained the existing responsive rules and the required mobile margin-top: -2px rule because the later overrides target different properties and consolidation without browser comparison could change the cascade. Confirmed .faq-list CSS has no matching markup in the four HTML pages and no script-generated FAQ elements; dormant FAQ CSS is retained for this conservative pass. README history is retained; no visual browser regression test was performed.

ArisuV504 update (2026-10-19): Removed the generated dist/ directory from the delivered ZIP package. Source files and build configuration are retained; no layout or styling rules were changed.
ArisuV504 update (2026-10-19): Cleaned old version identifiers from CSS comments while preserving useful implementation notes. CSS declarations, selectors, media queries, and layout behavior were not changed.
ArisuV501 update (2026-10-19): Removed the unused FAQ accordion JavaScript helper after confirming no FAQ markup exists in the included HTML pages and no other script generates .faq-list details. Kept dormant FAQ CSS unchanged to avoid broad stylesheet cleanup. Updated active cache-busting references and package version. Layout and animation behavior otherwise unchanged.
ArisuV500 audit fix (2026-10-19): Aligned CSS background-image cache-busting tokens and all active HTML asset cache tokens to ArisuV500; corrected the WhatsApp-card animation changelog entry to ArisuV496; removed the stale embedded V480 README header. ArisuV499 mobile-only floating pulse behavior is unchanged.
ArisuV498 update (2026-10-19): Removed the blue check badge from the “ACCOUNT RECOVERY ASSISTANCE · EST. 2018” banner only. Preserved the green status indicator, header verification badge, layout, spacing, and animations.
ArisuV497 update (2026-10-19): Slightly reduced the floating shortcut pulse intensity by softening the expanding ring, reducing its maximum scale, and lowering the green halo. The floating shortcut remains animated; other layout and animations are unchanged.
ArisuV496 update (2026-10-19): Removed the pulse/ring and animated halo from the WhatsApp card icon only. Preserved the static green WhatsApp tile, icon, card layout, and separate floating WhatsApp animation.
ArisuV495 update (2026-10-19): Restored the Recommended badge to the original static green lightning bolt on a light-cyan pill. Removed icon animation; preserved badge placement, card layout, and other animations.

ArisuV489 update (2026-10-19): Reduced the Suspended Accounts and Disabled Accounts preview labels to compact, small-font highlighted badges with restrained blue/red accents. Preview image dimensions and card layout are unchanged.
ArisuV487 update (2026-10-19): Corrected the MY SERVICES outer card on desktop only by resetting its negative top offset and negative top margin at min-width 701px, so it sits below rather than overlapping the preview cards. Mobile positioning is unchanged.
ArisuV486 update (2026-10-19): Restored the desktop width values from the last known baseline (V482) after the broad width increases in V483–V485 caused the preview cards and services section to appear shifted/undersized relative to the content. No mobile CSS rules were changed in this correction. Updated shared HTML cache-busting references and package version.
ArisuV482 update (2026-10-19): Raised the outer “WHY I BUILT THIS SITE,” “PLEASE READ,” and “ABOUT THIS WEBSITE” cards by 16px on desktop and mobile using scoped relative top offsets. Preserved internal card spacing and all other sections; updated HTML CSS/JS cache-busting references and package version.
ArisuV481 update (2026-10-19): Raised only the complete ARISU RECOVERY CONTACT / WHY CHOOSE ARISU card by 16px on desktop and mobile using a scoped relative top offset. Card content, internal spacing, and other sections remain unchanged. Updated the HTML asset cache-busting references and package version.
ArisuV460 update (2026-10-19): Moved only the MY SERVICES rounded pill 4px farther down (existing top offset changed from 4px to 8px); did not move the outer services card or alter the heading text offsets.
ArisuV459 update (2026-10-19): Adjusted the existing authoritative MY SERVICES outer-card position from top:-6px to top:-14px (8px further up); no duplicate positioning rule added. Preserved pill +4px and text -2px offsets.

ArisuV450 update (2026-10-19): Removed the decorative line above MY SERVICES and placed the complete services heading and intro copy inside a subtle rounded card; scoped styling for desktop and mobile.
ArisuV450 update (2026-10-19): Lifted only the Scam Awareness Reminder card by 4px using a targeted selector; preserved card dimensions, surrounding layout, and responsive rules.
ArisuV448 update (2026-10-19): Fixed the Service Status JavaScript initialization error by removing an undeclared variable from its element guard; the live Philippine clock and automatic availability updates remain enabled. The “Auto-updated” label remains removed.
ArisuV446 update (2026-10-19): Removed the Service Status description sentence and removed “Auto-updated” from the Philippine time label; preserved the live clock and status functionality.

ArisuV446 update (2026-10-19): Applied a soft Aurora Gradient Glass background to the floating menu panel only; preserved menu items, icons, size, spacing, and positioning.
ArisuV443 update (2026-10-19): Applied Premium Glass styling to the WhatsApp contact card with a soft white translucent gradient, subtle border and shadow, refined WhatsApp-green icon and CTA, and muted blue recommendation badge. Existing card geometry, content, and responsive layout are preserved.

ArisuV440 update (2026-10-19): Removed the “Get in touch with me for account recovery assistance.” subtitle under MY SERVICES only; surrounding layout and spacing were left unchanged.



ArisuV440 update (2026-10-19): Removed the dark rectangular gradient panel and tile shadow from Suspended/Disabled preview labels; preserved label readability with text-shadow only.
ArisuV440 update (2026-10-19): Removed the arrow glyphs from the TikTok and Facebook Page buttons; refined icon-to-label spacing and alignment for a balanced button layout.

ArisuV440 update (2026-10-19): Raised only the home-page Recovery Proofs button by a further 1px (translateY -7px total). Other buttons, preview images, and layout rules remain unchanged.

ArisuV440 update (2026-10-19): Raised the four social-collage outer cards (TikTok, Facebook Page, Recovery Proofs, and Customer Feedback) by 4px using relative positioning, preserving internal preview and button offsets.

ARISUV435 RELEASE SUMMARY — 2026-10-19
- Moved only the Disabled Accounts preview tile an additional 2px upward (4px upward total from the prior V427 baseline); other preview/card/button spacing remains unchanged.
- Kept the preview tile/label geometry, outer Recovery Proofs card, action button, links, and all other sections unchanged.
- Updated active HTML cache-busting references and package version to ArisuV438.
- Static file and archive validation performed; live browser visual regression was not run.


ARISUV422 RELEASE SUMMARY — 2026-10-19
- Lowered only the TikTok, Facebook Page, and Recovery Proofs image-preview areas by 6px relative to ArisuV421; Customer Feedback preview and all other layout elements remain unchanged.
- Used narrowly scoped transforms on the three preview containers to avoid changing card flow, sizing, buttons, or links.
- Updated active HTML/CSS cache-busting references and package version to ArisuV424.
- Static validation performed; browser visual regression still requires live rendering on mobile and desktop.

- Lifted only the TikTok and Facebook preview areas an additional 2px by changing their top margin from 2px to 0px.
- Kept Recovery Proofs and Customer Feedback preview spacing unchanged at 2px; other layout, images, buttons, links, and card structure are preserved.
- Updated active HTML/CSS cache-busting references and package version to ArisuV421.
- Static validation performed; browser visual regression still requires live rendering on mobile and desktop.

ARISUV420 RELEASE SUMMARY — 2026-10-19
- Removed the TikTok, Facebook Page, Recovery Proofs, and Customer Feedback heading rows from the home-page social collage, including their decorative arrows.
- Moved the top of all four preview areas to a 2px inset from each outer card's border, while preserving side/bottom spacing, preview assets, CTA buttons, and links.
- Updated active HTML/CSS cache-busting references and package version to ArisuV420.
- Static validation performed; browser visual regression still requires live rendering on mobile and desktop.

ARISUV419 RELEASE SUMMARY — 2026-10-19
- Lowered only the “FASTEST CONTACT METHOD” label by 2px using a final CSS override.
- Preserved all other layout and content.

ARISUV417 RELEASE SUMMARY — 2026-10-19
- Conservative maintenance based on ArisuV416; no intentional layout redesign or component sizing change.
- Removed eight verified same-selector/same-media duplicate declarations, keeping the later identical declarations that determine the cascade.
- Removed seven empty CSS rule/media-query blocks left by earlier edits; no active declarations were removed from those blocks because they contained none.
- Aligned active cache-busting tokens across all four HTML pages to ArisuV419.
- Removed one duplicated ArisuV389 changelog paragraph and corrected stale CSP/testing documentation.
- Validation: archive integrity, build, CSS/JavaScript syntax, local references, version tokens, and duplicate IDs checked. A full browser visual regression was not completed; verify desktop, tablet, and mobile before deployment.


ArisuV412 update: audited the TikTok and Facebook title-divider overrides. Removed the competing head-level and heading pseudo-elements, then made each 1px divider the h3 bottom border with 2px bottom padding so it follows the title position. Decorative arrows remain hidden on mobile. Browser rendering still needs visual confirmation.

ArisuV404 update: corrected mobile CTA typography by separating the left icon from label sizing. The document and star icons are anchored independently; labels use a full-width flex area with 13px type and normal wrapping, preventing inherited flex sizing from squeezing text. Both buttons remain 48px tall and full-width within their existing content areas. Preview images, outer cards, and unrelated sections are unchanged. Browser rendering still needs visual confirmation.

ArisuV399 update: lifted the mobile View All Reviews button by an additional 2px (translateY -6px to -8px). No preview image, preview container, outer card, or desktop layout rules were intentionally changed in this update.

ArisuV399 update: lifted the mobile View All Reviews button by 6px only. The V395 preview image and its bordered container remain unchanged.

ArisuV389 adjustment: reduced the actual bordered Customer Feedback preview card height by 6px at the bottom on mobile, using a targeted card-level rule. The View All Reviews button dimensions and normal-flow position are preserved. Existing Recovery Proofs and other layout rules are unchanged. Static ZIP integrity checked; live browser rendering not performed.

ArisuV395 adjustment: increased the outer Customer Feedback preview card height by 4px at the bottom (reversing part of the previous 20px reduction), and extended the actual review preview image by a further 6px at the bottom on mobile. The View All Reviews button remains unchanged.

ArisuV389 maintenance: reduced the actual layout gap between the Customer Feedback preview and View All Reviews button by 6px by changing its mobile margin-top from 2px to -4px. Preserved the existing transform and button dimensions; other card layout and desktop rules retained. Live browser rendering not performed.


ArisuV389 maintenance: raised both action buttons by 2px, moved the heading divider up 2px, lifted the entire Recovery Proofs content by 2px, and removed its decorative heading arrow. Preserved the 2px heading-to-preview spacing, card dimensions, links, and other sections. Static checks completed; live browser rendering not performed.

ArisuV389 maintenance: removed the conflicting high-specificity mobile flex/nowrap button override; consolidated Recovery Proofs button layout with explicit grid columns and important declarations. Set both Recovery Proofs and Customer Feedback cards to 8px top padding (2px tighter than V371), kept 2px preview spacing, and preserved all links and other sections. Static checks completed; live browser rendering not performed.
ArisuV367 adjustment: tightened mobile Recovery Proofs and Customer Feedback headings toward the card top, retained 2px spacing above preview images, moved the document icon toward the right side of the Recovery Proofs button, and changed its arrow to the diagonal ↗ style used by View All Reviews. Other layout sections and destinations preserved. Visual browser regression testing has not been performed.


ArisuV367 social card adjustment: removed TikTok and Facebook icons from the card headers and placed matching icons inside their respective profile buttons. Card headings now use text only; preview images have a 2px top spacing adjustment. Existing destinations, screenshots, buttons, and other site sections are preserved. Static ZIP checks completed; visual browser regression testing has not been performed.

ArisuV367 safe CSS cleanup: removed two ineffective #contact-descendant selectors for #serviceStatus after confirming the card is a sibling of #contact in index.html. Preserved the single mobile-only #serviceStatus positioning rule at margin-top: -2px. No intended visual change beyond the existing 2px lift.

ArisuV367 mobile adjustment: lifted the Service Status card by 2px. Removed older conflicting mobile margin-top overrides and replaced them with one direct ID selector; unrelated styles preserved.

ArisuV367 mobile spacing adjustment: lifted the outer PLEASE READ / Terms & limitations card by 4px on screens up to 640px; internal padding and desktop layout are unchanged.
ArisuV367 mobile spacing adjustment: reduced the bottom padding of the main Why Choose Arisu outer card by 8px (10px to 2px) on screens up to 640px; top and horizontal padding and desktop layout are unchanged.
ArisuV367 mobile spacing adjustment: reduced the outer bottom spacing after the Remember safety card by 8px on screens up to 640px; internal card padding and top spacing are unchanged.
ArisuV367 mobile spacing adjustment: reduced only the Remember: Keep Your Account Safe card top and bottom padding by 4px (12px to 8px) on screens up to 640px. Horizontal padding, desktop spacing, icon, typography, borders, and surrounding layout remain unchanged.
ArisuV367 mobile spacing adjustment: reduced the Clear guidance / Honest expectations note card top and bottom padding by another 2px (9px to 7px) on screens up to 640px. Horizontal padding, desktop spacing, typography, icon, borders, and surrounding layout remain unchanged.
ArisuV367 mobile spacing adjustment: reduced the Clear guidance / Honest expectations note card top and bottom padding by 2px (13px to 11px) on screens up to 640px. Horizontal padding, desktop spacing, typography, icon, borders, and surrounding layout remain unchanged.

ArisuV367 scroll-performance refinement: removed the broad mobile scroll-time animation pause selector that applied to every element and pseudo-element. The pause now targets only the floating WhatsApp decoration, and sticky-header blur is reduced while scrolling on mobile to lower compositing work. Scroll-reveal animation behavior and layout declarations are preserved. Validate scrolling on the deployed preview across mobile and desktop before treating performance as confirmed.

ArisuV367 maintenance audit: removed only CSS rules whose declarations were all superseded later by declarations for the exact same selector and media/support context, with equal or higher !important priority. This is a conservative cascade cleanup; final winning declarations were retained. CSS parser, JS syntax, build, and ZIP checks are required. Browser visual regression was not independently available.


ArisuV367 CSS cascade cleanup (preserve-first): Removed three earlier exact duplicate mobile declarations from styles.css where the same selector, media context, and declarations appeared again later. The later declarations remain in place, preserving the final cascade result.
ArisuV367 CSS refactor (preserve-first): Removed eight empty media-query blocks from styles.css. No style declarations or selector order were intentionally changed. Repeated selectors and !important rules were retained where their cascade role has not yet been proven redundant. Browser visual regression testing status was later reported by the user as passed; this was not independently reproduced during the V329 maintenance pass.
V325: Corrected the project folder name to match the release ZIP, refreshed active cache-busting tokens, and cleaned the build/deployment instructions. Audited the header CSS cascade and retained the existing scoped final overrides to avoid broad layout changes. CSP remains Report-Only pending compatibility testing.
V322: Added smart hide-on-scroll header behavior across pages: the sticky header hides while scrolling down, reappears on upward scroll, stays visible at the top, and respects reduced-motion preferences. Added thresholding and requestAnimationFrame scheduling to reduce jitter; preserved page layout and other features.

V321: Applied the Aurora Glass header gradient (soft blue → lavender → blush pink) with a subtle border and shadow; preserved header layout, buttons, and page sections. Updated active cache-busting tokens and package version.


V319: Raised the header Privacy Policy button by 2px using a scoped transform; other header elements are unchanged.

V318: Increased the “A CLEAR PROCESS” heading font size by 2px on mobile only; desktop sizing unchanged.

ArisuV367 conservative maintenance: removed 19 empty CSS at-rule blocks and 564 earlier declarations superseded by later declarations for the same selector, property, and at-rule context with equal or higher !important priority. No selector order or surviving declaration values were intentionally changed. Bumped active cache-busting tokens and package version. Build, syntax, and archive checks required; browser visual regression is not independently available in this environment.

ArisuV367 security/deployment review: retained Content-Security-Policy-Report-Only; do not switch to enforcing CSP until the deployed preview is tested in a browser. The current JavaScript updates CSS properties dynamically, so enforcement must be checked against scroll reveals, review lightbox, and image-interaction behavior. Confirm response headers on the deployed preview and run mobile/desktop visual regression before production. Active HTML cache-busting tokens and package version updated to ArisuV367. No visual CSS declarations or page content intentionally changed.

PROJECT OVERVIEW
Arisu Recovery Contact (branded on the site as Arisu Fix | Recovery Contact & Assistance) is a static, responsive website that presents account-recovery assistance information, official contact routes, safety guidance, customer feedback, and supporting site pages.

MAIN WEBSITE FEATURES
- Home page (index.html): introduction, service status, scam-awareness reminder, social profile previews, recovery proofs and customer feedback links, service categories, account-assistance process, safety guidance, site purpose, terms and limitations, and contact information.
- Account Recovery Assistance: describes legitimate account recovery support and common account-access issues. Assistance is intended for the account owner or an authorized administrator; it does not offer hacking, password bypassing, or unauthorized access.
- Daily Bible Verse: displays the site's daily verse feature and associated visual presentation.
- Social destinations: includes TikTok and Facebook Page previews/links. Verify the published links before changing official account destinations.
- Recovery Proofs (proofs.html): separate page for recovery-related proof images stored under proofs/.
- Customer Feedback (reviews.html): separate page for customer feedback content and its supporting assets under reviews/.
- Privacy Policy (privacy.html): separate privacy-information page with its own stylesheet and dynamic year helper.
- Responsive presentation: shared styles plus targeted layout and scroll behavior scripts support mobile and desktop layouts. Changes should be tested at both viewport sizes.

IMPORTANT PROJECT FILES
- index.html — main landing page and primary page content.
- privacy.html / privacy.css — privacy page and page-specific styling.
- proofs.html / proofs.css — recovery proof gallery and styling.
- reviews.html / reviews.css — customer feedback page and styling.
- styles.css — shared site styling, responsive rules, and visual components.
- script.js — primary interactive site behavior.
- desktop-layout.js — desktop-specific layout behavior.
- scroll-reveal.js — scroll reveal/animation behavior.
- scroll-restoration.js — scroll position/restoration behavior.
- privacy-year.js — dynamic year behavior on the privacy page.
- verse-lake-photo.jpg — background image used by the Bible verse design.
- favicon.* and apple-touch-icon.png — browser and device icons.
- social/profile preview images — visual assets used by the site.
- proofs/ and reviews/ — image assets for the proof and feedback pages.
- package.json — project metadata and build command.
- build.js — copies deployable site files into dist/ and verifies that README.txt files are excluded from public output.
- vercel.json — Vercel configuration and response/security headers. The Content-Security-Policy is enforcing; re-test required resources and response headers when changing it.
- .vercelignore — Vercel ignore configuration.

BUILD AND DEPLOYMENT
Requirements: Node.js 18 or newer.
1. Extract the ZIP and open a terminal in the ArisuV367 project folder.
2. Run: npm run build
3. The build output is generated in dist/.
4. Deploy the contents of dist/ to the static hosting target, or configure Vercel so the project build output directory is dist/.
5. README.txt and development/build configuration files are intentionally excluded from dist/ so internal documentation is not published as website content.

MAINTENANCE RULES
- Keep this README in the source project; do not publish it in the public website output.
- For each release, update the version and date above and align active cache-busting version tokens across HTML, CSS, JavaScript, and referenced background images. Keep historical CSS comments when they document earlier changes; do not treat comments alone as active overrides.
- Keep the ZIP structure clean: one top-level project folder only, with no generated dist/ folder included in the source ZIP.
- The shared stylesheet contains accumulated rules that may interact with later overrides. Consolidate repeated selectors only after checking media-query context, specificity, source order, and visual regression risk.
- After edits, run the build, check JavaScript syntax, verify ZIP integrity, and inspect the site at mobile and desktop widths. Static checks do not replace visual regression testing in a browser.
- Keep security headers and enforcing CSP changes under compatibility review; confirm deployed response headers and retest resources when the policy changes.

RELEASE NOTES — ARISUV305
- Restored the missing README project descriptions, feature inventory, file map, build/deployment notes, and maintenance checklist.
- Preserved the V304 website implementation and the mobile-only two-column account-recovery issue-list styling; this documentation correction does not intentionally change page layout or site behavior.
- Aligned project version/cache-busting references to ArisuV367.


LATEST CHANGE — ARISUV306
- Replaced the mobile reassurance note with “Clear guidance. Honest expectations. Every case is handled individually.”
- Added a mobile-only Soft Blue Glass gradient treatment. Desktop retains its previous text and styling.


ARISUV307 RELEASE NOTES
- Applied the Soft Blue Glass reassurance-note design to both desktop and mobile.
- Replaced the separate desktop/mobile wording with one shared message: “Clear guidance. Honest expectations. Every case is handled individually.”
- Desktop styling now uses the same light blue-white-violet gradient, blue accent icon, refined border, and subtle shadow. Mobile keeps compact spacing.
- No other sections were intentionally changed.


ArisuV367 release note: Added the same thin blue-to-cyan gradient divider with a centered accent dot above the ARISU RECOVERY CONTACT kicker in the Why Choose Arisu section. No other section layout intentionally changed.


ArisuV367 release note: Increased contrast and thickness of both horizontal divider lines around “OR VISIT MY OTHER SOCIAL MEDIA ACCOUNTS” and made its label font more prominent on desktop and mobile. No other section layout intentionally changed.

ArisuV367 mobile adjustment: added 2px spacing above the Service Status card; other layout styling preserved.

ArisuV367 fix: target #serviceStatus directly and set mobile margin-top to 2px so the rule applies to the actual card.

ArisuV367 change note (2026-10-19): Removed the duplicate TikTok and Facebook authenticity warning boxes from the social cards. The main Scam Awareness Reminder remains in place; social previews, links, buttons, and overall card structure are unchanged.

ArisuV367 update: Changed the Facebook social-card button label to “View Facebook Page” and applied equal full-width/minimum-height rules to match the TikTok button. Other button placement and card structure are preserved.
ArisuV367: removed the Recovery Proofs and Customer Feedback icon tiles from their headings and moved each icon into its matching bottom button. Added 2px top spacing to both headings and their preview areas. Existing card structure, image assets, links, and unrelated sections were preserved.

ArisuV367 update (2026-10-19): Corrected the mobile Customer Feedback heading and preview spacing, and rebuilt the View Recovery Proofs button as a three-column layout so its document icon appears before the label and its diagonal arrow remains separated at the right. No unrelated sections or links were intentionally changed.


ArisuV369 adjustment: corrected the mobile View Recovery Proofs button so the document icon stays on the left, the label remains centered, and the diagonal arrow stays at the far right, matching the View All Reviews button layout. No other sections were intentionally changed.


ArisuV369 adjustment: corrected mobile Recovery Proofs button label truncation. The document icon remains in the left column, the full label uses the flexible center column, and the diagonal arrow remains in the right column.

ArisuV371 maintenance: consolidated the accumulated V367-V369 mobile Recovery Proofs / Customer Feedback spacing and Recovery Proofs CTA overrides into one authoritative mobile block. Reordered CTA children to icon, label, arrow; the grid reserves separate columns and allows the label to wrap rather than overlap or truncate. Preserved other page styles and links. ZIP/CSS/HTML checks performed; live browser rendering not performed.

CSS cleanup: in the consolidated mobile rules, moved both Recovery Proofs and Customer Feedback headings up by 2px; retained 2px spacing from heading to preview.


ArisuV389: restored the proven V371 mobile Recovery Proofs button layout, retained 2px heading lift and 2px preview spacing, and made the Reviews star icon visible with left-icon / centered-label / right-arrow alignment.


ArisuV389: Customer Feedback mobile heading restored to the V368 positioning reference. Removed inherited top padding on the feedback content wrapper; preserved 2px heading-to-preview spacing and left existing button/card structure unchanged.

ArisuV389: Mobile-only adjustment based on the supplied screenshot. Lift both Recovery Proofs and Customer Feedback heading text by 2px and widen View All Reviews to match the Recovery Proofs button width without changing card dimensions.


ArisuV389 update: Added a subtle 1px divider under the Recovery Proofs and Customer Feedback headings on mobile, matching the social-profile heading divider style. Other layout dimensions and buttons were left unchanged.



ArisuV389 maintenance: raised Recovery Proofs and Customer Feedback mobile headings by an additional 4px (translateY -8px total); kept the heading divider, 2px preview spacing, buttons, and other layout unchanged.

ArisuV389: shortened the mobile Customer Feedback featured preview by an additional 6px and lifted its View All Reviews button by 6px. Other cards and Recovery Proofs button positioning remain unchanged.
ArisuV389 update: reduced the bottom height of the bordered Customer Feedback preview card by a further 6px (12px total relative to its original full height). View All Reviews button dimensions and position remain unchanged. Mobile-only targeted rule; other layout sections unchanged. ZIP integrity checked; live browser rendering not performed.
V389: Reduced the mobile Customer Feedback bordered preview card by an additional 8px; left the View All Reviews button and other layout rules unchanged.

ArisuV399: Removed the diagonal arrows from both mobile action buttons, retained the document and star icons, and matched their 48px height and visible width using Recovery Proofs as the reference. Other preview images and card layout were left unchanged.


ArisuV413 update: Restored original TikTok and Facebook preview images on desktop to remove the oversized colored side areas caused by transparent desktop-clean assets. Mobile preview behavior is unchanged.


ArisuV414 update: Added one desktop-only authoritative sizing rule for #serviceStatus so the Service Status card stretches to the same full content width as the WhatsApp feature card. Existing internal grid, mobile rules, and unrelated sections are preserved. Desktop browser rendering still requires visual confirmation.


ARISUV423 RELEASE SUMMARY — 2026-10-19
- Reduced bottom padding of the TikTok, Facebook Page, and Recovery Proofs outer cards to 6px.
- Left Customer Feedback and all preview positions, buttons, links, and other layout elements unchanged.
- Updated active HTML/CSS cache-busting references and package version to ArisuV424.
- ZIP integrity and static syntax checks performed; live browser visual regression was not available.



ArisuV426 CSS override audit: fixed the Recovery Proofs image-position conflict. The preview wrapper remains 6px lower from the earlier layout adjustment; individual Suspended and Disabled preview tiles now compensate by 8px and 10px respectively, resulting in net positions 2px and 4px upward. Removed competing image-level transforms and retained hover-only scaling. Static checks performed; browser visual testing remains unconfirmed.


ARISUV427 RELEASE SUMMARY — 2026-10-19
- Set the Recovery Proofs preview area to 4px top spacing and raised the Recovery Proofs button by 4px.
- Neutralized conflicting earlier wrapper and tile transforms for this preview only.
- Preserved all other cards, links, and layout.

ArisuV440 update (2026-10-19): Raised only the Recovery Proofs and Customer Feedback outer cards an additional 4px (top: -8px total); TikTok and Facebook Page cards remain at top: -4px.

ArisuV440 update (2026-10-19): Enlarged only the Suspended and Disabled proof preview images by 4px on each horizontal side. Kept vertical sizing, labels, outer cards, and buttons unchanged.

ArisuV440 update (2026-10-19): Restored rounded corners on Suspended/Disabled preview images and their label edge; no layout dimensions changed.


ArisuV441 update (2026-10-19): Reduced only the Daily Bible Verse card vertical padding by 4px on desktop and mobile; horizontal padding and other layout elements remain unchanged.

ArisuV442 update (2026-10-19): Lifted the WhatsApp contact card and Service Status card by 4px using scoped positioning rules; existing card dimensions and internal layout are preserved.

ArisuV450 update (2026-10-19): Refined the MY SERVICES heading card to match the approved centered Premium Rounded Card preview; removed the top divider, added a compact blue kicker pill, soft blue-white gradient, rounded border, and subtle shadow. Mobile styles are included.
ArisuV480 update (2026-10-19): Moved only the Account Deletion card up an additional 8px (top: -16px). Account Recovery remains unchanged; MY SERVICES and other sections are unchanged. Account Recovery remains at -16px; MY SERVICES and other sections are unchanged.



ArisuV516 safe cleanup (2026-10-20): Removed empty @media blocks with no declarations and removed the two keyframe definitions arisuExpandingRing177 and arisuOrbHalo177 after confirming there are no remaining CSS/JS references. Preserved all non-empty rules, breakpoints, reduced-motion rules, selector order, and all !important declarations. Updated active cache-busting references and package version to ArisuV516. Static checks and build re-run; browser visual regression remains unverified.


ArisuV549 Account Recovery outer-card positioning update (2026-10-20): Removed the legacy `.service-card.recovery-service-card { --arc-reveal-offset: -16px; }` positioning declaration and replaced it with one authoritative rule setting `--arc-reveal-offset: -32px !important` on the complete Account Recovery outer card. The offset uses the existing scroll-reveal transform and applies on desktop and mobile without adding a competing `top`, `margin`, or `transform` rule. Updated active HTML cache-busting references and package version. Build and archive validation performed; visual verification in a live browser remains pending.

ArisuV557 release correction: This is the canonical latest package, rebuilt from the explicitly requested ArisuV555 positioning state to resolve the conflicting V555/V556 downloads. The authoritative outer-card offsets are: Account Deletion -44px; Arisu Recovery Contact -46px; Why I Built This Website -48px; Please Read -48px; About This Website -52px. V556-only unrequested offset changes (-52px/-58px/-60px) are not carried forward.
