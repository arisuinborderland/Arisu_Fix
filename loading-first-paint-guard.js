"use strict";
/* AFV491 — Apply the loading visibility class before the first body paint under the strict CSP. */
try {
  const sessionKey = "arisuFixHomepageLoadingShown";
  if (window.sessionStorage.getItem(sessionKey) !== "1") {
    document.documentElement.classList.add("arisu-loading-first-run");
  }
} catch (error) {
  // Keep the optional loading overlay hidden if session storage is unavailable.
}
