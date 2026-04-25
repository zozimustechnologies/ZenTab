Zen Tab — Notes for Certification Reviewers

No login required. Install the extension and open a new tab to test all features.

WHAT IT DOES
Replaces the new tab page with a productivity dashboard: clock, web search, pinned favourite sites, recent history tiles, to-do list, notes, weather, and focus mode. All data is stored locally. No account, no backend.

HOW TO TEST
1. Open a new tab — dashboard loads immediately.
2. Click the gear icon to open Settings.
3. Weather: enable "Show weather", enter a city (e.g. London), save — widget appears.
4. Shortcuts: add a shortcut (flag "gh", URL "https://github.com/search?q={q}"), then type "/gh copilot" on the new tab and press Enter.
5. Backup: Settings > Export downloads a JSON file; Import restores it.

PERMISSIONS
storage — saves tasks, notes, shortcuts, and preferences locally on device.
history — reads up to 10 recent sites to show as quick-access tiles. Nothing transmitted.
alarms — schedules weather refresh every 30 minutes.
declarativeNetRequest — blocks user-specified sites in focus mode, locally only.
management — detects if companion Site Blocker extension is installed to show a settings shortcut. No other extensions are queried.

NETWORK (weather widget only, when enabled by user)
nominatim.openstreetmap.org — resolves city name to coordinates.
api.open-meteo.com — fetches weather for those coordinates.
No personal identifiers sent. No other requests made.

