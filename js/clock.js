/**
 * clock.js — live clock, date, and greeting.
 */

const Clock = (() => {
  const clockEl    = document.getElementById("clock");
  const dateEl     = document.getElementById("date");
  const greetingEl = document.getElementById("greeting");

  let format24    = false;
  let showSecs    = false;
  let displayName = "";
  let _greetingStyle = "semiformal";
  let _greetings  = null; // loaded from Config — style-specific map
  let _lastPeriod = null;
  let _cachedGreeting = "";
  let _interval   = null;

  const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];

  function pad(n) { return String(n).padStart(2, "0"); }

  function periodKey(h) {
    if      (h < 5)  return "night";
    else if (h < 12) return "morning";
    else if (h < 17) return "afternoon";
    else if (h < 21) return "evening";
    else             return "night";
  }

  function greeting(h) {
    const period = periodKey(h);
    // Use config greetings if loaded
    if (_greetings) {
      if (period !== _lastPeriod) {
        _lastPeriod = period;
        const arr = _greetings[period];
        _cachedGreeting = (Array.isArray(arr) && arr.length)
          ? arr[Math.floor(Math.random() * arr.length)]
          : _defaultGreeting(h);
      }
      return _cachedGreeting;
    }
    return _defaultGreeting(h);
  }

  function _defaultGreeting(h) {
    if (h < 5)  return "Good night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  }

  function tick() {
    const now = new Date();
    const h   = now.getHours();
    const m   = now.getMinutes();
    const s   = now.getSeconds();

    let timeStr;
    if (format24) {
      timeStr = showSecs
        ? `${pad(h)}:${pad(m)}:${pad(s)}`
        : `${pad(h)}:${pad(m)}`;
    } else {
      const h12  = h % 12 || 12;
      const ampm = h < 12 ? "AM" : "PM";
      timeStr = showSecs
        ? `${h12}:${pad(m)}:${pad(s)} ${ampm}`
        : `${h12}:${pad(m)} ${ampm}`;
    }

    clockEl.textContent    = timeStr;
    dateEl.textContent     = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
    greetingEl.textContent = displayName
      ? `${greeting(h)}, ${displayName}!`
      : greeting(h);
  }

  function init({ use24 = false, seconds = false, name = "", greetingStyle = "semiformal" } = {}) {
    format24       = use24;
    showSecs       = seconds;
    displayName    = name.trim();
    _greetingStyle = greetingStyle;
    // Load config greetings for chosen style asynchronously
    Config.get().then((cfg) => {
      const styles = cfg?.greetings ?? {};
      _greetings = styles[_greetingStyle] ?? styles["semiformal"] ?? styles;
      _lastPeriod = null; // force recalculation on next tick
      tick();
    }).catch(() => {});
    tick();
    if (_interval) clearInterval(_interval);
    _interval = setInterval(tick, 1000);
  }

  function setFormat({ use24, seconds, name, greetingStyle }) {
    if (use24          !== undefined) format24       = use24;
    if (seconds        !== undefined) showSecs       = seconds;
    if (name           !== undefined) displayName    = name.trim();
    if (greetingStyle  !== undefined) {
      _greetingStyle = greetingStyle;
      Config.get().then((cfg) => {
        const styles = cfg?.greetings ?? {};
        _greetings = styles[_greetingStyle] ?? styles["semiformal"] ?? styles;
        _lastPeriod = null;
        tick();
      }).catch(() => {});
    }
    tick();
  }

  return { init, setFormat };
})();
