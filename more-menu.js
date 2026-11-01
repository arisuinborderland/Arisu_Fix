/* AFV402 — shared compact More menu for all public pages */
(() => {
  'use strict';

  const initMoreMenu = () => {
    const nav = document.querySelector('nav.mobile-bottom-nav');
    if (!nav || document.getElementById('arisuMoreMenu')) return;

    // Move the two header destinations into More on every page.
    document.querySelectorAll(
      'header.topbar .privacy-link, header.topbar .about-header-link, header.topbar .privacy-about-link'
    ).forEach((link) => link.remove());

    const contactLink = nav.querySelector('a[aria-label="Contact Arisu"], a[aria-label="Contact"]');
    if (!contactLink) return;

    const moreButton = document.createElement('button');
    moreButton.type = 'button';
    moreButton.className = 'mobile-nav-item mobile-nav-more';
    moreButton.setAttribute('aria-label', 'More options');
    moreButton.setAttribute('aria-expanded', 'false');
    moreButton.setAttribute('aria-controls', 'arisuMoreMenu');
    moreButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle></svg><span>More</span>';
    contactLink.replaceWith(moreButton);

    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = '/more-menu.css?v=AFV402&side-inset=match';
    document.head.appendChild(styleLink);

    const backdrop = document.createElement('div');
    backdrop.className = 'more-menu-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    const popup = document.createElement('div');
    popup.className = 'more-menu-popup';
    popup.id = 'arisuMoreMenu';
    popup.setAttribute('role', 'menu');
    popup.setAttribute('aria-label', 'More options');
    popup.innerHTML = `
      <button class="more-menu-close" type="button" aria-label="Close More menu">×</button>
      <a class="more-menu-link" role="menuitem" href="/about.html">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5"></path><path d="M12 7.5h.01"></path></svg>
        <span>About Arisu Fix</span>
        <svg class="more-menu-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
      </a>
      <a class="more-menu-link" role="menuitem" href="/privacy.html">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"></path><path d="m9 12 2 2 4-4"></path></svg>
        <span>Privacy Policy</span>
        <svg class="more-menu-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
      </a>`;

    document.body.append(backdrop, popup);

    const closeMenu = (restoreFocus = false) => {
      popup.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      moreButton.classList.remove('is-active');
      moreButton.setAttribute('aria-expanded', 'false');
      if (restoreFocus) moreButton.focus();
    };
    const openMenu = () => {
      popup.classList.add('is-open');
      backdrop.classList.add('is-open');
      moreButton.classList.add('is-active');
      moreButton.setAttribute('aria-expanded', 'true');
    };

    moreButton.addEventListener('click', () => {
      if (popup.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
    popup.querySelector('.more-menu-close').addEventListener('click', () => closeMenu(true));
    backdrop.addEventListener('click', () => closeMenu());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && popup.classList.contains('is-open')) closeMenu(true);
    });
    popup.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMoreMenu, { once: true });
  } else {
    initMoreMenu();
  }
})();