"use strict";
/* AFV369 — Sequential terminal typing with a short, intentional 3–5 second minimum display. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;

  const rows = [
    { key: "dom", message: "Preparing homepage document", check: () => document.readyState !== "loading" },
    { key: "styles", message: "Checking page stylesheets", check: () => Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => !link.disabled).every(link => { try { return !!link.sheet; } catch { return false; } }) },
    { key: "brand", message: "Checking brand assets", check: () => { const logo = document.querySelector(".topbar .profile-logo img"); return !logo || (logo.complete && logo.naturalWidth > 0); } }
  ];
  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const track = overlay.querySelector(".boot-progress-track");
  const footnote = overlay.querySelector(".boot-footnote");
  let finished = false;

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
    const completed = rows.filter(item => {
      const node = overlay.querySelector('[data-check="' + item.key + '"]');
      return node && (node.dataset.state === "ok" || node.dataset.state === "error");
    }).length;
    const percent = Math.round(completed / rows.length * 100);
    progress.style.width = percent + "%";
    progressText.textContent = percent + "%";
    if (track) track.setAttribute("aria-valuenow", String(percent));
  }

  async function typeMessage(element, message) {
    const target = element.querySelector(".boot-message");
    target.textContent = "";
    element.querySelector(".boot-mark").textContent = "›";
    element.querySelector(".boot-status").textContent = "RUN";
    for (let i = 0; i < message.length; i += 1) {
      target.textContent += message[i];
      await wait(22);
    }
  }

  async function runSequence() {
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
    finished = true;
    footnote.textContent = rows.every(row => {
      const element = overlay.querySelector('[data-check="' + row.key + '"]');
      return element && element.dataset.state === "ok";
    }) ? "Initialization complete · opening homepage" : "Homepage ready with a resource warning";

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => overlay.remove(), 280);
    });
  }

  runSequence();
})();
