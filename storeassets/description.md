# Zen Tab — Edge Add-on Store Description

**Website:** [https://zozimustechnologies.github.io/smartnewtab/](https://zozimustechnologies.github.io/smartnewtab/)

> **Short description (≤ 132 characters — paste directly into the store field):**
>
> A fast, distraction-free new tab page with clock, search, bookmarks, todos, weather, notes, and focus mode.

---

## Full Description

**Zen Tab** replaces your new tab page with a clean, focused workspace that keeps you productive from the moment you open a new tab — no clutter, no sign-in required.

### Features

**Live Clock & Smart Greeting**
See the current time at a glance. The greeting adapts to the time of day and can be set to formal, semi-formal, or informal — personalised with your name.

**Search + /Shortcut Keys**
Type directly to search the web, or create custom `/flag` shortcuts to jump to any site instantly. For example, `/gh copilot` can expand to `https://github.com/search?q=copilot`.

**Favourite Tabs (Quick-access tiles)**
Pin up to 6 frequently visited sites as icon tiles for one-click access.

**Recent Sites**
Your recent browsing history (via the browser History API) is surfaced below your favourites so you can jump back to where you were without hunting through tabs.

**To-Do List**
Add and check off tasks directly on your new tab. Tasks persist across sessions using local browser storage.

**Notes**
A freeform scratchpad always on your new tab — ideal for quick thoughts, URLs, or reminders.

**Live Weather**
Displays current temperature and conditions for your location. Powered by Open-Meteo (open-source, privacy-friendly). No API key needed.

**Focus Mode**
Hides distractions and shows only your tasks and a minimal clock — great for deep work sessions.

**Site Blocker Integration**
Works alongside the companion Site Blocker extension to let you hide unwanted sites from your recent history feed.

**Backup & Restore**
Export all your settings, shortcuts, tasks, and notes to a JSON file. Import them back at any time — no account, no cloud sync required.

**Custom Search Shortcuts**
Define your own `/flag` shortcuts in Settings. Supports a `{q}` placeholder so searches are passed through automatically.

---

### Privacy

- **No account required.** Everything is stored locally in your browser using the extension storage API.
- **No data is collected or transmitted** except for weather (your city name is sent to the Open-Meteo and Nominatim APIs to fetch weather data — no personal identifiers are included).
- **No analytics, no ads, no tracking.**

---

### Permissions Used

| Permission | Why it's needed |
|---|---|
| `storage` | Save your settings, tasks, notes, and shortcuts locally |
| `history` | Show recently visited sites on your new tab |
| `alarms` | Refresh weather data on a schedule |
| `declarativeNetRequest` | Block specified sites from appearing in recent history |
| `management` | Detect whether the companion Site Blocker extension is installed |

---

### About

Built with ❤ by Zozimus Technologies. Free, open-source, no account needed.
