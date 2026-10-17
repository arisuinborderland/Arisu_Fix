RECOVERY PROOFS FOLDER
======================

Put authorized proof screenshots/images in this folder, then edit the
recoveryProofs array in ../script.js. Supported fields are:
- category: "suspended" or "disabled"
- title: the displayed account status/title
- image: relative path such as "proofs/example.jpg"
- alt: accessible description of the image
- violation: displayed violation label
- date: optional date label

Example:
  {
    category: "suspended",
    title: "Suspended Account",
    image: "proofs/example.jpg",
    alt: "Account status example with personal details redacted",
    violation: "Account Integrity",
    date: "October 2026"
  }

The website is static and has no upload backend; redeploy after adding or
changing files. Obtain permission, redact sensitive account/person details,
and never imply that an example guarantees a similar recovery outcome.
