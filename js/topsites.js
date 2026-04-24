/**
 * topsites.js — render top sites from chrome.topSites API.
 */

const TopSites = (() => {
  const grid = document.getElementById("topsites-grid");

  function faviconURL(url) {
    try {
      const origin = new URL(url).origin;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
    } catch {
      return null;
    }
  }

  function initial(title) {
    return (title || "?").trim()[0].toUpperCase();
  }

  function render(sites) {
    grid.innerHTML = "";
    sites.slice(0, 10).forEach((site) => {
      const a = document.createElement("a");
      a.className = "topsite-item";
      a.href = site.url;
      a.title = site.title || site.url;

      const fav = document.createElement("div");
      fav.className = "topsite-favicon";

      const favicon = faviconURL(site.url);
      if (favicon) {
        const img = document.createElement("img");
        img.src = favicon;
        img.alt = "";
        img.onerror = () => {
          img.remove();
          fav.textContent = initial(site.title);
        };
        fav.appendChild(img);
      } else {
        fav.textContent = initial(site.title);
      }

      const label = document.createElement("span");
      label.className = "topsite-label";
      try {
        label.textContent = new URL(site.url).hostname.replace(/^www\./, "");
      } catch {
        label.textContent = site.title || site.url;
      }

      a.appendChild(fav);
      a.appendChild(label);
      grid.appendChild(a);
    });
  }

  async function init() {
    if (typeof chrome !== "undefined" && chrome.topSites) {
      chrome.topSites.get((sites) => render(sites || []));
    } else {
      // Dev/non-extension fallback: show placeholder tiles
      render([
        { url: "https://github.com", title: "GitHub" },
        { url: "https://google.com", title: "Google" },
        { url: "https://youtube.com", title: "YouTube" },
      ]);
    }
  }

  return { init };
})();
