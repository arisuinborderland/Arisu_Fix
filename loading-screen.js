"use strict";
/* AFV488 — Standalone startup page; redirect to the homepage after splash checks. */
(() => {
  const screen = document.getElementById("arisu-loading-screen");
  if (!screen) return;

  const rows = [
    { key: "dom", message: "Preparing startup page", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Checking startup stylesheets", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "final", message: "Opening Arisu Fix homepage", check: () => document.readyState === "complete" }
  ];
  rows.forEach(row => {
    const element = screen.querySelector('[data-check="' + row.key + '"]');
    if (!element) return;
    element.dataset.state = "pending";
    const mark = element.querySelector(".boot-mark");
    const status = element.querySelector(".boot-status");
    if (mark) mark.textContent = "○";
    if (status) status.textContent = "WAIT";
  });

  const progress = screen.querySelector(".boot-progress-fill");
  const progressText = screen.querySelector(".boot-progress-value");
  const track = screen.querySelector(".boot-progress-track");
  const footnote = screen.querySelector(".boot-footnote");
  if (!progress || !progressText || !track || !footnote) {
    window.location.replace("/home");
    return;
  }

  let progressValue = 0;
  let finished = false;
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const waitForLoad = () => document.readyState === "complete"
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));

  function setProgress(value) {
    progressValue = value;
    progress.style.width = value + "%";
    progressText.textContent = value + "%";
    track.setAttribute("aria-valuenow", String(value));
  }

  async function typeMessage(element, message) {
    const target = element.querySelector(".boot-message");
    const mark = element.querySelector(".boot-mark");
    const status = element.querySelector(".boot-status");
    if (!target || !mark || !status) return;
    target.textContent = "";
    mark.textContent = "›";
    status.textContent = "RUN";
    element.dataset.state = "running";
    for (const character of message) {
      target.textContent += character;
      await wait(16);
    }
  }

  async function runSequence() {
    for (const row of rows) {
      const element = screen.querySelector('[data-check="' + row.key + '"]');
      if (!element) continue;
      await typeMessage(element, row.message);
      await wait(120);
      await waitForLoad();
      const ok = row.check();
      element.dataset.state = ok ? "ok" : "error";
      const mark = element.querySelector(".boot-mark");
      const status = element.querySelector(".boot-status");
      if (mark) mark.textContent = ok ? ">" : "!";
      if (status) status.textContent = ok ? "200 OK" : "CHECK";
      const message = element.querySelector(".boot-message");
      if (message) message.textContent = row.message;
      if (row.key === "final") {
        setProgress(100);
        await wait(350);
      } else {
        await wait(120);
      }
    }
    if (finished) return;
    finished = true;
    setProgress(100);
    footnote.textContent = rows.every(row => {
      const element = screen.querySelector('[data-check="' + row.key + '"]');
      return element && element.dataset.state === "ok";
    }) ? "Startup checks complete · opening homepage" : "Startup page ready · opening homepage";
    screen.classList.add("is-ready");
    await wait(440);
    window.location.replace("/home");
  }

  const progressTask = (async () => {
    while (progressValue < 99 && !finished) {
      setProgress(progressValue + 1);
      await wait(28);
    }
  })();
  runSequence().catch(() => window.location.replace("/home"));
  progressTask.catch(() => {});
})();
