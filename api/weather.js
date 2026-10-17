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

    // Fetch UV Index from OpenWeather API using coordinates
    let uvi = typeof currentData.uvi === "number" ? currentData.uvi : null;

    if (uvi === null && currentData.coord && typeof currentData.coord.lat === "number" && typeof currentData.coord.lon === "number") {
      const lat = currentData.coord.lat;
      const lon = currentData.coord.lon;

      try {
        // 1. Query official OpenWeather UV Index API endpoint
        const uviUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey.trim()}`;
        const uviRes = await fetch(uviUrl).catch(() => null);

        if (uviRes && uviRes.ok) {
          const uviData = await uviRes.json().catch(() => null);
          if (uviData && typeof uviData.value === "number") {
            uvi = uviData.value;
          }
        } else {
          // 2. Fallback: Query OpenWeather One Call API
          const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${apiKey.trim()}`;
          const oneCallRes = await fetch(oneCallUrl).catch(() => null);
          if (oneCallRes && oneCallRes.ok) {
            const oneCallData = await oneCallRes.json().catch(() => null);
            if (oneCallData && typeof oneCallData.current?.uvi === "number") {
              uvi = oneCallData.current.uvi;
            }
          }
        }
      } catch (uvErr) {
        console.warn("UV index fetch error:", uvErr);
      }

      // 3. Fallback calculation if OpenWeather account tier restricts separate UV endpoints
      if (uvi === null) {
        const dt = currentData.dt || Math.floor(Date.now() / 1000);
        const sunrise = currentData.sys?.sunrise;
        const sunset = currentData.sys?.sunset;
        const clouds = currentData.clouds?.all ?? 20;

        if (sunrise && sunset) {
          if (dt <= sunrise || dt >= sunset) {
            uvi = 0.0;
          } else {
            const t = (dt - sunrise) / (sunset - sunrise);
            const solarFactor = Math.sin(t * Math.PI);
            const latFactor = Math.cos((Math.abs(lat) * Math.PI) / 180);
            const maxUv = 4 + 7 * latFactor;
            const cloudFactor = 1 - (clouds / 100) * 0.7;
            uvi = Math.max(0, Math.round(maxUv * solarFactor * cloudFactor * 10) / 10);
          }
        }
      }
    }

    // 6. Return sanitized current weather + UV index + 5-day forecast
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
      uvi: typeof uvi === "number" ? Math.round(uvi * 10) / 10 : null,
      forecast: forecast
    });
  } catch (error) {
    console.error("Vercel /api/weather error:", error);
    res.status(500).json({
      error: "Unable to retrieve weather information. Please check your internet connection and try again."
    });
  }
};
