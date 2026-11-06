"use strict";
/* AFV493 — In-place startup overlay with tab-session and return-to-tab lifecycle handling. */
(() => {
  const root = document.documentElement;
  const screen = document.getElementById("arisu-loading-screen");
  if (!screen) return;
  const rows = [
    { key: "dom", message: "Preparing homepage document", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Checking page stylesheets", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];
  const progress = screen.querySelector(".boot-progress-fill");
  const progressText = screen.querySelector(".boot-progress-value");
  const track = screen.querySelector(".boot-progress-track");
  const footnote = screen.querySelector(".boot-footnote");
  if (!progress || !progressText || !track || !footnote) {
    root.classList.remove("arisu-show-startup");
    return;
  }
  let progressValue = 0;
  let runId = 0;
  let isRunning = false;
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const setProgress = value => {
    progressValue = value;
    progress.style.width = value + "%";
    progressText.textContent = value + "%";
    track.setAttribute("aria-valuenow", String(value));
  };
  function resetOverlay() {
    screen.classList.remove("is-ready");
    rows.forEach(row => {
      const element = screen.querySelector('[data-check="' + row.key + '"]');
      if (!element) return;
      element.dataset.state = "pending";
      const mark = element.querySelector(".boot-mark");
      const message = element.querySelector(".boot-message");
      const status = element.querySelector(".boot-status");
      if (mark) mark.textContent = "○";
      if (message) message.textContent = row.message;
      if (status) status.textContent = "WAIT";
    });
    footnote.textContent = "Waiting for actual page readiness…";
    setProgress(0);
  }
  async function typeMessage(element, message, token) {
    const target = element.querySelector(".boot-message");
    const mark = element.querySelector(".boot-mark");
    const status = element.querySelector(".boot-status");
    if (!target || !mark || !status) return;
    target.textContent = "";
    mark.textContent = "›";
    status.textContent = "RUN";
    element.dataset.state = "running";
    for (const character of message) {
      if (token !== runId) return;
      target.textContent += character;
      await wait(16);
    }
  }
  async function runSequence(token) {
    try {
      for (const row of rows) {
        if (token !== runId) return;
        const element = screen.querySelector('[data-check="' + row.key + '"]');
        if (!element) continue;
        await typeMessage(element, row.message, token);
        if (token !== runId) return;
        await wait(120);
        if (row.key === "styles" && document.readyState !== "complete") {
          await new Promise(resolve => window.addEventListener("load", resolve, { once: true }));
        }
        if (token !== runId) return;
        const ok = row.check();
        element.dataset.state = ok ? "ok" : "error";
        const mark = element.querySelector(".boot-mark");
        const status = element.querySelector(".boot-status");
        const message = element.querySelector(".boot-message");
        if (mark) mark.textContent = ok ? ">" : "!";
        if (status) status.textContent = ok ? "200 OK" : "CHECK";
        if (message) message.textContent = row.message;
        await wait(row.key === "final" ? 350 : 120);
      }
      if (token !== runId) return;
      setProgress(100);
      footnote.textContent = rows.every(row => {
        const element = screen.querySelector('[data-check="' + row.key + '"]');
        return element && element.dataset.state === "ok";
      }) ? "Startup checks complete · ready to explore" : "Homepage ready";
      screen.classList.add("is-ready");
      await wait(440);
      if (token !== runId) return;
      root.classList.remove("arisu-show-startup");
    } catch (_) {
      if (token !== runId) return;
      screen.classList.add("is-ready");
      root.classList.remove("arisu-show-startup");
    } finally {
      if (token === runId) isRunning = false;
    }
  }
  function startOverlay(forceRestart) {
    if (isRunning && !forceRestart) return;
    runId += 1;
    const token = runId;
    isRunning = true;
    resetOverlay();
    root.classList.remove("arisu-suppress-startup");
    root.classList.add("arisu-show-startup");
    (async () => {
      while (token === runId && progressValue < 99) {
        setProgress(progressValue + 1);
        await wait(28);
      }
    })().catch(() => {});
    runSequence(token);
  }
  // Initial visit is controlled synchronously in index.html before first paint.
  if (root.classList.contains("arisu-show-startup")) startOverlay(false);
  // Startup is once per tab session. Browser menu visibility changes and
  // BFCache restoration must not restart the completed overlay.

})();
