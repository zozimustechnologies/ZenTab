/**
 * search.js — search bar, engine selection, URL detection.
 */

const Search = (() => {
  const ENGINES = {
    google: "https://www.google.com/search?q=",
    bing:   "https://www.bing.com/search?q=",
  };

  const ICONS = {
    google: "G",
    bing:   "B",
  };

  const form    = document.getElementById("search-form");
  const input   = document.getElementById("search-input");
  const iconEl  = document.getElementById("search-engine-icon");
  const picker  = document.getElementById("engine-picker");

  let currentEngine = "google";

  function isURL(str) {
    // Has a dot and no spaces → treat as URL
    return /^(https?:\/\/|ftp:\/\/)/.test(str) ||
      (/^[^\s]+\.[^\s]{2,}$/.test(str) && !str.includes(" "));
  }

  function navigate(query) {
    const q = query.trim();
    if (!q) return;
    const url = isURL(q)
      ? q.startsWith("http") ? q : "https://" + q
      : ENGINES[currentEngine] + encodeURIComponent(q);
    window.location.href = url;
  }

  function setEngine(name) {
    if (!ENGINES[name]) return;
    currentEngine = name;
    iconEl.textContent = ICONS[name];
    // Sync picker active state
    picker.querySelectorAll("button").forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.engine === name)
    );
    Storage.set({ searchEngine: name });
  }

  function togglePicker() {
    picker.classList.toggle("hidden");
  }

  function init(engine = "google") {
    setEngine(engine);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      navigate(input.value);
    });

    iconEl.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePicker();
    });

    picker.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        setEngine(btn.dataset.engine);
        picker.classList.add("hidden");
      });
    });

    document.addEventListener("click", (e) => {
      if (!picker.contains(e.target) && e.target !== iconEl) {
        picker.classList.add("hidden");
      }
    });
  }

  return { init, setEngine };
})();
