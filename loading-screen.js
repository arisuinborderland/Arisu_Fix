"use strict";
/* AFV514 — Audited session-guarded loader with bounded exit recovery. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  const root = document.documentElement;
  const sessionKey = "arisuFixHomepageLoadingShown";
  const failOpenTimer = window.__arisuLoadingFailOpenTimer;
  const controller = new AbortController();
  const { signal } = controller;
  const rows = [
    { key: "dom", message: "Initializing homepage", check: () => document.readyState !== "loading" },
    {
      key: "styles",
      message: "Verifying page styles",
      check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .filter(link => !link.disabled)
        .every(link => {
          try { return !!link.sheet; } catch { return false; }
        })
    },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];
  const elements = new Map(rows.map(row => [row.key, overlay.querySelector('[data-check="' + row.key + '"]')]));
  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const progressPercent = overlay.querySelector(".boot-progress-percent");
  const progressWaiting = overlay.querySelector(".boot-progress-waiting");
  const progressComplete = overlay.querySelector(".boot-progress-complete");
  const track = overlay.querySelector(".boot-progress-track");
  let finished = false;
  let exitStarted = false;
  let exitFrameFallbackTimer = null;
  let progressValue = 0;

  const MIN_STARTUP_DURATION = 2500;
  const EXIT_FADE_DURATION = 440;
  const EXIT_FRAME_FALLBACK_DELAY = 120;
  const STATUS_CHECK_DELAY = 550;
  const STATUS_ROW_GAP = 180;

  function clearFailOpenTimer() {
    if (failOpenTimer) window.clearTimeout(failOpenTimer);
    window.__arisuLoadingFailOpenTimer = null;
  }

  function failOpen() {
    if (finished) return;
    finished = true;
    controller.abort();
    clearFailOpenTimer();
    if (window.__arisuLoadingFailOpen === failOpen) window.__arisuLoadingFailOpen = null;
    root.classList.remove("arisu-loading-first-run", "arisu-loading-active");
    overlay.remove();
  }

  window.__arisuLoadingFailOpen = failOpen;

  try {
    if (window.sessionStorage.getItem(sessionKey) === "1") {
      clearFailOpenTimer();
      if (window.__arisuLoadingFailOpen === failOpen) window.__arisuLoadingFailOpen = null;
      root.classList.remove("arisu-loading-first-run", "arisu-loading-active");
      overlay.remove();
      return;
    }
  } catch (error) {
    failOpen();
    return;
  }

  const requiredRowsReady = rows.every(row => {
    const element = elements.get(row.key);
    return element
      && element.querySelector(".boot-mark")
      && element.querySelector(".boot-status")
      && element.querySelector(".boot-message");
  });
  if (!requiredRowsReady || !progress || !progressText || !progressPercent || !progressWaiting || !progressComplete || !track) {
    failOpen();
    return;
  }

  root.classList.add("arisu-loading-active");
  overlay.classList.add("is-visible");
  progressWaiting.hidden = false;
  progressComplete.hidden = true;
  const startupStartedAt = Date.now();

  rows.forEach(row => {
    const element = elements.get(row.key);
    element.dataset.state = "pending";
    element.querySelector(".boot-mark").textContent = "›";
    element.querySelector(".boot-status").textContent = "WAIT";
  });

  function wait(ms) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error("Loading sequence cancelled"));
        return;
      }

      let settled = false;
      let timer;
      const cleanup = () => {
        if (timer !== undefined) window.clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
      };
      const finish = callback => {
        if (settled) return;
        settled = true;
        cleanup();
        callback();
      };
      const onAbort = () => finish(() => reject(new Error("Loading sequence cancelled")));

      timer = window.setTimeout(() => finish(resolve), ms);
      signal.addEventListener("abort", onAbort, { once: true });
      if (signal.aborted) onAbort();
    });
  }

  function waitForLoad() {
    if (document.readyState === "complete") return Promise.resolve();
    return new Promise((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        window.removeEventListener("load", onLoad);
        signal.removeEventListener("abort", onAbort);
      };
      const finish = callback => {
        if (settled) return;
        settled = true;
        cleanup();
        callback();
      };
      const onLoad = () => finish(resolve);
      const onAbort = () => finish(() => reject(new Error("Loading sequence cancelled")));

      window.addEventListener("load", onLoad, { once: true });
      signal.addEventListener("abort", onAbort, { once: true });
      if (document.readyState === "complete") onLoad();
    });
  }

  function mark(row, ok) {
    const element = elements.get(row.key);
    element.dataset.state = ok ? "ok" : "error";
    element.querySelector(".boot-mark").textContent = ok ? ">" : "!";
    element.querySelector(".boot-status").textContent = ok ? "DONE" : "CHECK";
    element.querySelector(".boot-message").textContent = row.message;
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
    const progressTask = countProgress().catch(() => {});
    for (const row of rows) {
      if (signal.aborted) return;
      const element = elements.get(row.key);
      typeMessage(element);
      await wait(STATUS_CHECK_DELAY);
      await waitForLoad();
      if (signal.aborted) return;
      let passed = false;
      try {
        passed = Boolean(row.check());
      } catch (error) {
        passed = false;
      }
      mark(row, passed);
      if (!passed) {
        failOpen();
        return;
      }
      if (row.key !== "final") await wait(STATUS_ROW_GAP);
    }

    await progressTask;
    if (signal.aborted || finished) return;
    const remainingBeforeFade = Math.max(0, MIN_STARTUP_DURATION - EXIT_FADE_DURATION - (Date.now() - startupStartedAt));
    if (remainingBeforeFade > 0) await wait(remainingBeforeFade);
    if (signal.aborted || finished) return;

    setProgress(100);
    progressWaiting.hidden = true;
    progressComplete.hidden = false;
    clearFailOpenTimer();
    finished = true;
    if (window.__arisuLoadingFailOpen === failOpen) window.__arisuLoadingFailOpen = null;
    try { window.sessionStorage.setItem(sessionKey, "1"); } catch (error) { /* Continue without persistence. */ }

    function beginExit() {
      if (exitStarted) return;
      exitStarted = true;
      if (exitFrameFallbackTimer !== null) {
        window.clearTimeout(exitFrameFallbackTimer);
        exitFrameFallbackTimer = null;
      }
      if (!overlay.isConnected) {
        root.classList.remove("arisu-loading-first-run", "arisu-loading-active");
        return;
      }
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        root.classList.remove("arisu-loading-first-run", "arisu-loading-active");
        if (overlay.isConnected) overlay.remove();
      }, EXIT_FADE_DURATION);
    }

    if (typeof window.requestAnimationFrame === "function") {
      exitFrameFallbackTimer = window.setTimeout(beginExit, EXIT_FRAME_FALLBACK_DELAY);
      try {
        window.requestAnimationFrame(beginExit);
      } catch (error) {
        beginExit();
      }
    } else {
      beginExit();
    }
  }

  runSequence().catch(error => {
    if (!finished) failOpen();
  });
})();
