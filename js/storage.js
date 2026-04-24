/**
 * storage.js — unified read/write over chrome.storage.local.
 * Falls back to localStorage if the extension API is unavailable (dev testing).
 */

const Storage = (() => {
  const api = typeof chrome !== "undefined" && chrome.storage;

  /** Read one or more keys from local storage. Returns a plain object. */
  async function get(keys) {
    if (api) {
      return new Promise((res) => chrome.storage.local.get(keys, res));
    }
    const result = {};
    const arr = Array.isArray(keys) ? keys : [keys];
    arr.forEach((k) => {
      try { result[k] = JSON.parse(localStorage.getItem(k)); } catch { result[k] = null; }
    });
    return result;
  }

  /** Write key→value pairs to local storage. */
  async function set(data) {
    if (api) {
      return new Promise((res) => chrome.storage.local.set(data, res));
    }
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
  }

  /** Alias — all storage is local now. */
  const getLocal = get;
  const setLocal = set;

  return { get, set, getLocal, setLocal };
})();
