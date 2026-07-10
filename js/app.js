/* assets/js/app.js
   Common app helpers:
   - Detect current "year" page and activate the matching year link on the homepage
   - Set up smooth-scroll for in-page anchors
   - Provide a small JSON loader used by other scripts
*/

(() => {
  "use strict";

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const safeJSON = async (url) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  };

  // --- Smooth-scroll for anchors (if supported + not already handled by CSS) ---
  const setupSmoothScroll = () => {
    const anchors = qsa('a[href^="#"]');
    for (const a of anchors) {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", href);
      });
    }
  };

  // --- Activate year link on pages that show the year grid (homepage-like) ---
  const activateYearLink = () => {
    // Only attempt if there is a .year-grid with year links.
    const grid = qs(".year-grid");
    if (!grid) return;

    // Determine year from location:
    // - /1978.html -> 1978
    // - /timeline.html?year=1978 -> 1978
    let year = null;

    const path = (location.pathname || "").replace(/\/+/g, "/");
    const m = path.match(/\/(\d{4})\.html$/i);
    if (m) year = m[1];

    if (!year) {
      const sp = new URLSearchParams(location.search || "");
      const y = sp.get("year");
      if (y && /^\d{4}$/.test(y)) year = y;
    }

    if (!year) return;

    const links = qsa("a", grid);
    for (const link of links) {
      const href = (link.getAttribute("href") || "").trim();
      const hm = href.match(/\/?(\d{4})\.html$/i);
      if (hm && hm[1] === year) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  };

  // Expose loader for other scripts (timeline/search)
  window.RookieApp = {
    loadArticlesJSON: (path = "data/articles.json") => safeJSON(path),
    qs,
    qsa,
  };

  // Boot
  document.addEventListener("DOMContentLoaded", () => {
    setupSmoothScroll();
    activateYearLink();
  });
})();
