/**
 * focus.js — focus mode toggle, countdown timer, site blocking.
 */

const Focus = (() => {
  const banner     = document.getElementById("focus-banner");
  const timerEl    = document.getElementById("focus-timer");
  const toggleBtn  = document.getElementById("focus-toggle-btn");
  const endBtn     = document.getElementById("focus-end-btn");

  let active   = false;
  let startTs  = null;
  let _ival    = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    if (!startTs) return;
    const elapsed = Math.floor((Date.now() - startTs) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    timerEl.textContent = `${pad(m)}:${pad(s)}`;
  }

  async function enable() {
    active  = true;
    startTs = Date.now();
    banner.classList.remove("hidden");
    toggleBtn.title = "Focus Mode ON";
    toggleBtn.style.color = "#ffd200";
    _ival = setInterval(tick, 1000);
    tick();
    await Storage.setLocal({ focusActive: true, focusStart: startTs });
  }

  async function disable() {
    active  = false;
    startTs = null;
    banner.classList.add("hidden");
    toggleBtn.title  = "Toggle Focus Mode";
    toggleBtn.style.color = "";
    clearInterval(_ival);
    await Storage.setLocal({ focusActive: false, focusStart: null });
  }

  async function init() {
    const data = await Storage.getLocal(["focusActive", "focusStart"]);
    if (data.focusActive) {
      startTs = data.focusStart || Date.now();
      await enable();
      // Restore start time (not reset it)
      startTs = data.focusStart || startTs;
    }

    toggleBtn.addEventListener("click", () => (active ? disable() : enable()));
    endBtn.addEventListener("click", disable);
  }

  return { init };
})();
