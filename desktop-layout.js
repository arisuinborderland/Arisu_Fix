(() => {
  "use strict";
  const contactCard = document.querySelector(".wizard-card.contact-only");
  const connectSection = document.querySelector(".homepage-connect-layout");
  const services = document.getElementById("services");
  const whyArisu = document.getElementById("why-choose-arisu");
  const destination = document.getElementById("desktopSocialDestination");
  if (!contactCard || !connectSection || !services || !whyArisu || !destination) return;

  // Move the complete approved social + Scam Awareness section as one unit.
  // This keeps the same Connect → cards → Explore More → Scam Awareness order on every viewport.
  destination.replaceChildren();
  destination.append(connectSection, services, whyArisu);
  contactCard.after(destination);
})();
