"use strict";
/* AFV379 — Smooth, consecutive 1–100% progress counting. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  // Show once per tab session. Reloads and the site's Home button won't replay it.
  const sessionKey = "arisuFixHomepageLoadingShown";
  try {
    if (window.sessionStorage.getItem(sessionKey) === "1") {
      overlay.remove();
      return;
    }
    window.sessionStorage.setItem(sessionKey, "1");
  } catch (error) {
    // If storage is unavailable, continue normally rather than blocking the homepage.
  }

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

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => overlay.remove(), 440);
    });
  }

  runSequence();
})();
