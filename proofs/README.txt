RECOVERY PROOFS FOLDER
======================

Place image files for your proof gallery in this folder (for example: account-restored.jpg).

Then open ../script.js and find the recoveryProofs array near the bottom. Add an entry for each image, for example:

  {
    title: "Account access restored",
    image: "proofs/account-restored.jpg",
    caption: "Example shared with permission. Results vary by case.",
    date: "October 2026"
  }

Separate multiple entries with commas. Use the exact image filename and extension.

PRIVACY CHECK BEFORE PUBLISHING
- Get permission from the person whose messages or account details appear.
- Blur/hide passwords, login codes, email addresses, phone numbers, case IDs, usernames, and private messages.
- Never claim that one example guarantees a similar result for another person.
- Do not upload fake, edited-to-mislead, or unverified proofs.

The static website does not have a server upload form. Add images to this folder and redeploy the website to publish them.
