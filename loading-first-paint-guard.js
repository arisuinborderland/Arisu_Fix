"use strict";
/* AFV510 — First-paint guard with a bounded fail-open recovery. */
(() => {
  const sessionKey = "arisuFixHomepageLoadingShown";
  try {
    if (window.sessionStorage.getItem(sessionKey) === "1") return;
  } catch (error) {
    // Storage is optional; without it, leave the homepage visible.
    return;
  }

  document.documentElement.classList.add("arisu-loading-first-run");

  // If the deferred loader never executes (network error, syntax error, or runtime failure),
  // restore the homepage instead of leaving the first-paint visibility lock in place.
  const failOpen = () => {
    document.documentElement.classList.remove("arisu-loading-first-run", "arisu-loading-active");
    document.getElementById("arisu-loading-screen")?.remove();
    window.__arisuLoadingFailOpenTimer = null;
  };
  window.__arisuLoadingFailOpenTimer = window.setTimeout(failOpen, 15000);
})();
