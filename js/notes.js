/**
 * notes.js — scratch pad, auto-saved to local storage.
 */

const Notes = (() => {
  const area = document.getElementById("notes-area");
  let _timer = null;

  function schedSave() {
    clearTimeout(_timer);
    _timer = setTimeout(() => Storage.setLocal({ notes: area.value }), 600);
  }

  async function init() {
    const data = await Storage.getLocal("notes");
    area.value = data.notes || "";
    area.addEventListener("input", schedSave);
  }

  return { init };
})();
