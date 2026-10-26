// Recovery proof gallery. Add only real examples that you have permission to publish.
// Use category: "suspended", "disabled", "2fa", or "instagram-hacked" for each item.
const recoveryProofs = [
  {
    category: "suspended",
    title: "Suspended Account — 180 Days",
    image: "proofs/arisu-suspended-account-180-days.jpg?v=AFV267",
    alt: "Arisu Fix recovery proof collage showing a Facebook suspension notice and related social profile, with the supplied recovery-proof watermark",
    violation: "Account Integrity"
  },
  {
    category: "suspended",
    title: "Suspended Account — Rejected ID",
    showDate: false,
    image: "proofs/a_polished_professional_social_media_style_evide.png",
    alt: "Arisu Fix recovery proof collage showing a rejected Facebook ID verification attempt and associated profile; full name and Instagram username blurred, with Arisu Fix watermark and profile icon",
    date: "October 23, 2026",
    violation: "Rejected ID Verification"
  },
  {
    category: "disabled",
    title: "Disabled Account",
    image: "proofs/file_0000000089048211995f9a93297d1146.png",
    alt: "Public case example showing a disabled Facebook account notice and a related profile screenshot; personal details are blurred in the supplied image",
    violation: "Account Integrity"
  },
  {
    category: "2fa",
    title: "Two Factor Authentication (2FA)",
    image: "proofs/file_00000000d2ec82119d478f27dc7e07cf.png",
    coverImage: "proofs/file_00000000d2ec82119d478f27dc7e07cf.png",
    alt: "Arisu Fix Two-Factor Authentication case artwork dated October 16, 2026",
    date: "October 16, 2026",
    violation: "Two-Factor Authentication"
  },
  {
    category: "instagram-hacked",
    title: "Instagram Account Hacked",
    image: "proofs/ArisuFix_Instagram_Hacked_Preview_Footer_Refined.jpg?v=AFV268",
    coverImage: "proofs/ArisuFix_Instagram_Hacked_Preview_Footer_Refined.jpg?v=AFV268",
    showDate: false,
    showWatermark: false,
    alt: "Arisu Fix Instagram hacked account recovery proof collage with two screenshots and branded case footer"
  }
];

const PROOFS_PER_PAGE = 6; // Mobile back button follows the proof image
let activeProofCategory = "all";
let activeProofPage = 1;
let proofSearchTerm = "";
let showAlbumCardsForCategory = false;

function renderRecoveryProofs() {
  const gallery = document.getElementById("proofGallery");
  const empty = document.getElementById("proofEmpty");
  const pagination = document.getElementById("proofPagination");
  if (!gallery || !empty || !pagination) return;

  const validProofs = recoveryProofs.filter((proof) => proof && proof.title && (proof.image || proof.video));
  const filtered = validProofs.filter((proof) =>
    activeProofCategory === "all" || proof.category === activeProofCategory
  );

  const countFor = (category) => validProofs.filter((proof) => category === "all" || proof.category === category).length;
  [["allProofCount", "all"], ["suspendedProofCount", "suspended"], ["disabledProofCount", "disabled"], ["twoFaProofCount", "2fa"], ["instagramHackedProofCount", "instagram-hacked"]].forEach(([id, category]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = String(countFor(category));
  });

  // Album landing view: keep the page compact as more proof images are added.
  const showAlbumOverview = activeProofCategory === "all" || showAlbumCardsForCategory;
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
      { category: "disabled", title: "Disabled Accounts", description: "Disabled-account notices and related case examples.", icon: "disabled" },
      { category: "2fa", title: "Two Factor Authentication (2FA)", description: "Examples and updates related to two-factor authentication access issues.", icon: "2fa" },
      { category: "instagram-hacked", title: "Instagram Accounts Hacked", description: "Examples of hacked Instagram account recovery cases.", icon: "instagram-hacked", coverImage: "proofs/ArisuFix_Instagram_Hacked_Preview_Footer_Refined.jpg?v=AFV268" }
    ];
    const visibleAlbums = activeProofCategory === "all"
      ? albums
      : albums.filter((album) => album.category === activeProofCategory);
    visibleAlbums.forEach((album) => {
      const items = validProofs.filter((proof) => proof.category === album.category);
      const card = document.createElement("article");
      card.className = `proof-album-card proof-album-${album.icon}`;
      const cover = document.createElement("div");
      cover.className = "proof-album-cover";
      const previewImages = album.coverImage
        ? [album.coverImage]
        : (album.icon === "2fa" && items[0]?.coverImage
          ? [items[0].coverImage]
          : (items[0]?.image ? [items[0].image] : []));
      if (previewImages.length > 1) {
        const previewPair = document.createElement("div");
        previewPair.className = "proof-album-preview-pair proof-album-preview-pair-2fa";
        previewPair.setAttribute("aria-label", "Two Factor Authentication screenshots shown side by side");
        previewImages.forEach((src, index) => {
          const img = document.createElement("img");
          img.src = src;
          img.alt = "";
          img.loading = "lazy";
          img.decoding = "async";
          img.draggable = false;
          img.className = `proof-album-preview-image proof-album-preview-image-${index + 1}`;
          previewPair.appendChild(img);
        });
        cover.appendChild(previewPair);
      } else if (previewImages.length === 1) {
        const img = document.createElement("img");
        img.src = previewImages[0];
        img.alt = "";
        img.loading = "lazy";
        img.draggable = false;
        cover.appendChild(img);
      } else if (items[0]?.image) {
        const img = document.createElement("img");
        img.src = items[0].image;
        img.alt = "";
        img.loading = "lazy";
        img.draggable = false;
        cover.appendChild(img);
      }
      if (album.icon === "2fa" && !items[0]?.image) {
        const securityMark = document.createElement("span");
        securityMark.className = "proof-album-security-mark";
        securityMark.setAttribute("aria-hidden", "true");
        securityMark.innerHTML = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M32 5 52 13v15c0 13-8 23-20 30C20 51 12 41 12 28V13L32 5Z"/><rect x="22" y="27" width="20" height="16" rx="3"/><path d="M26 27v-5a6 6 0 0 1 12 0v5M32 33v4"/></svg>';
        cover.appendChild(securityMark);
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
      const folderIcon = document.createElement("span");
      folderIcon.className = "proof-album-folder-icon";
      folderIcon.setAttribute("aria-hidden", "true");
      folderIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.5 6.5A2.5 2.5 0 0 1 6 4h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>';
      const eyebrowText = document.createElement("span");
      eyebrowText.textContent = "PROOF ALBUM";
      eyebrow.append(folderIcon, eyebrowText);
      const heading = document.createElement("h2");
      heading.textContent = album.title;
      const description = document.createElement("p");
      description.textContent = album.icon === "suspended"
        ? "Examples for suspended Facebook accounts."
        : album.icon === "disabled"
          ? "Examples for disabled Facebook accounts."
          : album.icon === "2fa"
            ? "Examples for 2FA and login-related cases."
            : "Examples of hacked Instagram account recovery cases.";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "proof-album-open";
      button.textContent = "View album →";
      button.disabled = items.length === 0 && !["2fa", "instagram-hacked"].includes(album.category);
      button.addEventListener("click", () => {
        activeProofCategory = album.category;
        showAlbumCardsForCategory = false;
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
  const emptyHeading = empty.querySelector("h3");
  const emptyDescription = empty.querySelector("p");
  if (["2fa", "instagram-hacked"].includes(activeProofCategory) && !filtered.length && emptyHeading && emptyDescription) {
    emptyHeading.textContent = activeProofCategory === "2fa" ? "Two Factor Authentication (2FA)" : "Instagram Accounts Hacked";
    emptyDescription.textContent = "This album is ready. Add approved screenshots and customer-approved examples here when they are available.";
  } else if (emptyHeading && emptyDescription) {
    emptyHeading.textContent = "No matching proofs found";
    emptyDescription.textContent = "Try another search term or choose a different category.";
  }

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
    } else if (Array.isArray(proof.images) && proof.images.length > 1) {
      media = document.createElement("div");
      media.className = "proof-image-pair";
      proof.images.forEach((src, index) => {
        const image = document.createElement("img");
        image.src = src;
        image.alt = `${proof.alt || proof.title} — screenshot ${index + 1} of ${proof.images.length}`;
        image.draggable = false;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => { image.hidden = true; });
        media.appendChild(image);
      });
    } else {
      imageFrame.classList.add("proof-image-full");
      media = document.createElement("img");
      media.src = proof.image;
      media.alt = proof.alt || proof.title;
      media.draggable = false;
      media.loading = "lazy";
      media.decoding = "async";
      media.addEventListener("error", () => { card.hidden = true; });
    }

    if (proof.showWatermark !== false) {
      const watermark = document.createElement("span");
      watermark.className = "proof-watermark";
      watermark.setAttribute("aria-hidden", "true");
      watermark.textContent = "ARISU RECOVERY CONTACT  •  PUBLIC EXAMPLE";
      imageFrame.append(media, watermark);
    } else {
      imageFrame.appendChild(media);
    }

    const copy = document.createElement("div");
    copy.className = "proof-card-copy";
    if (proof.date && proof.showDate !== false) {
      const date = document.createElement("span");
      date.className = "proof-card-date";
      date.textContent = proof.date;
      copy.appendChild(date);
    }
    if (!copy.childElementCount) copy.hidden = true;

    card.append(copy, imageFrame);
    gallery.appendChild(card);
  });

  if (visibleProofs.length) {
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
    gallery.appendChild(updatesCard);

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "proof-album-back proof-album-back-inline";
    backButton.textContent = "← Back to albums";
    backButton.addEventListener("click", () => {
      activeProofCategory = "all";
      activeProofPage = 1;
      proofSearchTerm = "";
      document.querySelectorAll("[data-proof-filter]").forEach((other) => {
        const active = other.dataset.proofFilter === "all";
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      renderRecoveryProofs();
      document.querySelector(".proof-browser")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    gallery.appendChild(backButton);
  }

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

document.querySelectorAll("[data-proof-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeProofCategory = button.dataset.proofFilter || "all";
    showAlbumCardsForCategory = activeProofCategory !== "all";
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
