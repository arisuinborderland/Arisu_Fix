"use strict";
/* AFV411 — Session-guarded loading screen with first-paint visibility and scroll lock. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  // Show once per tab session. Mark completion only after the loading sequence finishes.
  const sessionKey = "arisuFixHomepageLoadingShown";
  try {
    if (window.sessionStorage.getItem(sessionKey) === "1") {
      overlay.remove();
      return;
    }
  } catch (error) {
    // Fail closed: if session storage is unavailable, keep the homepage usable without the optional overlay.
    overlay.remove();
    return;
  }

  // Lock background scrolling while the fixed loading overlay is active.
  document.documentElement.classList.add("arisu-loading-active");

  // The first-paint guard decides visibility before the stylesheet is painted.
  overlay.classList.add("is-visible");
  const startupStartedAt = Date.now();

  const rows = [
    { key: "dom", message: "Initializing homepage", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Verifying page styles", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];
  // Keep all three labels visible from the first paint; only their statuses advance sequentially.
  rows.forEach(row => {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (element) {
      element.dataset.state = "pending";
      element.querySelector(".boot-mark").textContent = "›";
      element.querySelector(".boot-status").textContent = "WAIT";
    }
  });

  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const track = overlay.querySelector(".boot-progress-track");
  let finished = false;
  let progressValue = 0;

  const MIN_STARTUP_DURATION = 2500;
  const EXIT_FADE_DURATION = 440;
  const STATUS_CHECK_DELAY = 550;
  const STATUS_ROW_GAP = 180;
  const wait = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
  const waitForLoad = () => document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));

  function mark(row, ok, detail) {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (!element) return;
    element.dataset.state = ok ? "ok" : "error";
    element.querySelector(".boot-mark").textContent = ok ? ">" : "!";
    element.querySelector(".boot-status").textContent = ok ? "✓ DONE" : "CHECK";
    if (detail) element.querySelector(".boot-message").textContent = detail;
  }

  function setProgress(value) {
    progressValue = value;
    progress.style.width = value + "%";
    progressText.textContent = value + "%";
    if (track) track.setAttribute("aria-valuenow", String(value));
  }

  async function countProgress() {
    // Count every integer in order. Hold at 99% until the real checks finish.
    while (progressValue < 99 && !finished) {
      setProgress(progressValue + 1);
      await wait(20);
    }
  }

  async function typeMessage(element) {
    // Keep the full step label visible; animate only its marker and status.
    element.querySelector(".boot-mark").textContent = "›";
    element.dataset.state = "running";
    element.querySelector(".boot-status").textContent = "RUN";
  }

  async function runSequence() {
    const progressTask = countProgress();
    for (const row of rows) {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      if (!element) continue;
      await typeMessage(element);
      await wait(STATUS_CHECK_DELAY);
      // Do not report success until the browser has completed loading the page resources.
      await waitForLoad();
      const ok = row.check();
      mark(row, ok, row.message);
      // Keep a short, consistent pause between completed rows.
      if (row.key !== "final") await wait(STATUS_ROW_GAP);
    }

    await progressTask;
    // Target 2.5 seconds from first paint through the end of the exit fade.
    // If real page readiness takes longer, never shorten or bypass that wait.
    const remainingBeforeFade = Math.max(0, MIN_STARTUP_DURATION - EXIT_FADE_DURATION - (Date.now() - startupStartedAt));
    if (remainingBeforeFade > 0) await wait(remainingBeforeFade);
    setProgress(100);
    finished = true;
    // Persist completion only after all loading checks have finished.
    try { window.sessionStorage.setItem(sessionKey, "1"); } catch (error) { /* Continue if storage becomes unavailable. */ }

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        document.documentElement.classList.remove("arisu-loading-first-run");
        document.documentElement.classList.remove("arisu-loading-active");
        overlay.remove();
      }, EXIT_FADE_DURATION);
    });
  }

  runSequence();
})();
