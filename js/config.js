/**
 * config.js — loads settings.json once and caches it.
 * All other modules call Config.get() to read developer config.
 */

const Config = (() => {
  let _cache = null;

  async function get() {
    if (_cache) return _cache;
    try {
      const url = typeof chrome !== "undefined" && chrome.runtime
        ? chrome.runtime.getURL("settings.json")
        : "settings.json";
      const res = await fetch(url);
      _cache = await res.json();
    } catch {
      _cache = {};
    }
    return _cache;
  }

  /** Returns array of hostnames to hide from top sites. */
  async function blockedHosts() {
    const cfg = await get();
    return Array.isArray(cfg?.topSites?.blockedHosts)
      ? cfg.topSites.blockedHosts.map((h) => h.toLowerCase())
      : [];
  }

  /** Returns a random greeting string for the given hour and style, or null to use default. */
  async function greetingFor(hour, style = "semiformal") {
    const cfg = await get();
    const styles = cfg?.greetings ?? {};
    // Fall back through semiformal -> formal -> flat (legacy)
    const map = styles[style] ?? styles["semiformal"] ?? styles;
    let key;
    if      (hour < 5)  key = "night";
    else if (hour < 12) key = "morning";
    else if (hour < 17) key = "afternoon";
    else if (hour < 21) key = "evening";
    else                key = "night";
    const arr = map[key];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** Returns the shortcuts map { flag: url } or {}. */
  async function shortcuts() {
    const cfg = await get();
    const raw = cfg?.shortcuts ?? {};
    // Strip the _readme meta key
    const result = {};
    for (const [k, v] of Object.entries(raw)) {
      if (k !== "_readme" && typeof v === "string") result[k] = v;
    }
    return result;
  }

  return { get, blockedHosts, greetingFor, shortcuts };
})();
