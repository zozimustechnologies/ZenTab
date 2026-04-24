/**
 * settings.js — applies saved settings to the new tab page on load.
 * The actual editing UI lives in settings.html / settings-page.js.
 */

const Settings = (() => {
  const DEFAULTS = {
    bgType:       "gradient",
    bgUrl:        "",
    clockFormat:  "12",
    showSeconds:  false,
  };

  // Curated permanent Unsplash nature photo CDN URLs (no API key required)
  const NATURE_PHOTOS = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1478827387698-1527781a4887?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&h=1080&fit=crop",
  ];

  function applyBackground(type, url) {
    const bg = document.getElementById("bg-layer");
    if (type === "unsplash") {
      const pick = NATURE_PHOTOS[Math.floor(Math.random() * NATURE_PHOTOS.length)];
      bg.style.backgroundImage = `url(${JSON.stringify(pick)})`;
    } else if (type === "custom" && url) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          bg.style.backgroundImage = `url(${JSON.stringify(url)})`;
        }
      } catch { /* invalid URL — keep gradient */ }
    } else {
      bg.style.backgroundImage = "";
    }
  }

  async function init() {
    const data = await Storage.get(Object.keys(DEFAULTS));
    const s = Object.fromEntries(
      Object.keys(DEFAULTS).map((k) => [k, data[k] ?? DEFAULTS[k]])
    );

    applyBackground(s.bgType, s.bgUrl);
    Clock.init({ use24: s.clockFormat === "24", seconds: s.showSeconds });
    Search.init("bing");

    // Settings button opens settings.html in a new tab
    const btn = document.getElementById("settings-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        const url =
          typeof chrome !== "undefined" && chrome.runtime
            ? chrome.runtime.getURL("settings.html")
            : "settings.html";
        window.open(url, "_blank");
      });
    }

    return s;
  }

  return { init };
})();
