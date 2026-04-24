/**
 * storage.js — unified read/write over chrome.storage.
 * Falls back to localStorage if the extension API is unavailable (dev testing).
 */

const Storage = (() => {
  const api = typeof chrome !== "undefined" && chrome.storage;

  /** Read one or more keys. Returns a plain object. */
  async function get(keys) {
    if (api) {
      return new Promise((res) => {
        const store = _useSync() ? chrome.storage.sync : chrome.storage.local;
        store.get(keys, res);
      });
    }
    // Fallback: localStorage
    const result = {};
    const arr = Array.isArray(keys) ? keys : [keys];
    arr.forEach((k) => {
      try { result[k] = JSON.parse(localStorage.getItem(k)); } catch { result[k] = null; }
    });
    return result;
  }

  /** Write key→value pairs. */
  async function set(data) {
    if (api) {
      return new Promise((res) => {
        const store = _useSync() ? chrome.storage.sync : chrome.storage.local;
        store.set(data, res);
      });
    }
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
  }

  /** Always use local for non-settings data (todos, notes) to avoid 8KB sync limit. */
  async function getLocal(keys) {
    if (api) {
      return new Promise((res) => chrome.storage.local.get(keys, res));
    }
    return get(keys);
  }

  async function setLocal(data) {
    if (api) {
      return new Promise((res) => chrome.storage.local.set(data, res));
    }
    return set(data);
  }

  function _useSync() {
    try { return JSON.parse(localStorage.getItem("useSync")) === true; } catch { return false; }
  }

  return { get, set, getLocal, setLocal };
})();
