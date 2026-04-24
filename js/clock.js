/**
 * clock.js — live clock, date, and greeting.
 */

const Clock = (() => {
  const clockEl    = document.getElementById("clock");
  const dateEl     = document.getElementById("date");
  const greetingEl = document.getElementById("greeting");

  let format24  = false;
  let showSecs  = false;
  let _interval = null;

  const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];

  function pad(n) { return String(n).padStart(2, "0"); }

  function greeting(h) {
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
    greetingEl.textContent = greeting(h);
  }

  function init({ use24 = false, seconds = false } = {}) {
    format24 = use24;
    showSecs = seconds;
    tick();
    if (_interval) clearInterval(_interval);
    _interval = setInterval(tick, 1000);
  }

  function setFormat({ use24, seconds }) {
    if (use24  !== undefined) format24 = use24;
    if (seconds !== undefined) showSecs = seconds;
    tick();
  }

  return { init, setFormat };
})();
