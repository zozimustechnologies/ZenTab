/**
 * weather.js — fetches weather from Open-Meteo (no API key needed).
 * Geocoding via Nominatim (OpenStreetMap).
 */

const Weather = (() => {
  const widget   = document.getElementById("weather-widget");
  const iconEl   = document.getElementById("weather-icon");
  const tempEl   = document.getElementById("weather-temp");
  const descEl   = document.getElementById("weather-desc");

  // WMO weather code → emoji + label
  const WMO = {
    0: ["☀️", "Clear"],
    1: ["🌤️", "Mostly clear"], 2: ["⛅", "Partly cloudy"], 3: ["☁️", "Overcast"],
    45: ["🌫️", "Fog"], 48: ["🌫️", "Icy fog"],
    51: ["🌦️", "Light drizzle"], 53: ["🌦️", "Drizzle"], 55: ["🌧️", "Heavy drizzle"],
    61: ["🌧️", "Slight rain"], 63: ["🌧️", "Rain"], 65: ["🌧️", "Heavy rain"],
    71: ["🌨️", "Slight snow"], 73: ["🌨️", "Snow"], 75: ["❄️", "Heavy snow"],
    80: ["🌦️", "Showers"], 81: ["🌧️", "Heavy showers"], 82: ["⛈️", "Violent showers"],
    95: ["⛈️", "Thunderstorm"], 96: ["⛈️", "Thunderstorm+hail"], 99: ["⛈️", "Heavy thunderstorm"],
  };

  async function geocode(city) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (!data.length) throw new Error("City not found");
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].display_name.split(",")[0] };
  }

  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&temperature_unit=celsius`;
    const res = await fetch(url);
    const data = await res.json();
    return data.current_weather;
  }

  function show(temp, code) {
    const [emoji, label] = WMO[code] || ["🌡️", "Unknown"];
    iconEl.textContent = emoji;
    tempEl.textContent = `${Math.round(temp)}°C`;
    descEl.textContent = label;
    widget.classList.remove("hidden");
  }

  async function load(city) {
    try {
      const { lat, lon } = await geocode(city);
      const cw = await fetchWeather(lat, lon);
      show(cw.temperature, cw.weathercode);
      // Cache coords
      await Storage.set({ weatherLat: lat, weatherLon: lon });
    } catch (err) {
      console.warn("[Weather] failed:", err.message);
    }
  }

  async function init() {
    const data = await Storage.get(["showWeather", "weatherCity", "weatherLat", "weatherLon"]);
    if (!data.showWeather) return;

    // Use cached coords if available (avoids geocode on every new tab)
    if (data.weatherLat && data.weatherLon) {
      try {
        const cw = await fetchWeather(data.weatherLat, data.weatherLon);
        show(cw.temperature, cw.weathercode);
      } catch {
        if (data.weatherCity) await load(data.weatherCity);
      }
    } else if (data.weatherCity) {
      await load(data.weatherCity);
    }
  }

  return { init, load };
})();
