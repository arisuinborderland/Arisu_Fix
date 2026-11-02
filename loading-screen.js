"use strict";
/* AFV406 — Session-guarded loading screen; refreshed cache version for production validation. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  // Mark the session only after the loading sequence finishes. If the user refreshes
  // while it is still running, the next page load can show the overlay again.
  const sessionKey = "arisuFixHomepageLoadingShown";
  try {
    if (window.sessionStorage.getItem(sessionKey) === "1") {
      overlay.remove();
      return;
    }
  } catch (error) {
    // Storage may be unavailable; keep the optional loading screen usable regardless.
  }

  // Lock page scrolling while the fixed loading overlay is active.
  document.documentElement.classList.add("arisu-loading-active");

  // Keep the overlay hidden in the initial HTML until the session guard is checked.
  overlay.classList.add("is-visible");

  const rows = [
    { key: "dom", message: "Initializing homepage", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Verifying page styles", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];
  // Keep upcoming checks hidden so each line appears only when its turn begins.
  rows.forEach(row => {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (element) {
      element.dataset.state = "pending";
      element.querySelector(".boot-mark").textContent = "○";
      element.querySelector(".boot-status").textContent = "WAIT";
    }
  });

  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const track = overlay.querySelector(".boot-progress-track");
  const footnote = overlay.querySelector(".boot-footnote");
  let finished = false;
  let progressValue = 0;

  const wait = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));
  const waitForLoad = () => document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));

  function mark(row, ok, detail) {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (!element) return;
    element.dataset.state = ok ? "ok" : "error";
    element.querySelector(".boot-mark").textContent = ok ? ">" : "!";
    element.querySelector(".boot-status").textContent = ok ? "200 OK" : "CHECK";
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
      await wait(30);
    }
  }

  async function typeMessage(element, message) {
    const target = element.querySelector(".boot-message");
    target.textContent = "";
    element.querySelector(".boot-mark").textContent = "›";
    element.dataset.state = "running";
    element.querySelector(".boot-status").textContent = "RUN";
    for (let i = 0; i < message.length; i += 1) {
      target.textContent += message[i];
      await wait(20);
    }
  }

  async function runSequence() {
    const progressTask = countProgress();
    for (const row of rows) {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      if (!element) continue;
      await typeMessage(element, row.message);
      await wait(180);
      // Do not report success until the browser has completed loading the page resources.
      await waitForLoad();
      const ok = row.check();
      mark(row, ok, row.message);
      // Show 100% with the final 200 OK, then hold briefly before fading out.
      if (row.key === "final") {
        setProgress(100);
        await wait(500);
      } else {
        await wait(180);
      }
    }

    await progressTask;
    setProgress(100);
    finished = true;
    footnote.textContent = rows.every(row => {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      return element && element.dataset.state === "ok";
    }) ? "Initialization complete · opening homepage" : "Homepage ready with a resource warning";

    // A refresh before this point leaves the session unmarked, so loading is not lost.
    try {
      window.sessionStorage.setItem(sessionKey, "1");
    } catch (error) {
      // Continue normally if session storage is unavailable.
    }

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        document.documentElement.classList.remove("arisu-loading-active");
        overlay.remove();
      }, 440);
    });
  }

  runSequence();
})();
