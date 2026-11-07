"use strict";
/* AFV510 — Session-guarded loading screen with bounded fail-open recovery. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  const sessionKey = "arisuFixHomepageLoadingShown";
  const failOpenTimer = window.__arisuLoadingFailOpenTimer;
  const clearFailOpenTimer = () => {
    if (failOpenTimer) window.clearTimeout(failOpenTimer);
    window.__arisuLoadingFailOpenTimer = null;
  };
  const failOpen = () => {
    clearFailOpenTimer();
    document.documentElement.classList.remove("arisu-loading-first-run", "arisu-loading-active");
    overlay.remove();
  };

  try {
    if (window.sessionStorage.getItem(sessionKey) === "1") {
      clearFailOpenTimer();
      document.documentElement.classList.remove("arisu-loading-first-run");
      overlay.remove();
      return;
    }
  } catch (error) {
    // Storage is optional. Never leave the first-paint visibility lock behind.
    failOpen();
    return;
  }

  document.documentElement.classList.add("arisu-loading-active");
  overlay.classList.add("is-visible");
  const startupStartedAt = Date.now();

  const rows = [
    { key: "dom", message: "Initializing homepage", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Verifying page styles", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];

  const required = [
    ".boot-progress-fill",
    ".boot-progress-value",
    ".boot-progress-percent",
    ".boot-progress-track"
  ];
  const requiredRowsReady = rows.every(row => {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    return element && element.querySelector(".boot-mark") && element.querySelector(".boot-status") && element.querySelector(".boot-message");
  });
  if (!requiredRowsReady || required.some(selector => !overlay.querySelector(selector))) {
    failOpen();
    return;
  }

  rows.forEach(row => {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    element.dataset.state = "pending";
    element.querySelector(".boot-mark").textContent = "›";
    element.querySelector(".boot-status").textContent = "WAIT";
  });

  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const progressPercent = overlay.querySelector(".boot-progress-percent");
  const progressComplete = overlay.querySelector(".boot-progress-complete");
  const track = overlay.querySelector(".boot-progress-track");
  let finished = false;
  let progressValue = 0;

  const MIN_STARTUP_DURATION = 2500;
  const EXIT_FADE_DURATION = 440;
  const STATUS_CHECK_DELAY = 550;
  const STATUS_ROW_GAP = 180;
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const waitForLoad = () => document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));

  function mark(row, ok, detail) {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (!element) return;
    element.dataset.state = ok ? "ok" : "error";
    element.querySelector(".boot-mark").textContent = ok ? ">" : "!";
    element.querySelector(".boot-status").textContent = ok ? "DONE" : "CHECK";
    if (detail) element.querySelector(".boot-message").textContent = detail;
  }

  function setProgress(value) {
    progressValue = value;
    progress.style.width = value + "%";
    progressPercent.textContent = value + "%";
    progressText.classList.toggle("is-filled", value >= 50);
    track.setAttribute("aria-valuenow", String(value));
    track.setAttribute("aria-valuetext", value === 100 ? "100% complete" : value + "%");
  }

  async function countProgress() {
    while (progressValue < 99 && !finished) {
      setProgress(progressValue + 1);
      await wait(20);
    }
  }

  function typeMessage(element) {
    element.querySelector(".boot-mark").textContent = "›";
    element.dataset.state = "running";
    element.querySelector(".boot-status").textContent = "RUN";
  }

  async function runSequence() {
    const progressTask = countProgress();
    for (const row of rows) {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      typeMessage(element);
      await wait(STATUS_CHECK_DELAY);
      await waitForLoad();
      mark(row, row.check(), row.message);
      if (row.key !== "final") await wait(STATUS_ROW_GAP);
    }

    await progressTask;
    const remainingBeforeFade = Math.max(0, MIN_STARTUP_DURATION - EXIT_FADE_DURATION - (Date.now() - startupStartedAt));
    if (remainingBeforeFade > 0) await wait(remainingBeforeFade);
    setProgress(100);
    if (progressComplete) progressComplete.hidden = false;
    finished = true;
    try { window.sessionStorage.setItem(sessionKey, "1"); } catch (error) { /* Continue without persistence. */ }

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        clearFailOpenTimer();
        document.documentElement.classList.remove("arisu-loading-first-run", "arisu-loading-active");
        overlay.remove();
      }, EXIT_FADE_DURATION);
    });
  }

  runSequence().catch(failOpen);
})();
