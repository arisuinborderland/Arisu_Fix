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

const PROOFS_PER_PAGE = 6; // Mobile back button follows the proof image
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
