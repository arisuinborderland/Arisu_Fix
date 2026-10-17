(() => {
  try {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation && navigation.type === "reload") {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      const returnToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      window.addEventListener("load", returnToTop, { once: true });
      window.addEventListener("pageshow", returnToTop, { once: true });
    }
  } catch (_) { /* Keep the site usable if Navigation Timing is unavailable. */ }
})();
