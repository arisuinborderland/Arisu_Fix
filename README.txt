ARISU RECOVERY CONTACT — V72
============================

PROJECT OVERVIEW
----------------
A static, front-end website for Arisu Recovery Contact. It provides contact
information, recovery-proof examples, customer-feedback imagery, a privacy
policy, a Bible verse section, service-status information, and scroll-reveal
animations. The website is independent and is not an official Meta, Facebook,
or Instagram service. Recovery is not guaranteed.

CORE PAGES AND FILES
--------------------
index.html        Main contact page
proofs.html       Recovery Proofs gallery
reviews.html      Customer Feedback / review gallery
privacy.html      Privacy Policy
styles.css        Shared styling and responsive layouts
script.js         Page interactions and dynamic content
scroll-reveal.js  Homepage scroll-reveal behavior
vercel.json       Vercel response-header configuration

IMAGES AND ICONS
----------------
arisu-profile.jpg                         Header/footer profile image
bible-verse-hill.png                       Desktop Bible verse artwork
bible-verse-hill-mobile.jpg                Mobile Bible verse artwork
verse-mountains.svg                        Bible verse illustration
social-preview.jpg                         Social sharing preview
facebook-page-preview.jpg                  Facebook preview image
facebook-page-preview-desktop-clean.png    Desktop Facebook preview
tiktok-profile-preview.jpg                 TikTok preview image
tiktok-profile-preview-desktop-clean.png   Desktop TikTok preview
proofs/                                    Proof images and folder guidance
reviews/                                   Review images and folder guidance
favicon files and apple-touch-icon.png     Browser and home-screen icons

LOCAL TESTING
-------------
Open index.html directly or serve this folder using a static local server.
Check all four HTML pages at mobile and desktop widths. Verify links, contact
actions, image loading, scroll-reveal behavior in both scroll directions, and
that no horizontal overflow appears. A static source audit alone does not
replace testing in an actual browser.

DEPLOYMENT
----------
Deploy the contents of this folder as the site root on Vercel or another
static host. Do not deploy a nested parent folder. After a code change, keep
cache-busting values aligned across the HTML pages and referenced CSS/JS
assets. Current cache-busting token: ArisuV72.

UPDATE RECOVERY PROOFS
----------------------
Only add proof images that you have permission to publish. Edit the
recoveryProofs array in script.js and provide the category, title, image path,
alt text, violation label, and optional date. Supported categories include
"suspended" and "disabled". This is a static gallery; redeploy after changing
images or content. Redact personal details that are not necessary to show.

UPDATE CUSTOMER FEEDBACK IMAGES
-------------------------------
The gallery uses review-slot-1.jpg, review-slot-2.jpg, and review-slot-3.svg.
Keep filenames unchanged when replacing images, or update their references in
index.html and reviews.html. The supplied JPG reference screenshots mention
Pinoy Cyber Tech rather than Arisu Recovery Service. Do not represent them as
Arisu testimonials. Publish genuine customer feedback only with permission.

SAFETY AND PRIVACY
------------------
Never ask visitors for passwords, one-time passwords, 2FA codes, backup codes,
or recovery codes. Proof/review images may reveal profile names, photos,
handles, email addresses, phone numbers, or other personal information. Obtain
permission and redact/crop unnecessary identifying information before
publication. Image interaction deterrents cannot prevent screenshots or all
forms of copying.

MAINTENANCE RECORD
------------------
V72: Updated the project documentation to reflect the current V72 package and
removed outdated historical notes from the README files. Updated cache-busting
references from ArisuV70 to ArisuV72. No layout, styling rules, page content,
or application logic were intentionally changed in this documentation update.
