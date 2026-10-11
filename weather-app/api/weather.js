/**
 * Vercel Serverless Function: /api/weather
 * 
 * Proxies requests to OpenWeather API to keep the OPENWEATHER_API_KEY secure
 * on the server, avoiding any client-side exposure.
 * Fetches both current weather and the 5-day weather forecast.
 */

function processForecastData(forecastList, timezoneOffset = 0) {
  if (!Array.isArray(forecastList) || forecastList.length === 0) return [];

  // Group items by local calendar date (YYYY-MM-DD)
  const daysMap = new Map();

  for (const item of forecastList) {
    if (!item.dt) continue;
    const localDate = new Date((item.dt + timezoneOffset) * 1000);
    const dateKey = localDate.toISOString().split("T")[0];

    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, []);
    }
    daysMap.get(dateKey).push(item);
  }

  const result = [];
  const sortedDates = Array.from(daysMap.keys()).sort();

  for (const dateKey of sortedDates) {
    const items = daysMap.get(dateKey);
    if (!items || items.length === 0) continue;

    let minTemp = Infinity;
    let maxTemp = -Infinity;

    for (const it of items) {
      const itMin = typeof it.main?.temp_min === "number" ? it.main.temp_min : it.main?.temp;
      const itMax = typeof it.main?.temp_max === "number" ? it.main.temp_max : it.main?.temp;
      if (typeof itMin === "number" && itMin < minTemp) minTemp = itMin;
      if (typeof itMax === "number" && itMax > maxTemp) maxTemp = itMax;
    }

    // Pick midday forecast (around 12:00 - 15:00 UTC/local) or middle item for icon/condition
    const repItem = items.find(it => {
      const h = new Date((it.dt + timezoneOffset) * 1000).getUTCHours();
      return h >= 11 && h <= 15;
    }) || items[Math.floor(items.length / 2)];

    const repWeather = repItem.weather && repItem.weather.length > 0 ? repItem.weather[0] : {};

    const dObj = new Date((items[0].dt + timezoneOffset) * 1000);
    const dayName = dObj.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    const formattedDate = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

    result.push({
      date: dateKey,
      dayName: dayName,
      formattedDate: formattedDate,
      tempMax: Math.round(maxTemp),
      tempMin: Math.round(minTemp),
      condition: repWeather.main || "Clear",
      description: repWeather.description || "",
      icon: repWeather.icon || "01d"
    });
  }

  // Return up to 5 days
  return result.slice(0, 5);
}

module.exports = async function handler(req, res) {
  // Set CORS and response headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed. Use GET." });
    return;
  }

  try {
    // 1. Read the city query parameter (handling both Vercel req.query and URL fallback)
    const rawCity = req.query?.city || (req.url ? new URL(req.url, "http://localhost").searchParams.get("city") : null);
    const city = rawCity ? rawCity.trim() : "";

    // 2. Validate that city is not empty
    if (!city) {
      res.status(400).json({ error: "Please enter a city name." });
      return;
    }

    // 3. Read the API key from server-side environment variable
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_openweather_api_key_here") {
      res.status(500).json({
        error: "Server configuration error: OPENWEATHER_API_KEY is not set in Vercel environment variables."
      });
      return;
    }

    // 4. Call OpenWeather Current Weather & 5-Day Forecast APIs with metric units
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey.trim()}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey.trim()}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl).catch(() => null)
    ]);

    // 7. Handle OpenWeather error status codes cleanly without exposing the API key
    if (!currentRes.ok) {
      if (currentRes.status === 404) {
        res.status(404).json({ error: "City not found. Please check the spelling and try again." });
        return;
      } else if (currentRes.status === 401) {
        res.status(401).json({ error: "Invalid OpenWeather API key configured on server. Please verify Vercel environment variables." });
        return;
      } else if (currentRes.status === 429) {
        res.status(429).json({ error: "API rate limit reached. Please wait a few moments and try again." });
        return;
      } else {
        res.status(currentRes.status).json({ error: "Unable to retrieve weather information from provider." });
        return;
      }
    }

    const currentData = await currentRes.json();

    // Process 5-day forecast if available
    let forecast = [];
    if (forecastRes && forecastRes.ok) {
      const forecastData = await forecastRes.json();
      forecast = processForecastData(forecastData.list, forecastData.city?.timezone || 0);
    }

    // 6. Return sanitized current weather + 5-day forecast
    res.status(200).json({
      name: currentData.name,
      sys: {
        country: currentData.sys?.country || ""
      },
      main: {
        temp: currentData.main?.temp,
        feels_like: currentData.main?.feels_like,
        humidity: currentData.main?.humidity,
        pressure: currentData.main?.pressure
      },
      weather: (currentData.weather || []).map(w => ({
        id: w.id,
        main: w.main,
        description: w.description,
        icon: w.icon
      })),
      wind: {
        speed: currentData.wind?.speed
      },
      visibility: currentData.visibility,
      forecast: forecast
    });
  } catch (error) {
    console.error("Vercel /api/weather error:", error);
    res.status(500).json({
      error: "Unable to retrieve weather information. Please check your internet connection and try again."
    });
  }
};
