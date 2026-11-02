"use strict";
/* AFV405 — Mandatory startup overlay: lock scrolling and require page readiness plus a minimum display time. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  const root = document.documentElement;
  const body = document.body;
  const revealBadge = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const path = document.querySelector(".topbar .brand .brand-name-row .arisu-verified-badge svg path");
      if (path) path.style.setProperty("stroke-dashoffset", "0", "important");
    }
  };

  if (!overlay) {
    root.classList.remove("arisu-loading-active");
    if (body) body.classList.remove("arisu-loading-active");
    revealBadge();
    return;
  }

  const startedAt = performance.now();
  const MINIMUM_DISPLAY_MS = 3000;
  let finished = false;
  root.classList.add("arisu-loading-active");
  body.classList.add("arisu-loading-active");
  overlay.classList.add("is-visible");
  overlay.classList.remove("is-ready");
  overlay.removeAttribute("aria-hidden");

  // Block scroll gestures and scroll keys while the mandatory startup overlay is active.
  const stopScroll = event => {
    if (!finished && event.cancelable) event.preventDefault();
  };
  const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);
  const stopScrollKeys = event => {
    if (!finished && scrollKeys.has(event.key) &&
        !event.target.closest("input, textarea, select, [contenteditable='true']")) {
      event.preventDefault();
    }
  };
  window.addEventListener("wheel", stopScroll, { passive: false, capture: true });
  window.addEventListener("touchmove", stopScroll, { passive: false, capture: true });
  window.addEventListener("keydown", stopScrollKeys, { capture: true });

  const rows = [
    { key: "dom", message: "Initializing homepage", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Verifying page styles", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Finalizing interface...", check: () => document.readyState === "complete" }
  ];

  rows.forEach(row => {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (element) {
      element.dataset.state = "pending";
      const mark = element.querySelector(".boot-mark");
      const status = element.querySelector(".boot-status");
      if (mark) mark.textContent = "○";
      if (status) status.textContent = "WAIT";
    }
  });

  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const track = overlay.querySelector(".boot-progress-track");
  const footnote = overlay.querySelector(".boot-footnote");
  let progressValue = 0;

  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const waitForLoad = () => document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));

  function mark(row, ok, detail) {
    const element = overlay.querySelector('[data-check="' + row.key + '"]');
    if (!element) return;
    element.dataset.state = ok ? "ok" : "error";
    const markElement = element.querySelector(".boot-mark");
    const status = element.querySelector(".boot-status");
    const message = element.querySelector(".boot-message");
    if (markElement) markElement.textContent = ok ? ">" : "!";
    if (status) status.textContent = ok ? "200 OK" : "CHECK";
    if (detail && message) message.textContent = detail;
  }

  function setProgress(value) {
    progressValue = value;
    if (progress) progress.style.width = value + "%";
    if (progressText) progressText.textContent = value + "%";
    if (track) track.setAttribute("aria-valuenow", String(value));
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
    if (target) target.textContent = "";
    if (markElement) markElement.textContent = "›";
    element.dataset.state = "running";
    if (status) status.textContent = "RUN";
    for (let i = 0; i < message.length; i += 1) {
      if (target) target.textContent += message[i];
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
      mark(row, row.check(), row.message);
      if (row.key === "final") {
        await wait(Math.max(0, MINIMUM_DISPLAY_MS - (performance.now() - startedAt)));
        setProgress(100);
        await wait(300);
      } else {
        await wait(180);
      }
    }

    await progressTask;
    await wait(Math.max(0, MINIMUM_DISPLAY_MS - (performance.now() - startedAt)));
    setProgress(100);
    const allOk = rows.every(row => {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      return element && element.dataset.state === "ok";
    });
    if (footnote) footnote.textContent = allOk
      ? "Initialization complete · opening homepage"
      : "Homepage ready with a resource warning";

    window.requestAnimationFrame(() => {
      finished = true;
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        overlay.remove();
        root.classList.remove("arisu-loading-active");
        body.classList.remove("arisu-loading-active");
        window.removeEventListener("wheel", stopScroll, true);
        window.removeEventListener("touchmove", stopScroll, true);
        window.removeEventListener("keydown", stopScrollKeys, true);
        revealBadge();
      }, 440);
    });
  }

  runSequence().catch(() => {
    // Fail safely: even if a startup animation/check throws, keep the overlay for the
    // minimum display time and then release the page rather than trapping the visitor.
    const remaining = Math.max(0, MINIMUM_DISPLAY_MS - (performance.now() - startedAt));
    window.setTimeout(() => {
      finished = true;
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        overlay.remove();
        root.classList.remove("arisu-loading-active");
        body.classList.remove("arisu-loading-active");
        window.removeEventListener("wheel", stopScroll, true);
        window.removeEventListener("touchmove", stopScroll, true);
        window.removeEventListener("keydown", stopScrollKeys, true);
        revealBadge();
      }, 440);
    }, remaining);
  });
})();