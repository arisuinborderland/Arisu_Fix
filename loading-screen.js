"use strict";
/* AFV492 — Run the startup overlay in-place; never navigate or reload the homepage. */
(() => {
  const root = document.documentElement;
  const screen = document.getElementById("arisu-loading-screen");
  if (!screen || !root.classList.contains("arisu-show-startup")) return;

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
  let finished = false;
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const setProgress = value => {
    progressValue = value;
    progress.style.width = value + "%";
    progressText.textContent = value + "%";
    track.setAttribute("aria-valuenow", String(value));
  };
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
      if (row.key === "styles" && document.readyState !== "complete") {
        await new Promise(resolve => window.addEventListener("load", resolve, { once: true }));
      }
      const ok = row.check();
      element.dataset.state = ok ? "ok" : "error";
      const mark = element.querySelector(".boot-mark");
      const status = element.querySelector(".boot-status");
      if (mark) mark.textContent = ok ? ">" : "!";
      if (status) status.textContent = ok ? "200 OK" : "CHECK";
      const message = element.querySelector(".boot-message");
      if (message) message.textContent = row.message;
      await wait(row.key === "final" ? 350 : 120);
    }
    if (finished) return;
    finished = true;
    setProgress(100);
    footnote.textContent = rows.every(row => {
      const element = screen.querySelector('[data-check="' + row.key + '"]');
      return element && element.dataset.state === "ok";
    }) ? "Startup checks complete · ready to explore" : "Homepage ready";
    screen.classList.add("is-ready");
    await wait(440);
    root.classList.remove("arisu-show-startup");
  }
  const progressTask = (async () => {
    while (progressValue < 99 && !finished) {
      setProgress(progressValue + 1);
      await wait(28);
    }
  })();
  runSequence().catch(() => {
    finished = true;
    screen.classList.add("is-ready");
    root.classList.remove("arisu-show-startup");
  });
  progressTask.catch(() => {});
})();
