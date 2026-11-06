"use strict";
/* AFV487 behavior preserved for the standalone loading document; only the final handoff opens /home. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  // Match AFV487: show the startup sequence once per tab session.
  const sessionKey = "arisuFixHomepageLoadingShown";
  try {
    if (window.sessionStorage.getItem(sessionKey) === "1") {
      window.location.replace("/home");
      return;
    }
  } catch (error) {
    // Keep the site usable when session storage is unavailable.
    window.location.replace("/home");
    return;
  }

  const rows = [
    { key: "dom", message: "Initializing homepage", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Verifying page styles", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];
  rows.forEach(row => {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (!element) return;
    element.dataset.state = "pending";
    const mark = element.querySelector(".boot-mark");
    const status = element.querySelector(".boot-status");
    if (mark) mark.textContent = "○";
    if (status) status.textContent = "WAIT";
  });

  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const track = overlay.querySelector(".boot-progress-track");
  const footnote = overlay.querySelector(".boot-footnote");
  if (!progress || !progressText || !track || !footnote) {
    window.location.replace("/home");
    return;
  }

  let finished = false;
  let progressValue = 0;
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const waitForLoad = () => document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));

  function mark(row, ok) {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (!element) return;
    element.dataset.state = ok ? "ok" : "error";
    const markElement = element.querySelector(".boot-mark");
    const status = element.querySelector(".boot-status");
    if (markElement) markElement.textContent = ok ? ">" : "!";
    if (status) status.textContent = ok ? "200 OK" : "CHECK";
  }

  function setProgress(value) {
    progressValue = value;
    progress.style.width = value + "%";
    progressText.textContent = value + "%";
    track.setAttribute("aria-valuenow", String(value));
  }

  async function countProgress() {
    while (progressValue < 99 && !finished) {
      setProgress(progressValue + 1);
      await wait(30);
    }
  }

  async function typeMessage(element, message) {
    const target = element.querySelector(".boot-message");
    const markElement = element.querySelector(".boot-mark");
    const status = element.querySelector(".boot-status");
    if (!target || !markElement || !status) return;
    target.textContent = "";
    markElement.textContent = "›";
    element.dataset.state = "running";
    status.textContent = "RUN";
    for (const character of message) {
      target.textContent += character;
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
      await waitForLoad();
      mark(row, row.check());
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
    try { window.sessionStorage.setItem(sessionKey, "1"); } catch (error) { /* Continue to homepage. */ }

    footnote.textContent = rows.every(row => {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      return element && element.dataset.state === "ok";
    }) ? "Initialization complete · opening homepage" : "Homepage ready with a resource warning";

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => window.location.replace("/home"), 440);
    });
  }

  runSequence().catch(() => window.location.replace("/home"));
})();
