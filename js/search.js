/**
 * search.js — search bar, URL detection, /flag shortcuts.
 */

const Search = (() => {
  const SEARCH_URL = "https://www.google.com/search?q=";

  const form    = document.getElementById("search-form");
  const input   = document.getElementById("search-input");
  const hintBox = document.getElementById("search-shortcut-hints");

  let _shortcuts = {}; // populated on init

  function isURL(str) {
    // Has a dot and no spaces → treat as URL
    return /^(https?:\/\/|ftp:\/\/)/.test(str) ||
      (/^[^\s]+\.[^\s]{2,}$/.test(str) && !str.includes(" "));
  }

  /** Resolve a /flag [query] string. Returns a URL or null. */
  function resolveShortcut(raw) {
    if (!raw.startsWith("/")) return null;
    const parts  = raw.slice(1).split(/\s+/);
    const flag   = parts[0].toLowerCase();
    const rest   = parts.slice(1).join(" ");
    const target = _shortcuts[flag];
    if (!target) return null;
    if (rest) {
      // Replace {q} placeholder if present, else append as search param
      return target.includes("{q}")
        ? target.replace("{q}", encodeURIComponent(rest))
        : target + (target.includes("?") ? "&" : "?") + "q=" + encodeURIComponent(rest);
    }
    return target;
  }

  function navigate(query) {
    const q = query.trim();
    if (!q) return;
    const shortcut = resolveShortcut(q);
    if (shortcut) { window.location.href = shortcut; return; }
    const url = isURL(q)
      ? q.startsWith("http") ? q : "https://" + q
      : SEARCH_URL + encodeURIComponent(q);
    window.location.href = url;
  }

  /* ── Hint dropdown ─────────────────────────────────────── */
  function renderHints(typed) {
    if (!hintBox) return;
    // Only show when user has typed "/" at the start
    const val = typed.trim();
    if (!val.startsWith("/")) { hideHints(); return; }
    const fragment = val.slice(1).toLowerCase();
    const matches  = Object.entries(_shortcuts).filter(
      ([flag]) => flag.startsWith(fragment) || fragment === ""
    );
    if (!matches.length) { hideHints(); return; }
    hintBox.innerHTML = "";
    matches.forEach(([flag, url]) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "search-hint-item";
      const label = document.createElement("span");
      label.className = "search-hint-flag";
      label.textContent = "/" + flag;
      const dest = document.createElement("span");
      dest.className = "search-hint-url";
      try { dest.textContent = new URL(url).hostname.replace(/^www\./, ""); } catch { dest.textContent = url; }
      item.appendChild(label);
      item.appendChild(dest);
      item.addEventListener("mousedown", (e) => {
        e.preventDefault(); // don't blur input
        input.value = "/" + flag + " ";
        input.focus();
        hideHints();
      });
      hintBox.appendChild(item);
    });
    hintBox.classList.remove("hidden");
  }

  function hideHints() {
    if (hintBox) hintBox.classList.add("hidden");
  }

  async function init() {
    // Load shortcuts from local storage (user-defined via settings page)
    const data = await Storage.getLocal(["shortcuts"]);
    _shortcuts = (data.shortcuts && typeof data.shortcuts === "object") ? data.shortcuts : {};

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      hideHints();
      navigate(input.value);
    });

    input.addEventListener("input", () => renderHints(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { hideHints(); }
    });
    document.addEventListener("click", (e) => {
      if (!form.contains(e.target)) hideHints();
    });
  }

  return { init };
})();
