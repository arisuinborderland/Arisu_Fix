"use strict";
/* AFV374 — Smooth, consecutive 1–100% progress counting. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  const rows = [
    { key: "dom", message: "Preparing homepage document", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Checking page stylesheets", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];
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
    element.querySelector(".boot-mark").textContent = ok ? "✓" : "!";
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
      await wait(22);
    }
  }

  async function runSequence() {
    const progressTask = countProgress();
    for (const row of rows) {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      if (!element) continue;
      await typeMessage(element, row.message);
      await wait(260);
      // Do not report success until the browser has completed loading the page resources.
      await waitForLoad();
      const ok = row.check();
      mark(row, ok, row.message);
      await wait(260);
    }

    if (finished) return;
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
