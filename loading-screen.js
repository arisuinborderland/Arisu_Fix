"use strict";
/* AFV368 — Progress reflects real homepage readiness checks; no artificial delay. */
(() => {
  const overlay = document.getElementById("arisu-loading-screen");
  if (!overlay) return;
  const rows = {
    dom: overlay.querySelector('[data-check="dom"]'),
    styles: overlay.querySelector('[data-check="styles"]'),
    brand: overlay.querySelector('[data-check="brand"]')
  };
  const progress = overlay.querySelector(".boot-progress-fill");
  const progressText = overlay.querySelector(".boot-progress-value");
  const footnote = overlay.querySelector(".boot-footnote");
  let finished = false;

  function mark(name, ok, detail) {
    const row = rows[name];
    if (!row) return;
    row.dataset.state = ok ? "ok" : "error";
    row.querySelector(".boot-mark").textContent = ok ? "✓" : "!";
    row.querySelector(".boot-status").textContent = ok ? "200 OK" : "CHECK";
    if (detail) row.querySelector(".boot-message").textContent = detail;
    const complete = Object.values(rows).filter(Boolean).filter(item => item.dataset.state === "ok").length;
    const percent = Math.round(complete / Object.values(rows).filter(Boolean).length * 100);
    progress.style.width = percent + "%";
    progressText.textContent = percent + "%";
    const track = overlay.querySelector(".boot-progress-track");
    if (track) track.setAttribute("aria-valuenow", String(percent));
  }

  function finish() {
    if (finished) return;
    finished = true;
    mark("dom", document.readyState !== "loading", "Homepage document parsed");
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .filter(link => !link.disabled);
    const stylesReady = stylesheets.every(link => {
      try { return !!link.sheet; } catch { return false; }
    });
    mark("styles", stylesReady, stylesReady ? "Stylesheets available" : "Some stylesheets unavailable");
    const logo = document.querySelector(".topbar .profile-logo img");
    const brandReady = !logo || (logo.complete && logo.naturalWidth > 0);
    mark("brand", brandReady, brandReady ? "Brand assets ready" : "Brand image unavailable");
    footnote.textContent = stylesReady && brandReady
      ? "Initialization complete · opening homepage"
      : "Homepage ready with a resource warning";
    window.requestAnimationFrame(() => {
      overlay.classList.add("is-ready");
      overlay.setAttribute("aria-hidden", "true");
      window.setTimeout(() => overlay.remove(), 280);
    });
  }

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
})();
