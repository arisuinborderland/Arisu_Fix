(() => {
  "use strict";

  const createElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const makeTrigger = (section, title, subtitle, panelId, index, initiallyOpen = false) => {
    const button = createElement("button", "home-accordion-trigger");
    button.type = "button";
    button.id = `homeAccordionTrigger${index}`;
    button.setAttribute("aria-controls", panelId);
    button.setAttribute("aria-expanded", String(initiallyOpen));

    const copy = createElement("span", "home-accordion-trigger-copy");
    const heading = createElement("span", "home-accordion-trigger-title");
    heading.innerHTML = title.innerHTML;
    const description = createElement("span", "home-accordion-trigger-subtitle");
    const descriptionText = createElement("span", "home-accordion-trigger-subtitle-text", subtitle);
    description.append(descriptionText);
    copy.append(heading, description);

    const chevron = createElement("span", "home-accordion-chevron");
    chevron.setAttribute("aria-hidden", "true");
    button.append(copy, chevron);
    section.insertBefore(button, section.firstChild);
    return button;
  };

  const makePanel = (section, panelId, button, initiallyOpen = false) => {
    const panel = createElement("div", "home-accordion-panel");
    const inner = createElement("div", "home-accordion-panel-inner");
    panel.id = panelId;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", button.id);
    panel.inert = !initiallyOpen;
    while (button.nextSibling) inner.append(button.nextSibling);
    panel.append(inner);
    section.append(panel);
    return panel;
  };

  const initialize = () => {
    const services = document.getElementById("services");
    const why = document.getElementById("why-choose-arisu");
    const destination = document.getElementById("desktopSocialDestination");
    const processHeading = document.getElementById("how-it-works");
    if (!services || !why || !destination || !processHeading || services.dataset.accordionReady === "true") return;

    const items = [];
    const serviceHeading = services.querySelector(".services-heading h2");
    const serviceIntro = services.querySelector(".services-heading > p");
    if (!serviceHeading || !serviceIntro) return;
    services.dataset.accordionReady = "true";
    services.classList.add("home-accordion-item");
    const serviceButton = makeTrigger(services, serviceHeading, serviceIntro.textContent.trim(), "homeAccordionServicesPanel", 1);
    serviceHeading.remove();
    serviceIntro.remove();
    const servicePanel = makePanel(services, "homeAccordionServicesPanel", serviceButton);
    items.push({ section: services, button: serviceButton, panel: servicePanel });

    const whyCard = why.querySelector(".why-arisu-card");
    const whyHeading = whyCard?.querySelector(".why-arisu-heading");
    const whyTitle = whyHeading?.querySelector("h2");
    const whyIntro = whyHeading?.querySelector("p");
    if (!whyCard || !whyTitle || !whyIntro) return;
    why.classList.add("home-accordion-item");
    const whyButton = makeTrigger(why, whyTitle, whyIntro.textContent.trim(), "homeAccordionWhyPanel", 2);
    whyHeading.remove();
    const whyPanel = makePanel(why, "homeAccordionWhyPanel", whyButton);
    items.push({ section: why, button: whyButton, panel: whyPanel });

    const processTitle = processHeading.querySelector("h2");
    const processIntro = processHeading.querySelector("p");
    const processGrid = whyCard.querySelector(".why-arisu-grid");
    const processNote = whyCard.querySelector(".why-arisu-note");
    const safety = whyCard.querySelector("#account-safety");
    if (!processTitle || !processIntro || !processGrid || !processNote || !safety) return;

    const how = createElement("section", "site-section why-arisu-section how-assistance-section home-accordion-item");
    how.id = "how-assistance-works";
    how.setAttribute("aria-label", "How account assistance works");
    const howCard = createElement("div", "why-arisu-card");
    const howButton = makeTrigger(how, processTitle, processIntro.textContent.trim(), "homeAccordionHowPanel", 3);
    processHeading.remove();
    howCard.append(processGrid, processNote, safety);
    how.append(howCard);
    const howPanel = makePanel(how, "homeAccordionHowPanel", howButton);
    destination.append(how);
    items.push({ section: how, button: howButton, panel: howPanel });

    const setOpen = (activeItem) => {
      items.forEach((item) => {
        const open = item === activeItem;
        item.section.classList.toggle("is-open", open);
        item.button.setAttribute("aria-expanded", String(open));
        item.panel.inert = !open;
      });
    };

    items.forEach((item) => {
      item.button.addEventListener("click", () => {
        const isOpen = item.button.getAttribute("aria-expanded") === "true";
        const nextItem = isOpen ? null : item;
        setOpen(nextItem);

        // When opening, reveal the newly expanded panel without scrolling on close.
        // Wait for the panel's grid-row expansion so the browser can calculate
        // its real height, and respect the user's reduced-motion preference.
        if (nextItem) {
          const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.setTimeout(() => {
            nextItem.panel.scrollIntoView({
              behavior: reduceMotion ? "auto" : "smooth",
              block: "nearest"
            });
          }, 360);
        }
      });
    });

    setOpen(null);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
