(() => {
  "use strict";
  const contactCard = document.querySelector(".wizard-card.contact-only");
  const scamReminder = document.querySelector(".scam-awareness-card");
  const divider = document.querySelector(".contact-divider");
  const collage = document.querySelector(".social-collage");
  const services = document.getElementById("services");
  const whyArisu = document.getElementById("why-choose-arisu");
  const destination = document.getElementById("desktopSocialDestination");
  if (!contactCard || !scamReminder || !divider || !collage || !services || !whyArisu || !destination) return;

  // Keep the reminder in normal document flow and place it immediately before the social divider.
  // This avoids the scroll-reveal hidden state and preserves all other sections.
  destination.append(scamReminder, divider, collage, services, whyArisu);
  contactCard.after(destination);
})();
