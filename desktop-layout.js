(() => {
  "use strict";

  const contactCard = document.querySelector(".wizard-card.contact-only");
  const intro = document.querySelector(".compact-intro");
  const scamReminder = document.querySelector(".scam-awareness-card");
  const divider = document.querySelector(".contact-divider");
  const collage = document.querySelector(".social-collage");
  const services = document.getElementById("services");
  const whyArisu = document.getElementById("why-choose-arisu");
  const destination = document.getElementById("desktopSocialDestination");

  if (!contactCard || !intro || !scamReminder || !divider || !collage || !services || !whyArisu || !destination) return;

  const makeText = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };

  // Reuse the existing intro and profile asset; do not duplicate the homepage or its content.
  const hero = document.createElement("section");
  hero.className = "home-redesign-hero";
  hero.setAttribute("aria-label", "Arisu Fix account recovery assistance");
  const heroCopy = document.createElement("div");
  heroCopy.className = "home-redesign-hero-copy";
  heroCopy.append(intro.querySelector(".eyebrow"), intro.querySelector("h1"));
  const heroMascot = document.createElement("div");
  heroMascot.className = "home-redesign-hero-mascot";
  const mascot = document.createElement("img");
  mascot.src = "arisu-profile.jpg";
  mascot.alt = "Arisu Fix profile mascot";
  mascot.width = 320;
  mascot.height = 320;
  mascot.loading = "eager";
  mascot.decoding = "async";
  heroMascot.append(mascot);
  hero.append(heroCopy, heroMascot);
  intro.remove();

  const cardDetails = [
    [".recovery-proofs-showcase", "Recovery Proofs", "See real account recovery outcomes and supporting previews."],
    [".social-feedback-card", "Customer Reviews", "Read feedback shared by people who have received assistance."],
    [".tiktok-showcase", "TikTok Arisu", "Visit Arisu's TikTok profile and featured updates."],
    [".facebook-showcase", "Facebook Page", "Visit the official Facebook page for updates and information."]
  ];

  // Order the four existing destinations without changing their links or lightbox controls.
  cardDetails.forEach(([selector, title, description]) => {
    const card = collage.querySelector(selector);
    if (!card) return;
    collage.append(card);
    const preview = card.querySelector("figure, .recovery-proofs-preview, .windows-feedback-content");
    if (!preview || card.querySelector(".home-feature-card-copy")) return;
    const copy = document.createElement("div");
    copy.className = "home-feature-card-copy";
    copy.append(makeText("h3", "home-feature-card-title", title));
    copy.append(makeText("p", "home-feature-card-description", description));
    card.insertBefore(copy, preview);
    card.classList.add("home-feature-card");
  });

  const explore = document.createElement("a");
  explore.className = "home-explore-more-card";
  explore.href = "about.html";
  explore.setAttribute("aria-label", "Explore more about Arisu Fix");
  const exploreCopy = document.createElement("span");
  exploreCopy.className = "home-explore-more-copy";
  exploreCopy.append(makeText("strong", "home-explore-more-title", "Explore More from Arisu Fix"));
  exploreCopy.append(makeText("span", "home-explore-more-description", "Learn more about the website, its purpose, and the person behind it."));
  const exploreAction = makeText("span", "home-explore-more-action", "Explore More");
  explore.append(exploreCopy, exploreAction);

  // Keep the original scam reminder intact, but place it after the social cards and Explore More.
  destination.replaceChildren(divider, collage, explore, scamReminder, services, whyArisu);
  contactCard.after(hero, destination);
})();
