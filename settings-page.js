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
    showWeather:  false,
    weatherCity:  "",
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
  const bgType    = document.getElementById("sp-bg-type");
  const bgUrl     = document.getElementById("sp-bg-url");
  const showWx    = document.getElementById("sp-show-weather");
  const cityGroup = document.getElementById("sp-city-group");
  const cityInput = document.getElementById("sp-weather-city");
  const clockFmt  = document.getElementById("sp-clock-format");
  const showSecs  = document.getElementById("sp-show-seconds");
  const useSync   = document.getElementById("sp-use-sync");

  bgType.value   = s.bgType;
  bgUrl.value    = s.bgUrl;
  bgUrl.classList.toggle("hidden", s.bgType !== "custom");

  showWx.checked = s.showWeather;
  cityGroup.classList.toggle("hidden", !s.showWeather);
  cityInput.value = s.weatherCity;

  clockFmt.value   = s.clockFormat;
  showSecs.checked = s.showSeconds;
  useSync.checked  = s.useSync;

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
      showWx.checked        !== s.showWeather   ||
      cityInput.value.trim()!== s.weatherCity   ||
      clockFmt.value        !== s.clockFormat   ||
      showSecs.checked      !== s.showSeconds   ||
      useSync.checked       !== s.useSync
    );
  }

  function checkDirty() {
    if (isOnboarding) return;
    if (isFormDirty()) {
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
  bgType.addEventListener("change", () => {
    bgUrl.classList.toggle("hidden", bgType.value !== "custom");
  });

  showWx.addEventListener("change", () => {
    cityGroup.classList.toggle("hidden", !showWx.checked);
  });

  /* ── Site Blocker detection ─────────────────────────────── */
  const SITE_BLOCKER_ID = "lkcklabdlogcdcmbddiffonafahgagmm";
  const sbBtn = document.getElementById("sp-siteblocker-btn");

  if (typeof chrome !== "undefined" && chrome.management && sbBtn) {
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
  }

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

    const toSave = {
      bgType:       bgTypeVal,
      bgUrl:        bgUrlVal,
      showWeather:  showWx.checked,
      weatherCity:  cityInput.value.trim(),
      clockFormat:  clockFmt.value,
      showSeconds:  showSecs.checked,
      useSync:      useSync.checked,
    };

    await Storage.set(toSave);

    // Keep localStorage useSync flag in sync so storage.js can read it
    localStorage.setItem("useSync", useSync.checked ? "true" : "false");

    hideToast();

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
