const WHATSAPP_NUMBER = "639423212281"; // International format, digits only
const TIKTOK_PROFILE_URL = "https://www.tiktok.com/@arisuryohei2020";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/share/19gap1qLBf/";
const WHATSAPP_MESSAGE = "Hi Arisu, I would like help with my account issue.";

// Prefer the consumer WhatsApp app scheme from a direct user tap.
// Keep an HTTPS fallback for TikTok/in-app browsers that block custom schemes.
const whatsappAppUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const whatsappWebUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

function configureWhatsAppLink(link) {
  if (!link) return;
  link.href = whatsappAppUrl;
  link.removeAttribute("target");
  link.setAttribute("rel", "noopener noreferrer");
}

configureWhatsAppLink(document.getElementById("whatsappLink"));
configureWhatsAppLink(document.getElementById("floatingMenuWhatsApp"));
// The floating control is a menu toggle button; its WhatsApp shortcut is configured separately.
const whatsappWebFallback = document.getElementById("whatsappWebFallback");
if (whatsappWebFallback) whatsappWebFallback.href = whatsappWebUrl;

// Keep social links as normal HTTPS URLs for compatibility with in-app browsers.
const tiktokCard = document.querySelector(".tiktok-showcase");
if (tiktokCard) {
  tiktokCard.href = TIKTOK_PROFILE_URL;
  tiktokCard.removeAttribute("target");
  tiktokCard.setAttribute("rel", "noopener noreferrer");
}

const facebookCard = document.querySelector(".facebook-showcase");
if (facebookCard) {
  facebookCard.href = FACEBOOK_PAGE_URL;
  facebookCard.removeAttribute("target");
  facebookCard.setAttribute("rel", "noopener noreferrer");
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

// Keep the FAQ tidy on mobile: opening one answer closes the others.
const faqItems = Array.from(document.querySelectorAll(".faq-list details"));
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => { if (other !== item) other.open = false; });
  });
});

// Give keyboard users a visible focus state and prevent accidental duplicate setup.
document.documentElement.classList.add("js-ready");

// Mobile scroll performance: pause decorative infinite animations while the page is moving.
// Scroll-reveal transitions are CSS transitions, so the requested up/down reveal still works.
(() => {
  const root = document.documentElement;
  let resumeTimer = 0;
  window.addEventListener("scroll", () => {
    root.classList.add("arc-is-scrolling");
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      root.classList.remove("arc-is-scrolling");
    }, 150);
  }, { passive: true });
})();

// Recovery proof gallery. Add only real examples that you have permission to publish.
// Use category: "suspended" or category: "disabled" for each item.
const recoveryProofs = [
  {
    category: "suspended",
    title: "Suspended Account — 180 Days",
    image: "proofs/6707.jpg",
    alt: "Watermarked example screenshot showing a Facebook account suspension notice beside a profile page",
    violation: "Account Integrity"
  },
  {
    category: "disabled",
    title: "Disabled Account",
    image: "proofs/disabled-account-integrity.jpg",
    alt: "Public case example showing a disabled Facebook account notice and a related profile screenshot; personal details are blurred in the supplied image",
    violation: "Account Integrity"
  }
];

const PROOFS_PER_PAGE = 6; // Version 29: mobile back button follows the proof image
let activeProofCategory = "all";
let activeProofPage = 1;
let proofSearchTerm = "";

function renderRecoveryProofs() {
  const gallery = document.getElementById("proofGallery");
  const empty = document.getElementById("proofEmpty");
  const pagination = document.getElementById("proofPagination");
  if (!gallery || !empty || !pagination) return;

  const validProofs = recoveryProofs.filter((proof) => proof && proof.title && (proof.image || proof.video));
  const normalizedSearch = proofSearchTerm.trim().toLocaleLowerCase();
  const filtered = validProofs.filter((proof) => {
    const categoryMatches = activeProofCategory === "all" || proof.category === activeProofCategory;
    const searchable = [proof.title, proof.violation, proof.alt, proof.date, proof.category].filter(Boolean).join(" ").toLocaleLowerCase();
    return categoryMatches && (!normalizedSearch || searchable.includes(normalizedSearch));
  });

  const countFor = (category) => validProofs.filter((proof) => category === "all" || proof.category === category).length;
  [["allProofCount", "all"], ["suspendedProofCount", "suspended"], ["disabledProofCount", "disabled"]].forEach(([id, category]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = String(countFor(category));
  });

  // Album landing view: keep the page compact as more proof images are added.
  const showAlbumOverview = activeProofCategory === "all" && !normalizedSearch;
  // Keep Back to site on the album landing view only, not beneath an open proof.
  const backToSiteLink = document.querySelector(".proofs-back-to-site");
  if (backToSiteLink) backToSiteLink.hidden = !showAlbumOverview;
  if (showAlbumOverview) {
    gallery.classList.remove("is-single", "is-two");
    gallery.classList.add("proof-album-grid");
    gallery.replaceChildren();
    empty.hidden = true;
    pagination.replaceChildren();
    pagination.hidden = true;
    const resultsText = document.getElementById("proofResultsText");
    if (resultsText) resultsText.textContent = "Choose an album to browse its examples";

    const albums = [
      { category: "suspended", title: "Suspended Accounts", description: "Suspension notices and related account-status examples.", icon: "suspended" },
      { category: "disabled", title: "Disabled Accounts", description: "Disabled-account notices and related case examples.", icon: "disabled" }
    ];
    albums.forEach((album) => {
      const items = validProofs.filter((proof) => proof.category === album.category);
      const card = document.createElement("article");
      card.className = `proof-album-card proof-album-${album.icon}`;
      const cover = document.createElement("div");
      cover.className = "proof-album-cover";
      if (items[0]?.image) {
        const img = document.createElement("img");
        img.src = items[0].image;
        img.alt = "";
        img.loading = "lazy";
        img.draggable = false;
        cover.appendChild(img);
      }
      const coverShade = document.createElement("span");
      coverShade.className = "proof-album-cover-shade";
      cover.appendChild(coverShade);
      const badge = document.createElement("span");
      badge.className = "proof-album-count";
      badge.textContent = `${items.length} ${items.length === 1 ? "proof" : "proofs"}`;
      cover.appendChild(badge);
      const copy = document.createElement("div");
      copy.className = "proof-album-copy";
      const eyebrow = document.createElement("span");
      eyebrow.className = "proof-album-eyebrow";
      eyebrow.textContent = "PROOF ALBUM";
      const heading = document.createElement("h2");
      heading.textContent = album.title;
      const description = document.createElement("p");
      description.textContent = album.description;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "proof-album-open";
      button.textContent = "View album →";
      button.disabled = items.length === 0;
      button.addEventListener("click", () => {
        activeProofCategory = album.category;
        activeProofPage = 1;
        document.querySelectorAll("[data-proof-filter]").forEach((other) => {
          const active = other.dataset.proofFilter === album.category;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });
        renderRecoveryProofs();
        document.querySelector(".proof-browser")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      copy.append(eyebrow, heading, description, button);
      card.append(cover, copy);
      gallery.appendChild(card);
    });
    return;
  }
  gallery.classList.remove("proof-album-grid");

  const pageCount = Math.max(1, Math.ceil(filtered.length / PROOFS_PER_PAGE));
  activeProofPage = Math.min(activeProofPage, pageCount);
  const startIndex = (activeProofPage - 1) * PROOFS_PER_PAGE;
  const visibleProofs = filtered.slice(startIndex, startIndex + PROOFS_PER_PAGE);
  gallery.classList.toggle("is-single", visibleProofs.length === 1);
  gallery.classList.toggle("is-two", visibleProofs.length === 2);
  gallery.replaceChildren();
  empty.hidden = filtered.length !== 0;

  const resultsText = document.getElementById("proofResultsText");
  if (resultsText) {
    resultsText.textContent = filtered.length
      ? `Showing ${startIndex + 1}–${Math.min(startIndex + PROOFS_PER_PAGE, filtered.length)} of ${filtered.length} ${filtered.length === 1 ? "proof" : "proofs"}`
      : "No results";
  }

  visibleProofs.forEach((proof) => {
    const card = document.createElement("article");
    card.className = "proof-card";
    const imageFrame = document.createElement("div");
    imageFrame.className = "proof-image-link proof-image-protected";
    imageFrame.setAttribute("role", proof.video ? "group" : "img");
    imageFrame.setAttribute("aria-label", proof.alt || proof.title);

    let media;
    if (proof.video) {
      media = document.createElement("video");
      media.src = proof.video;
      media.controls = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.controlsList = "nodownload noplaybackrate";
      media.disablePictureInPicture = true;
      media.setAttribute("aria-label", proof.alt || proof.title);
      media.classList.add("proof-video-media");
    } else {
      media = document.createElement("img");
      media.src = proof.image;
      media.alt = proof.alt || proof.title;
      media.draggable = false;
      media.loading = "lazy";
      media.decoding = "async";
    }
    media.addEventListener("error", () => { card.hidden = true; });

    const watermark = document.createElement("span");
    watermark.className = "proof-watermark";
    watermark.setAttribute("aria-hidden", "true");
    watermark.textContent = "ARISU RECOVERY CONTACT  •  PUBLIC EXAMPLE";
    imageFrame.append(media, watermark);

    const copy = document.createElement("div");
    copy.className = "proof-card-copy";
    const statusList = document.createElement("div");
    statusList.className = "proof-status-list";
    const makeStatus = (kind, label, value, svgMarkup) => {
      const row = document.createElement("div");
      row.className = `proof-status-item proof-status-${kind}`;
      const icon = document.createElement("span");
      icon.className = "proof-status-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = svgMarkup;
      const text = document.createElement("span");
      text.className = "proof-status-text";
      const small = document.createElement("span");
      small.className = "proof-status-label";
      small.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      text.append(small, strong);
      row.append(icon, text);
      return row;
    };
    const lockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/></svg>';
    const shieldIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>';
    statusList.append(
      makeStatus(proof.category === "disabled" ? "disabled" : "suspended", "ACCOUNT STATUS", proof.title, lockIcon),
      makeStatus("violation", "VIOLATION", proof.violation || "Not specified", shieldIcon)
    );
    copy.appendChild(statusList);
    if (proof.date) {
      const date = document.createElement("span");
      date.className = "proof-card-date";
      date.textContent = proof.date;
      copy.appendChild(date);
    }
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "proof-album-back proof-album-back-inline";
    backButton.textContent = "← Back to albums";
    backButton.addEventListener("click", () => {
      activeProofCategory = "all";
      activeProofPage = 1;
      proofSearchTerm = "";
      const searchInput = document.getElementById("proofSearch");
      if (searchInput) searchInput.value = "";
      document.querySelectorAll("[data-proof-filter]").forEach((other) => {
        const active = other.dataset.proofFilter === "all";
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      renderRecoveryProofs();
      document.querySelector(".proof-browser")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const updatesCard = document.createElement("section");
    updatesCard.className = "proof-updates-coming";
    updatesCard.setAttribute("aria-labelledby", "proof-updates-coming-title");
    const updatesIcon = document.createElement("span");
    updatesIcon.className = "proof-updates-coming-icon";
    updatesIcon.setAttribute("aria-hidden", "true");
    updatesIcon.textContent = "✦";
    const updatesCopy = document.createElement("div");
    updatesCopy.className = "proof-updates-coming-copy";
    const updatesEyebrow = document.createElement("span");
    updatesEyebrow.className = "proof-updates-coming-eyebrow";
    updatesEyebrow.textContent = "UPCOMING";
    const updatesHeading = document.createElement("h2");
    updatesHeading.id = "proof-updates-coming-title";
    updatesHeading.textContent = "More Updates Coming Soon";
    const updatesSubtitle = document.createElement("h3");
    updatesSubtitle.textContent = "Recovery Proofs & Customer Reviews";
    const updatesDescription = document.createElement("p");
    updatesDescription.textContent = "New content and improvements are in progress. More recovery proofs and customer reviews will be added as they become available.";
    updatesCopy.append(updatesEyebrow, updatesHeading, updatesSubtitle, updatesDescription);
    updatesCard.append(updatesIcon, updatesCopy);

    card.append(copy, imageFrame, updatesCard, backButton);
    gallery.appendChild(card);
  });

  pagination.replaceChildren();
  pagination.hidden = pageCount <= 1;
  if (pageCount > 1) {
    const addPageButton = (label, page, options = {}) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `proof-page-button${options.current ? " is-current" : ""}`;
      button.textContent = label;
      button.disabled = Boolean(options.disabled);
      if (options.current) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => {
        activeProofPage = page;
        renderRecoveryProofs();
        document.querySelector(".proof-browser")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      pagination.appendChild(button);
    };
    addPageButton("Previous", Math.max(1, activeProofPage - 1), { disabled: activeProofPage === 1 });
    for (let page = 1; page <= pageCount; page += 1) addPageButton(String(page), page, { current: page === activeProofPage });
    addPageButton("Next", Math.min(pageCount, activeProofPage + 1), { disabled: activeProofPage === pageCount });
  }
}

const proofSearch = document.getElementById("proofSearch");
if (proofSearch) {
  proofSearch.addEventListener("input", () => {
    proofSearchTerm = proofSearch.value;
    activeProofPage = 1;
    renderRecoveryProofs();
  });
}
document.querySelectorAll("[data-proof-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeProofCategory = button.dataset.proofFilter || "all";
    activeProofPage = 1;
    document.querySelectorAll("[data-proof-filter]").forEach((other) => {
      const active = other === button;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    renderRecoveryProofs();
  });
});
renderRecoveryProofs();

// Daily Bible Verse: calculated locally from the calendar date; no API, account, or tracking required.
(function setupDailyBibleVerse() {
  const card = document.getElementById("daily-bible-verse");
  if (!card) return;

  // Daily verse text is from the public-domain World English Bible (WEB).
  // This is a small local daily-verse collection (not the complete 66-book reader database).
  // The Filipino lines below are informal renderings, not quotations from a published Filipino translation.
  const verses = [
    { ref: "Psalm 23:1", en: "The LORD is my shepherd; I shall lack nothing.", tl: "Ang Panginoon ang aking pastol; hindi ako magkukulang." },
    { ref: "Proverbs 3:5", en: "Trust in the LORD with all your heart, and don't lean on your own understanding.", tl: "Magtiwala ka sa Panginoon nang buong puso, at huwag umasa lamang sa sariling pagkaunawa." },
    { ref: "Philippians 4:13", en: "I can do all things through Christ, who strengthens me.", tl: "Magagawa ko ang mga bagay sa pamamagitan ni Cristo na nagbibigay sa akin ng lakas." },
    { ref: "Psalm 46:1", en: "God is our refuge and strength, a very present help in trouble.", tl: "Ang Diyos ang ating kanlungan at lakas, laging handang tumulong sa panahon ng kaguluhan." },
    { ref: "Matthew 11:28", en: "Come to me, all you who labor and are heavily burdened, and I will give you rest.", tl: "Lumapit kayo sa akin, kayong napapagal at nabibigatan, at bibigyan ko kayo ng kapahingahan." },
    { ref: "Joshua 1:9", en: "Haven't I commanded you? Be strong and courageous. Don't be afraid, neither be dismayed, for the LORD your God is with you wherever you go.", tl: "Magpakatatag at magpakatapang; huwag matakot, sapagkat kasama mo ang Panginoon saan ka man pumunta." },
    { ref: "Psalm 119:105", en: "Your word is a lamp to my feet, and a light for my path.", tl: "Ang salita ng Diyos ay ilawan sa aking mga paa at liwanag sa aking landas." },
    { ref: "Romans 8:28", en: "We know that all things work together for good for those who love God, to those who are called according to his purpose.", tl: "Alam natin na gumagawa ang Diyos sa lahat ng bagay para sa ikabubuti ng mga umiibig sa Kanya." },
    { ref: "Isaiah 41:10", en: "Don't you be afraid, for I am with you. Don't be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness.", tl: "Huwag kang matakot, sapagkat kasama mo ako; huwag manghina, sapagkat ako ang iyong Diyos." },
    { ref: "John 14:27", en: "Peace I leave with you. My peace I give to you; not as the world gives, I give to you. Don't let your heart be troubled, neither let it be fearful.", tl: "Iniiwan ko sa inyo ang kapayapaan; ibinibigay ko ang aking kapayapaan. Huwag mabalisa o matakot ang inyong puso." },
    { ref: "Psalm 34:8", en: "Oh taste and see that the LORD is good. Blessed is the man who takes refuge in him.", tl: "Tikman at tingnan ninyo kung gaano kabuti ang Panginoon; mapalad ang nagtitiwala sa Kanya." },
    { ref: "1 Corinthians 16:14", en: "Let all that you do be done in love.", tl: "Gawin ninyo ang lahat ng bagay nang may pag-ibig." },
    { ref: "Psalm 37:4", en: "Also delight yourself in the LORD, and he will give you the desires of your heart.", tl: "Magalak ka sa Panginoon, at bibigyan Niya ang mga hangarin ng iyong puso ayon sa Kanyang kalooban." },
    { ref: "Micah 6:8", en: "He has shown you, O man, what is good. What does the LORD require of you, but to act justly, to love mercy, and to walk humbly with your God?", tl: "Nais ng Panginoon na gumawa ka ng makatarungan, magmahal ng awa, at lumakad nang mapagpakumbaba kasama ng iyong Diyos." },
    { ref: "1 Peter 5:7", en: "Casting all your worries on him, because he cares for you.", tl: "Ipagkatiwala ninyo sa Kanya ang lahat ng inyong alalahanin, sapagkat nagmamalasakit Siya sa inyo." },
    { ref: "Psalm 27:1", en: "The LORD is my light and my salvation. Whom shall I fear? The LORD is the strength of my life. Of whom shall I be afraid?", tl: "Ang Panginoon ang aking liwanag at kaligtasan; sino ang aking katatakutan?" },
    { ref: "Romans 12:12", en: "Rejoicing in hope; enduring in troubles; continuing steadfastly in prayer.", tl: "Magalak sa pag-asa, magtiis sa paghihirap, at magpatuloy sa pananalangin." },
    { ref: "John 16:33", en: "In the world you have trouble; but cheer up! I have overcome the world.", tl: "Lakasan ninyo ang inyong loob; nagtagumpay na ako laban sa sanlibutan." },
    { ref: "Psalm 56:3", en: "When I am afraid, I will put my trust in you.", tl: "Kapag ako ay natatakot, magtitiwala ako sa Iyo." },
    { ref: "Colossians 3:23", en: "And whatever you do, work heartily, as for the LORD, and not for men.", tl: "Anuman ang inyong gawin, gawin ito nang buong puso na para sa Panginoon at hindi lamang para sa tao." }
  ];

  const dateEl = document.getElementById("dailyVerseDate");
  const textEl = document.getElementById("dailyVerseText");
  const referenceEl = document.getElementById("dailyVerseReference");
  const translationEl = document.getElementById("dailyVerseTranslation");

  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dayNumber = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
  };
  const dailyIndex = () => dayNumber(new Date()) % verses.length;
  const renderDailyVerse = () => {
    const verse = verses[dailyIndex()];
    textEl.textContent = verse.en;
    referenceEl.textContent = `${verse.ref} · WEB`;
    translationEl.textContent = verse.tl;
    dateEl.textContent = `VERSE OF THE DAY · ${dateKey(new Date())}`;
  };

  // Refresh the daily selection if the page remains open across local midnight.
  let lastDate = dateKey(new Date());
  window.setInterval(() => {
    const currentDate = dateKey(new Date());
    if (currentDate !== lastDate) {
      lastDate = currentDate;
      renderDailyVerse();
    }
  }, 60000);

  renderDailyVerse();

  // Full-size image viewer for real screenshots added to the review slots.
  const reviewLightbox = document.getElementById("reviewLightbox");
  const reviewLightboxImage = document.getElementById("reviewLightboxImage");
  const reviewLightboxClose = document.getElementById("reviewLightboxClose");
  const closeReviewLightbox = () => {
    if (!reviewLightbox || reviewLightbox.hidden) return;
    reviewLightbox.hidden = true;
    if (reviewLightboxImage) {
      reviewLightboxImage.style.backgroundImage = "none";
      reviewLightboxImage.setAttribute("aria-label", "Enlarged customer review screenshot");
    }
    document.body.classList.remove("review-lightbox-open");
  };
  document.querySelectorAll(".review-proof-image:not(.is-placeholder) img").forEach((image) => {
    const button = image.closest(".review-proof-image");
    if (!button) return;
    button.addEventListener("click", () => {
      if (!reviewLightbox || !reviewLightboxImage) return;
      // Render the enlarged image as a CSS background rather than an <img> element,
      // so mobile browsers are less likely to expose their native image save menu.
      const imageUrl = image.currentSrc || image.src;
      reviewLightboxImage.style.backgroundImage = `url("${imageUrl.replace(/["\\]/g, "\\$&")}")`;
      reviewLightboxImage.setAttribute("aria-label", image.alt || "Customer review screenshot");
      reviewLightbox.hidden = false;
      document.body.classList.add("review-lightbox-open");
      if (reviewLightboxClose) reviewLightboxClose.focus();
    });
  });
  if (reviewLightboxClose) reviewLightboxClose.addEventListener("click", closeReviewLightbox);
  if (reviewLightbox) reviewLightbox.addEventListener("click", (event) => {
    if (event.target === reviewLightbox) closeReviewLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeReviewLightbox();
  });


})();


// V_135: show a live Philippine Standard Time clock and inquiry status based on published hours.
// Formatters are created once. Only the seconds clock changes every second; availability and date
// labels are updated only when their displayed value changes, reducing mobile DOM work.
(() => {
  const headline = document.getElementById("serviceStatusHeadline");
  const pill = document.getElementById("serviceStatusPill");
  const description = document.getElementById("serviceStatusDescription");
  const clock = document.getElementById("serviceStatusClock");
  const updated = document.getElementById("serviceStatusUpdated");
  const statusDot = document.querySelector(".service-status-dot");
  if (!headline || !pill || !description || !clock || !updated) return;

  const statusTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });
  const clockFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
  });
  const dateFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila", weekday: "short", month: "short", day: "numeric", year: "numeric"
  });

  let lastAvailability = null;
  let lastDateLabel = "";
  let lastClockLabel = "";

  const refreshStatus = () => {
    const now = new Date();
    const [hourText = "0", minuteText = "0"] = statusTimeFormatter.format(now).split(":");
    const totalMinutes = Number(hourText) * 60 + Number(minuteText);
    const isOpen = totalMinutes >= 420 && totalMinutes < 1320;

    if (lastAvailability !== isOpen) {
      headline.textContent = isOpen ? "Available" : "Offline";
      headline.classList.toggle("is-offline", !isOpen);
      pill.textContent = isOpen ? "Online" : "Offline";
      description.textContent = isOpen
        ? "You can message me on WhatsApp for account recovery assistance. I reply during my available hours."
        : "You can still send me a WhatsApp message. I resume replies at 7:00 AM Philippine Time.";
      pill.classList.toggle("service-status-pill-closed", !isOpen);
      if (statusDot) statusDot.classList.toggle("is-offline", !isOpen);
      lastAvailability = isOpen;
    }

    const clockLabel = clockFormatter.format(now);
    if (clockLabel !== lastClockLabel) {
      clock.textContent = clockLabel;
      lastClockLabel = clockLabel;
    }

    const dateLabel = `${dateFormatter.format(now)} · GMT+8 · Auto-updated`;
    if (dateLabel !== lastDateLabel) {
      updated.textContent = dateLabel;
      lastDateLabel = dateLabel;
    }
  };

  refreshStatus();
  window.setInterval(refreshStatus, 1000);
})();


// Keep preview and proof images consistent for both static and dynamically added content.
(() => {
  const protectedSelector = [
    ".social-profile-preview", ".tiktok-profile-preview", ".facebook-page-preview",
    ".recovery-proofs-preview", ".recovery-proof-preview-item", ".reviews-grid-featured",
    ".review-proof-image", ".proof-gallery", ".proof-image-link", ".proof-card",
    ".reviews-gallery", ".review-card", ".review-image-link", ".review-proof-card",
    ".review-lightbox-image", ".review-lightbox"
  ].join(", ");
  const inProtectedArea = (target) => target instanceof Element && Boolean(target.closest(protectedSelector));
  document.addEventListener("contextmenu", (event) => {
    if (inProtectedArea(event.target)) event.preventDefault();
  }, true);
  document.addEventListener("dragstart", (event) => {
    if (inProtectedArea(event.target)) event.preventDefault();
  }, true);
  document.addEventListener("touchstart", (event) => {
    if (inProtectedArea(event.target)) {
      const el = event.target.closest("img, .review-lightbox-image");
      if (el) el.style.webkitTouchCallout = "none";
    }
  }, { passive: true, capture: true });
  const protectImages = (root = document) => {
    root.querySelectorAll?.(`${protectedSelector} img`).forEach((img) => {
      img.draggable = false;
      img.style.webkitUserDrag = "none";
      img.style.webkitTouchCallout = "none";
      img.style.userSelect = "none";
      img.style.webkitUserSelect = "none";
    });
  };
  protectImages();
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) protectImages(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();


// ArisuV222: CSS-driven continuous expanding ring; no JS class/timer dependency.
(function initArisuFloatingMenu(){
 const menu=document.getElementById('floatingMenu');
 const toggle=document.getElementById('floatingWhatsApp');
 const items=document.getElementById('floatingMenuItems');
 if(!menu||!toggle||!items)return;
 function closeMenu(){menu.dataset.state='closed';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open quick access menu');items.hidden=true;}
 function openMenu(){menu.dataset.state='open';toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close quick access menu');items.hidden=false;}
 // Pulse is CSS-driven from data-state="closed"; no class or timer is needed.
 toggle.addEventListener('click',()=>{if(menu.dataset.state==='open')closeMenu();else openMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.dataset.state==='open'){closeMenu();toggle.focus();}});
 // Close on a tap outside the visible menu card, including its padding/border.
 // The card itself lives inside #floatingMenu, so checking only menu.contains()
 // incorrectly treats taps on the empty card surface as inside-item interactions.
 function isShortcutOrToggle(target){
  return !!(target && target.closest && (target.closest('.floating-menu-item') || target.closest('#floatingWhatsApp')));
 }
 function handleOutsideTap(e){
  if(menu.dataset.state==='open' && !isShortcutOrToggle(e.target)) closeMenu();
 }
 // Capture phase avoids interference from page elements that stop event bubbling.
 document.addEventListener('pointerdown',handleOutsideTap,true);
 // Fallback for browsers/devices that do not dispatch Pointer Events.
 if(!('PointerEvent' in window)) document.addEventListener('click',handleOutsideTap,true);
})();
