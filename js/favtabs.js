/**
 * favtabs.js — user-curated favourite tab shortcuts.
 * Stored as an array of { url, title } in chrome.storage.local under "favTabs".
 */

const FavTabs = (() => {
  const STORAGE_KEY = "favTabs";
  const MAX = 6;

  const grid      = document.getElementById("favtabs-grid");
  const addBtn    = document.getElementById("favtabs-add-btn");
  const form      = document.getElementById("favtabs-form");
  const urlIn     = document.getElementById("favtabs-url");
  const urlError  = document.getElementById("favtabs-url-error");
  const nameIn    = document.getElementById("favtabs-name");
  const saveBtn   = document.getElementById("favtabs-save-btn");
  const cancelBtn = document.getElementById("favtabs-cancel-btn");

  function showUrlError(msg) {
    urlIn.classList.add("input-error");
    urlError.textContent = msg;
    urlError.classList.remove("hidden");
    urlIn.focus();
  }

  function clearUrlError() {
    urlIn.classList.remove("input-error");
    urlError.classList.add("hidden");
  }

  let tabs = [];

  function faviconURL(url) {
    try {
      const origin = new URL(url).origin;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
    } catch { return null; }
  }

  function initial(title) {
    return (title || "?").trim()[0].toUpperCase();
  }

  function hostname(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
  }

  function render() {
    // Remove all tiles except the persistent add button
    Array.from(grid.children).forEach((el) => {
      if (el.id !== "favtabs-add-btn") el.remove();
    });

    tabs.forEach((tab, i) => {
      const a = document.createElement("a");
      a.className = "topsite-item favtab-item";
      a.href = tab.url;
      a.title = tab.title || tab.url;

      const fav = document.createElement("div");
      fav.className = "topsite-favicon";
      const favicon = faviconURL(tab.url);
      if (favicon) {
        const img = document.createElement("img");
        img.src = favicon;
        img.alt = "";
        img.onerror = () => { img.remove(); fav.textContent = initial(tab.title); };
        fav.appendChild(img);
      } else {
        fav.textContent = initial(tab.title);
      }

      const label = document.createElement("span");
      label.className = "topsite-label";
      label.textContent = tab.title || hostname(tab.url);

      // Remove button (shown on hover via CSS)
      const remove = document.createElement("button");
      remove.className = "favtab-remove";
      remove.title = "Remove";
      remove.textContent = "×";
      remove.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        tabs.splice(i, 1);
        await save();
        render();
      });

      a.appendChild(fav);
      a.appendChild(label);
      a.appendChild(remove);
      // Insert before the add button so it stays last
      grid.insertBefore(a, addBtn);
    });

    // Hide add button at max capacity
    addBtn.style.display = tabs.length >= MAX ? "none" : "";
  }

  function showForm() {
    urlIn.value  = "";
    nameIn.value = "";
    form.classList.remove("hidden");
    urlIn.focus();
  }

  function hideForm() {
    form.classList.add("hidden");
    clearUrlError();
  }

  async function save() {
    await Storage.setLocal({ [STORAGE_KEY]: tabs });
  }

  async function init() {
    const data = await Storage.getLocal([STORAGE_KEY]);
    tabs = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
    render();

    addBtn.addEventListener("click", showForm);
    cancelBtn.addEventListener("click", hideForm);

    urlIn.addEventListener("input", clearUrlError);

    saveBtn.addEventListener("click", async () => {
      let url = urlIn.value.trim();
      if (!url) {
        showUrlError("Please enter a URL.");
        return;
      }

      // Auto-prepend https:// if missing
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;

      try { new URL(url); } catch {
        showUrlError("Please enter a valid URL, e.g. example.com");
        return;
      }
      clearUrlError();

      const title = nameIn.value.trim() || hostname(url);
      tabs.push({ url, title });
      await save();
      hideForm();
      render();
    });

    // Allow Enter to submit the form
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); saveBtn.click(); }
      if (e.key === "Escape") hideForm();
    });
  }

  return { init };
})();
