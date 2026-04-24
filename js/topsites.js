/**
 * topsites.js — render recently visited sites from chrome.history API.
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
    sites.forEach((site) => {
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

  async function init({ show = true } = {}) {
    const section = document.getElementById("topsites-section");
    if (!show) {
      if (section) section.classList.add("hidden");
      return;
    }
    if (section) section.classList.remove("hidden");

    const configBlocked  = await Config.blockedHosts();
    const localData      = await Storage.getLocal(["blockedSites"]);
    const localBlocked   = Array.isArray(localData.blockedSites) ? localData.blockedSites : [];
    const blocked        = [...new Set([...configBlocked, ...localBlocked])];

    function dedupAndFilter(items) {
      const seen = new Set();
      const result = [];
      for (const item of items) {
        if (!item.url) continue;
        let hostname;
        try { hostname = new URL(item.url).hostname.replace(/^www\./, ""); }
        catch { continue; }
        if (/^chrome(-extension)?:/.test(item.url)) continue;
        if (blocked.includes(hostname)) continue;
        if (seen.has(hostname)) continue;
        seen.add(hostname);
        result.push(item);
        if (result.length >= 7) break;
      }
      return result;
    }

    if (typeof chrome !== "undefined" && chrome.history) {
      try {
        const items = await chrome.history.search({ text: "", maxResults: 100, startTime: 0 });
        render(dedupAndFilter(items || []));
      } catch (e) {
        console.warn("[ZenTab] chrome.history failed, falling back to topSites", e);
        if (typeof chrome !== "undefined" && chrome.topSites) {
          chrome.topSites.get((sites) => {
            render(dedupAndFilter(sites || []));
          });
        }
      }
    } else if (typeof chrome !== "undefined" && chrome.topSites) {
      chrome.topSites.get((sites) => {
        render(dedupAndFilter(sites || []));
      });
    } else {
      render(dedupAndFilter([
        { url: "https://example.com", title: "Example" },
      ]));
    }
  }

  return { init };
})();
