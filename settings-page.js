/**
 * settings-page.js
 * Handles both onboarding (?onboarding=1) and the regular settings page.
 */

(async () => {
  const isOnboarding = new URLSearchParams(location.search).has("onboarding");

  /* ── Onboarding mode tweaks ─────────────────────────────── */
  if (isOnboarding) {
    document.title = "Welcome — Zen Tab";
    document.getElementById("sp-title").textContent = "Welcome to Zen Tab ⚡";
    document.getElementById("sp-subtitle").textContent =
      "Set up your new tab in 30 seconds.";
    document.getElementById("sp-save-btn").textContent = "Get Started →";
    document.getElementById("sp-back-link").classList.add("hidden");
  }

  /* ── Defaults ───────────────────────────────────────────── */
  const DEFAULTS = {
    bgType:       "gradient",
    bgUrl:        "",
    bgGradFrom:   "#0f0c29",
    bgGradTo:     "#24243e",
    bgSolid:      "#1a1a4e",
    firstName:    "",
    lastName:     "",
    greetingStyle: "semiformal",
    showWeather:  false,
    weatherCity:  "",
    showTopSites: true,
    clockFormat:  "12",
    showSeconds:  false,
    useSync:      false,
  };

  /* ── Load saved settings ────────────────────────────────── */
  const raw = await Storage.get(Object.keys(DEFAULTS));
  const s   = Object.fromEntries(
    Object.keys(DEFAULTS).map((k) => [k, raw[k] ?? DEFAULTS[k]])
  );

  /* ── Populate form ──────────────────────────────────────── */
  const bgType       = document.getElementById("sp-bg-type");
  const bgUrl        = document.getElementById("sp-bg-url");
  const gradGroup    = document.getElementById("sp-gradient-group");
  const gradFrom     = document.getElementById("sp-grad-from");
  const gradFromHex  = document.getElementById("sp-grad-from-hex");
  const gradTo       = document.getElementById("sp-grad-to");
  const gradToHex    = document.getElementById("sp-grad-to-hex");
  const solidGroup   = document.getElementById("sp-solid-group");
  const solidColor   = document.getElementById("sp-solid-color");
  const solidHex     = document.getElementById("sp-solid-hex");
  const showWx      = document.getElementById("sp-show-weather");
  const cityGroup   = document.getElementById("sp-city-group");
  const cityInput   = document.getElementById("sp-weather-city");
  const showTopSitesChk = document.getElementById("sp-show-topsites");
  const clockFmt  = document.getElementById("sp-clock-format");
  const showSecs  = document.getElementById("sp-show-seconds");
  const useSync   = document.getElementById("sp-use-sync");
  const firstName = document.getElementById("sp-first-name");
  const lastName  = document.getElementById("sp-last-name");
  const greetingStyle = document.getElementById("sp-greeting-style");

  function syncBgVisibility() {
    const t = bgType.value;
    gradGroup.classList.toggle("hidden", t !== "gradient");
    solidGroup.classList.toggle("hidden", t !== "solid");
    bgUrl.classList.toggle("hidden", t !== "custom");
  }

  // Sync color picker <-> hex text field
  function bindColorHex(picker, hex) {
    picker.addEventListener("input", () => { hex.value = picker.value; });
    hex.addEventListener("input", () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
    });
  }
  bindColorHex(gradFrom,   gradFromHex);
  bindColorHex(gradTo,     gradToHex);
  bindColorHex(solidColor, solidHex);

  bgType.value      = s.bgType;
  bgUrl.value       = s.bgUrl;
  gradFrom.value    = s.bgGradFrom;
  gradFromHex.value = s.bgGradFrom;
  gradTo.value      = s.bgGradTo;
  gradToHex.value   = s.bgGradTo;
  solidColor.value  = s.bgSolid;
  solidHex.value    = s.bgSolid;
  syncBgVisibility();

  showWx.checked           = s.showWeather;
  cityGroup.classList.toggle("hidden", !s.showWeather);
  cityInput.value           = s.weatherCity;
  showTopSitesChk.checked   = s.showTopSites !== false;

  clockFmt.value   = s.clockFormat;
  showSecs.checked = s.showSeconds;
  useSync.checked  = s.useSync;
  firstName.value       = s.firstName;
  lastName.value        = s.lastName;
  greetingStyle.value   = s.greetingStyle ?? "semiformal";

  /* ── Live clock format preview ─────────────────────────── */
  const opt12 = document.getElementById("sp-clock-opt-12");
  const opt24 = document.getElementById("sp-clock-opt-24");

  function formatPreview(use24, secs) {
    const now = new Date();
    const opts = { hour: "numeric", minute: "2-digit", hour12: !use24 };
    if (secs) opts.second = "2-digit";
    return now.toLocaleTimeString([], opts);
  }

  function updateClockOptions() {
    const secs = showSecs.checked;
    opt12.textContent = `12-hour (${formatPreview(false, secs)})`;
    opt24.textContent = `24-hour (${formatPreview(true,  secs)})`;
  }

  updateClockOptions();
  setInterval(updateClockOptions, 1000);
  showSecs.addEventListener("change", updateClockOptions);

  /* ── Toast (unsaved changes) ────────────────────────────── */
  const toast     = document.getElementById("sp-toast");
  const toastSave = document.getElementById("sp-toast-save");

  function isFormDirty() {
    return (
      bgType.value          !== s.bgType        ||
      bgUrl.value.trim()    !== s.bgUrl         ||
      gradFrom.value        !== s.bgGradFrom    ||
      gradTo.value          !== s.bgGradTo      ||
      solidColor.value      !== s.bgSolid       ||
      showWx.checked        !== s.showWeather   ||
      cityInput.value.trim()!== s.weatherCity   ||
      showTopSitesChk.checked !== (s.showTopSites !== false) ||
      clockFmt.value        !== s.clockFormat   ||
      showSecs.checked      !== s.showSeconds   ||
      useSync.checked       !== s.useSync       ||
      firstName.value.trim()!== s.firstName     ||
      lastName.value.trim() !== s.lastName      ||
      greetingStyle.value   !== (s.greetingStyle ?? "semiformal")
    );
  }

  function checkDirty() {
    if (isOnboarding) return;
    const dirty = isFormDirty();
    document.getElementById("sp-save-wrap").classList.toggle("sp-inactive", !dirty);
    document.getElementById("sp-discard-wrap").classList.toggle("sp-inactive", !dirty);
    document.getElementById("sp-save-btn").disabled = !dirty;
    document.getElementById("sp-discard-btn").disabled = !dirty;
    if (dirty) {
      if (!toast.classList.contains("show")) {
        toast.classList.remove("hidden");
        toast.offsetHeight; // eslint-disable-line no-unused-expressions
        toast.classList.add("show");
      }
    } else {
      hideToast();
    }
  }

  function hideToast() {
    toast.classList.remove("show");
    // Keep hidden after transition ends
    toast.addEventListener("transitionend", () => toast.classList.add("hidden"), { once: true });
  }

  // Trigger check on any form input change
  document.getElementById("sp-form").addEventListener("change", checkDirty);
  document.getElementById("sp-form").addEventListener("input",  checkDirty);

  // Toast "Save" button submits the form
  toastSave.addEventListener("click", () => {
    document.getElementById("sp-form").requestSubmit();
  });

  /* ── Dynamic visibility ─────────────────────────────────── */
  bgType.addEventListener("change", syncBgVisibility);

  showWx.addEventListener("change", () => {
    cityGroup.classList.toggle("hidden", !showWx.checked);
  });

  /* ── Site Blocker detection ─────────────────────────────── */
  const SITE_BLOCKER_ID = "lkcklabdlogcdcmbddiffonafahgagmm";
  const sbBtn = document.getElementById("sp-siteblocker-btn");

  if (typeof chrome !== "undefined" && sbBtn) {
    try {
      chrome.management.get(SITE_BLOCKER_ID, (extInfo) => {
        if (chrome.runtime.lastError || !extInfo || !extInfo.enabled) return;
        // Site Blocker is installed and enabled — update the button
        sbBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.1em;vertical-align:middle;margin-right:4px">open_in_browser</span>Open Site Blocker';
        sbBtn.removeAttribute("href");
        sbBtn.removeAttribute("target");
        sbBtn.removeAttribute("rel");
        sbBtn.addEventListener("click", (e) => {
          e.preventDefault();
          chrome.tabs.create({ url: `chrome-extension://${SITE_BLOCKER_ID}/sidepanel.html` });
        });
      });
    } catch (_) { /* management API not available in this context */ }
  }

  /* ── Search Shortcuts ───────────────────────────────────── */
  const shortcutsList  = document.getElementById("sp-shortcuts-list");
  const shortcutFlag   = document.getElementById("sp-shortcut-flag");
  const shortcutUrl    = document.getElementById("sp-shortcut-url");
  const shortcutAddBtn = document.getElementById("sp-shortcut-add-btn");
  const shortcutError  = document.getElementById("sp-shortcut-error");

  let shortcuts = {}; // { flag: url }

  function renderShortcuts() {
    shortcutsList.innerHTML = "";
    const entries = Object.entries(shortcuts);
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "sp-hint";
      empty.textContent = "No shortcuts yet. Add one below.";
      shortcutsList.appendChild(empty);
      return;
    }
    entries.forEach(([flag, url]) => {
      const row = document.createElement("div");
      row.className = "sp-shortcut-row";
      const f = document.createElement("span");
      f.className = "sp-shortcut-flag";
      f.textContent = flag;
      const d = document.createElement("span");
      d.className = "sp-shortcut-dest";
      d.textContent = url;
      d.title = url;
      const del = document.createElement("button");
      del.type = "button";
      del.className = "sp-shortcut-del";
      del.textContent = "✕";
      del.title = "Remove";
      del.addEventListener("click", async () => {
        delete shortcuts[flag];
        await Storage.setLocal({ shortcuts });
        renderShortcuts();
      });
      row.appendChild(f);
      row.appendChild(d);
      row.appendChild(del);
      shortcutsList.appendChild(row);
    });
  }

  function showShortcutError(msg) {
    shortcutError.textContent = msg;
    shortcutError.classList.remove("hidden");
  }
  function clearShortcutError() {
    shortcutError.classList.add("hidden");
  }

  shortcutFlag.addEventListener("input", clearShortcutError);
  shortcutUrl.addEventListener("input", clearShortcutError);

  shortcutAddBtn.addEventListener("click", async () => {
    const flag = shortcutFlag.value.trim().toLowerCase().replace(/^\/+/, "").replace(/\s+/g, "");
    const url  = shortcutUrl.value.trim();

    if (!flag) {
      shortcutFlag.classList.add("input-error");
      showShortcutError("Please enter a flag, e.g. gh");
      shortcutFlag.focus();
      return;
    }
    if (!url) {
      shortcutUrl.classList.add("input-error");
      showShortcutError("Please enter a URL.");
      shortcutUrl.focus();
      return;
    }
    const fullUrl = /^https?:\/\//i.test(url) ? url : "https://" + url;
    // Validate URL (allow {q} placeholder)
    try { new URL(fullUrl.replace("{q}", "test")); } catch {
      shortcutUrl.classList.add("input-error");
      showShortcutError("Please enter a valid URL.");
      shortcutUrl.focus();
      return;
    }
    shortcutFlag.classList.remove("input-error");
    shortcutUrl.classList.remove("input-error");
    clearShortcutError();

    shortcuts[flag] = fullUrl;
    await Storage.setLocal({ shortcuts });
    renderShortcuts();
    shortcutFlag.value = "";
    shortcutUrl.value  = "";
    shortcutFlag.focus();
  });

  // Load saved shortcuts
  const scData = await Storage.getLocal(["shortcuts"]);
  shortcuts = (scData.shortcuts && typeof scData.shortcuts === "object") ? scData.shortcuts : {};
  renderShortcuts();

  /* ── Blocked (hidden) sites ─────────────────────────────── */
  const blockedList     = document.getElementById("sp-blocked-sites-list");
  const blockedInput    = document.getElementById("sp-blocked-site-input");
  const blockedAddBtn   = document.getElementById("sp-blocked-site-add-btn");
  const blockedError    = document.getElementById("sp-blocked-site-error");

  let blockedSites = []; // array of hostname strings

  function renderBlockedSites() {
    blockedList.innerHTML = "";
    if (!blockedSites.length) {
      const empty = document.createElement("p");
      empty.className = "sp-hint";
      empty.textContent = "No sites hidden yet.";
      blockedList.appendChild(empty);
      return;
    }
    blockedSites.forEach((host) => {
      const row = document.createElement("div");
      row.className = "sp-shortcut-row";
      const f = document.createElement("span");
      f.className = "sp-shortcut-flag";
      f.style.cssText = "font-family:inherit;font-weight:400;min-width:unset;";
      f.textContent = host;
      const del = document.createElement("button");
      del.type = "button";
      del.className = "sp-shortcut-del";
      del.textContent = "✕";
      del.title = "Unhide";
      del.addEventListener("click", async () => {
        blockedSites = blockedSites.filter((h) => h !== host);
        await Storage.setLocal({ blockedSites });
        renderBlockedSites();
      });
      row.appendChild(f);
      row.appendChild(del);
      blockedList.appendChild(row);
    });
  }

  blockedInput.addEventListener("input", () => {
    blockedInput.classList.remove("input-error");
    blockedError.classList.add("hidden");
  });

  blockedAddBtn.addEventListener("click", async () => {
    let host = blockedInput.value.trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/^www\./, "");
    if (!host) {
      blockedInput.classList.add("input-error");
      blockedError.textContent = "Please enter a hostname, e.g. reddit.com";
      blockedError.classList.remove("hidden");
      blockedInput.focus();
      return;
    }
    if (blockedSites.includes(host)) {
      blockedInput.classList.add("input-error");
      blockedError.textContent = `${host} is already hidden.`;
      blockedError.classList.remove("hidden");
      return;
    }
    blockedSites.push(host);
    await Storage.setLocal({ blockedSites });
    renderBlockedSites();
    blockedInput.value = "";
    blockedInput.focus();
  });

  const bsData = await Storage.getLocal(["blockedSites"]);
  blockedSites = Array.isArray(bsData.blockedSites) ? bsData.blockedSites : [];
  renderBlockedSites();

  /* ── Discard changes ────────────────────────────────────── */
  document.getElementById("sp-discard-btn").addEventListener("click", () => {
    if (!isFormDirty()) return;
    bgType.value          = s.bgType;
    bgUrl.value           = s.bgUrl;
    gradFrom.value        = s.bgGradFrom;
    gradFromHex.value     = s.bgGradFrom;
    gradTo.value          = s.bgGradTo;
    gradToHex.value       = s.bgGradTo;
    solidColor.value      = s.bgSolid;
    solidHex.value        = s.bgSolid;
    syncBgVisibility();
    showWx.checked        = s.showWeather;
    cityGroup.classList.toggle("hidden", !s.showWeather);
    cityInput.value       = s.weatherCity;
    showTopSitesChk.checked = s.showTopSites !== false;
    firstName.value       = s.firstName;
    lastName.value        = s.lastName;
    greetingStyle.value   = s.greetingStyle ?? "semiformal";
    clockFmt.value        = s.clockFormat;
    showSecs.checked      = s.showSeconds;
    useSync.checked       = s.useSync;
    updateClockOptions();
    hideToast();
  });

  /* ── Back / open new tab link ───────────────────────────── */
  document.getElementById("sp-back-link").addEventListener("click", (e) => {
    e.preventDefault();
    const url =
      typeof chrome !== "undefined" && chrome.runtime
        ? chrome.runtime.getURL("newtab.html")
        : "newtab.html";
    window.location.href = url;
  });

  /* ── Save ───────────────────────────────────────────────── */
  document.getElementById("sp-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const bgTypeVal = bgType.value;
    const bgUrlVal  = bgUrl.value.trim();

    // Validate custom URL (basic security check)
    if (bgTypeVal === "custom" && bgUrlVal) {
      try {
        const parsed = new URL(bgUrlVal);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          alert("Please enter a valid http or https image URL.");
          return;
        }
      } catch {
        alert("Please enter a valid image URL.");
        return;
      }
    }

    const gradFromVal = gradFrom.value;
    const gradToVal   = gradTo.value;
    const solidVal    = solidColor.value;

    const toSave = {
      bgType:       bgTypeVal,
      bgUrl:        bgUrlVal,
      bgGradFrom:   gradFromVal,
      bgGradTo:     gradToVal,
      bgSolid:      solidVal,
      firstName:    firstName.value.trim(),
      lastName:     lastName.value.trim(),
      greetingStyle: greetingStyle.value,
      showWeather:  showWx.checked,
      weatherCity:  cityInput.value.trim(),
      showTopSites: showTopSitesChk.checked,
      clockFormat:  clockFmt.value,
      showSeconds:  showSecs.checked,
      useSync:      useSync.checked,
    };

    await Storage.set(toSave);

    // Sync saved baseline so dirty-check works correctly after save
    Object.assign(s, toSave);

    // Keep localStorage useSync flag in sync so storage.js can read it
    localStorage.setItem("useSync", useSync.checked ? "true" : "false");

    hideToast();
    checkDirty();

    if (isOnboarding) {
      const url =
        typeof chrome !== "undefined" && chrome.runtime
          ? chrome.runtime.getURL("newtab.html")
          : "newtab.html";
      window.location.href = url;
    } else {
      const btn = document.getElementById("sp-save-btn");
      const orig = btn.textContent;
      btn.textContent = "✓ Saved!";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
      }, 1600);
    }
  });
})();
