ARISU RECOVERY CONTACT — V35
============================

STATIC WEBSITE FILES
--------------------
index.html       Main contact page
proofs.html      Recovery Proofs page (albums, search and filters)
reviews.html     Full Customer Reviews gallery
privacy.html     Privacy Policy
styles.css       Shared responsive styling
script.js        Page interactions, proof gallery, Bible verse and service status
scroll-reveal.js Scroll-up/down reveal animations for the homepage
vercel.json      Security headers for Vercel deployment

IMAGES AND ICONS
----------------
arisu-profile.jpg                         Header/footer profile image
bible-verse-hill.png                       Desktop Bible verse artwork
bible-verse-hill-mobile.jpg                Mobile Bible verse artwork
verse-mountains.svg                        Bible verse illustration
social-preview.jpg                         Link-sharing preview used by Open Graph/Twitter metadata
facebook-page-preview.jpg                  Facebook preview image
facebook-page-preview-desktop-clean.png    Desktop Facebook preview
tiktok-profile-preview.jpg                TikTok preview image
tiktok-profile-preview-desktop-clean.png  Desktop TikTok preview
proofs/                                    Proof images and instructions
reviews/                                   Review images and instructions
favicon.ico, favicon-16.png, favicon-32.png, favicon-48.png, apple-touch-icon.png

LOCAL TESTING
-------------
Open index.html in a browser or run a static local server from this folder.
Test all four pages at phone and desktop widths. The project has no backend,
package installation, or build step.

DEPLOYMENT
----------
Deploy this folder as the site root on Vercel or Netlify. The root folder
contains the HTML pages and their assets; do not deploy a nested parent folder.
After changes, keep cache-busting values in the HTML pages aligned (currently
ArisuV35) so browsers fetch the latest CSS and JavaScript files.

UPDATE RECOVERY PROOFS
----------------------
Place authorized proof images in proofs/ and update the recoveryProofs array
near the top of the gallery logic in script.js. Use category "suspended" or
"disabled", and provide title, image path, alt text, violation, and optional
date. The gallery is static: redeploy after adding/changing an image.

UPDATE CUSTOMER REVIEW IMAGES
-----------------------------
Replace reviews/review-slot-1.jpg or reviews/review-slot-2.jpg while keeping
the same filename, or update the corresponding paths in index.html and
reviews.html. review-slot-3.svg is the remaining editable placeholder.
Reference images currently mention Pinoy Cyber Tech, not Arisu Recovery
Service, and must not be described as Arisu testimonials. Only publish genuine
customer feedback with permission.

SAFETY AND LIMITATIONS
----------------------
This is an independent information/contact website, not an official Meta,
Facebook, or Instagram service. Recovery is not guaranteed. Never ask visitors
to provide passwords, one-time codes, 2FA codes, backup codes, or recovery
codes. Obtain permission and redact personal information before publishing
proof screenshots. Image interaction deterrents cannot prevent screenshots or
all forms of copying.
