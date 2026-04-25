# Zen Tab

**Website:** [https://zozimustechnologies.github.io/smartnewtab/](https://zozimustechnologies.github.io/smartnewtab/)

A fast, distraction-free new tab page for Microsoft Edge and other modern browsers.  
No account required. Everything is stored locally in your browser.

---

## Features

### Live Clock & Smart Greeting
Displays the current time (12 h or 24 h, with optional seconds) and a personalised greeting that adapts to the time of day. Greeting style can be set to **Formal**, **Semi-formal**, or **Informal** in Settings.

### Search + /Shortcut Keys
The search bar uses Google by default. You can also create custom `/flag` shortcuts:
- Type `/gh` → jumps to GitHub
- Type `/gh copilot` → passes the query through (supports `{q}` placeholder)
- Manage shortcuts under **Settings → Search Shortcuts**

### Favourite Tabs (Quick-access tiles)
Pin up to **6** frequently visited sites as icon tiles for one-click access. Tiles show the site's favicon. The 7th slot is always an **Add** button.

### Recent Sites
Shows your most-recently visited sites using the browser `history` API with deduplication and filtering. Falls back to the `topSites` API if history is unavailable. Sites blocked via the Site Blocker integration or the Hidden Sites list are excluded.

### To-Do List
Add, check off, and delete tasks directly on your new tab. Tasks persist across sessions in local storage.

### Notes
A freeform scratchpad — ideal for quick thoughts, URLs, or reminders — always visible on your new tab.

### Live Weather
Displays current temperature and conditions. Location is resolved via **Nominatim** (OpenStreetMap). Weather data is fetched from **Open-Meteo** — no API key required. Refreshed on a timer via the `alarms` API.

### Focus Mode
Hides non-essential widgets and shows only your tasks and a minimal clock — designed for deep work.

### Site Blocker Integration
Zen Tab detects whether the companion **Site Blocker** extension (`lkcklabdlogcdcmbddiffonafahgagmm`) is installed and surfaces a convenient enable/disable toggle in Settings.

### Hidden Sites
Exclude specific domains from appearing in your Recent Sites feed — manage the list under **Settings → Recent Sites → Hidden Sites**.

### Backup & Restore
Export all your settings, shortcuts, tasks, and notes to a single JSON file. Import any previously exported file to restore everything instantly. No cloud, no account.

---

## Settings

Open **Settings** from the gear icon in the new tab page.

| Setting | Options |
|---|---|
| Background | Gradient, solid colour, or custom image URL |
| Display Name | First + last name for the greeting |
| Greeting Style | Formal / Semi-formal / Informal |
| Clock Format | 12 h / 24 h, toggle seconds |
| Weather | Enable/disable, set city |
| Recent Sites | Enable/disable, manage hidden sites |
| Search Shortcuts | Add / edit / delete `/flag` shortcuts |
| Block Sites | Manage the Hidden Sites list |
| Backup & Restore | Export or Import a JSON backup file |

---

## Developer Configuration (`settings.json`)

`settings.json` in the repo root is loaded once at runtime and is **not** user-editable through the UI. It exposes:

```json
{
  "topSites": {
    "blockedHosts": ["office.com"]
  },
  "shortcuts": {
    "_readme": "Add shortcuts here; they are merged with user shortcuts from storage."
  },
  "greetings": {
    "formal": { "morning": "Good morning", ... },
    "semiformal": { ... },
    "informal": { ... }
  }
}
```

User-defined shortcuts are stored in `chrome.storage.local` under the key `shortcuts` and take precedence.

---

## Permissions

| Permission | Reason |
|---|---|
| `storage` | Save settings, tasks, notes, and shortcuts locally |
| `history` | Power the Recent Sites feed |
| `alarms` | Schedule weather refresh |
| `declarativeNetRequest` | Block specified domains from the history feed |
| `management` | Detect the companion Site Blocker extension |

Host permissions: `https://api.open-meteo.com/*` and `https://nominatim.openstreetmap.org/*` (weather only).

---

## Store Assets

All store submission assets are in the `storeassets/` folder:

| File | Size | Purpose |
|---|---|---|
| `extensionlogo.png` | 300×300 | Extension icon for the store listing |
| `smallpromotionaltile.png` | 440×280 | Small promotional tile |
| `largepromotionaltile.png` | 1400×560 | Large promotional tile / marquee banner |
| `screenshot-1280x800.png` | 1280×800 | Primary screenshot |
| `screenshot-640x400.png` | 640×400 | Secondary screenshot |
| `description.md` | — | Store listing description + privacy statement |

To regenerate assets:
```bash
npm install          # installs puppeteer (dev dependency)
node storeassets/generate-assets.js
```

---

## Privacy

- No data is collected or transmitted to any third party other than the weather APIs (city name only; no personal identifiers).
- No analytics, no ads, no tracking.
- All user data stays in `chrome.storage.local` on the user's own device.

---

## License

See [LICENSE](LICENSE).

---

*Built by Zozimus Technologies.*
