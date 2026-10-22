const WHATSAPP_NUMBER = "639423212281"; // International format, digits only
const TIKTOK_PROFILE_URL = "https://www.tiktok.com/@arisuryohei2020";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/share/19gap1qLBf/";
const WHATSAPP_MESSAGE = "Hi Arisu! I found your contact through your website,\n\nhttps://arisufix.vercel.app/\n\nI’d like to inquire about your account recovery assistance.";

// Prefer the consumer WhatsApp app scheme from a direct user tap.
// Keep an HTTPS fallback for TikTok/in-app browsers that block custom schemes.
const whatsappAppUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

function configureWhatsAppLink(link) {
  if (!link) return;
  link.href = whatsappAppUrl;
  link.removeAttribute("target");
  link.setAttribute("rel", "noopener noreferrer");
}

configureWhatsAppLink(document.getElementById("whatsappLink"));
configureWhatsAppLink(document.getElementById("floatingMenuWhatsApp"));
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




})();


// Show a live Philippine Standard Time clock and inquiry status based on published hours.
// Formatters are created once. Only the seconds clock changes every second; availability and date
// labels are updated only when their displayed value changes, reducing mobile DOM work.
(() => {
  const headline = document.getElementById("serviceStatusHeadline");
  const pill = document.getElementById("serviceStatusPill");
  const pillText = document.getElementById("serviceStatusPillText");
  const clock = document.getElementById("serviceStatusClock");
  const updated = document.getElementById("serviceStatusUpdated");
  const statusDot = pill ? pill.querySelector(".service-status-dot") : null;
  if (!headline || !pill || !pillText || !clock || !updated) return;

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
      headline.textContent = isOpen ? "Available" : "Unavailable";
      headline.classList.toggle("is-offline", !isOpen);
      pillText.textContent = isOpen ? "Online" : "Offline";
      pill.classList.toggle("service-status-pill-closed", !isOpen);
      if (statusDot) statusDot.classList.toggle("is-offline", !isOpen);
      lastAvailability = isOpen;
    }

    const clockLabel = clockFormatter.format(now);
    if (clockLabel !== lastClockLabel) {
      clock.textContent = clockLabel;
      lastClockLabel = clockLabel;
    }

    const dateLabel = `${dateFormatter.format(now)} · GMT+8`;
    if (dateLabel !== lastDateLabel) {
      updated.textContent = dateLabel;
      lastDateLabel = dateLabel;
    }
  };

  refreshStatus();
  window.setInterval(refreshStatus, 1000);
})();

