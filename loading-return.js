"use strict";
/* AFV492 — Re-enter the startup route when a hidden/restored homepage is resumed. */
(() => {
  const markerKey = "arisuFixHomepageWasHidden";
  const navigationEntry = window.performance &&
    typeof window.performance.getEntriesByType === "function"
    ? window.performance.getEntriesByType("navigation")[0]
    : null;
  const legacyNavigationType = window.performance &&
    window.performance.navigation
    ? window.performance.navigation.type
    : null;
  const navigationType = navigationEntry
    ? navigationEntry.type
    : legacyNavigationType === 1
      ? "reload"
      : legacyNavigationType === 2
        ? "back_forward"
        : "navigate";

  let redirectingToStartup = false;
  let hasBeenVisible = document.visibilityState === "visible";

  function clearMarker() {
    try {
      window.sessionStorage.removeItem(markerKey);
    } catch (error) {
      // Storage is optional; ordinary homepage navigation remains available.
    }
  }

  function markPageHidden() {
    if (redirectingToStartup || !hasBeenVisible) return;
    try {
      window.sessionStorage.setItem(markerKey, "1");
    } catch (error) {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }

  function returnToStartupIfNeeded() {
    if (redirectingToStartup) return;
    let wasHidden = false;
    try {
      wasHidden = window.sessionStorage.getItem(markerKey) === "1";
      if (wasHidden) window.sessionStorage.removeItem(markerKey);
    } catch (error) {
      return;
    }
    if (!wasHidden) return;
    redirectingToStartup = true;
    window.location.replace("/");
  }

  // A viewport-mode reload must not be mistaken for an app/tab return.
  if (navigationType === "reload") clearMarker();
  // A fresh navigation starts a new visit; discard any stale lifecycle marker.
  if (navigationType === "navigate") clearMarker();
  // A restored history entry may have been hidden before the browser suspended it.
  if (navigationType === "back_forward") returnToStartupIfNeeded();

  window.addEventListener("pagehide", markPageHidden);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") markPageHidden();
    else {
      hasBeenVisible = true;
      returnToStartupIfNeeded();
    }
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted) returnToStartupIfNeeded();
  });
})();
