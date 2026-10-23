/* AFV224: remove only legacy floating shortcuts on the Customer Reviews page. */
(() => {
  'use strict';
  const body = document.body;
  if (!body || !body.classList.contains('reviews-document')) return;

  const legacySelectors = [
    '.floating-menu',
    '#floatingMenu',
    '#floatingWhatsApp',
    '.reviews-floating-home',
    '.proofs-back-to-site'
  ];

  const removeLegacyControls = (root = document) => {
    for (const selector of legacySelectors) {
      if (root.matches?.(selector)) root.remove();
      root.querySelectorAll?.(selector).forEach((element) => element.remove());
    }
  };

  removeLegacyControls();
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) removeLegacyControls(node);
      }
    }
  });
  observer.observe(body, { childList: true, subtree: true });
})();
