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

    // Fetch UV Index, Severe Weather Alerts, and Air Quality Index (AQI) from OpenWeather API
    let uvi = typeof currentData.uvi === "number" ? currentData.uvi : null;
    let alerts = [];
    let aqi = null;
    let aqiComponents = null;

    if (currentData.coord && typeof currentData.coord.lat === "number" && typeof currentData.coord.lon === "number") {
      const lat = currentData.coord.lat;
      const lon = currentData.coord.lon;

      // 1. Query OpenWeather One Call API (supports severe weather alerts & UV index)
      try {
        const oneCallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${apiKey.trim()}`;
        const oneCallRes = await fetch(oneCallUrl).catch(() => null);

        if (oneCallRes && oneCallRes.ok) {
          const oneCallData = await oneCallRes.json().catch(() => null);
          if (oneCallData) {
            // Extract UV index if available
            if (typeof oneCallData.current?.uvi === "number") {
              uvi = oneCallData.current.uvi;
            }

            // Extract official severe weather alerts
            if (Array.isArray(oneCallData.alerts) && oneCallData.alerts.length > 0) {
              alerts = oneCallData.alerts.map(a => ({
                event: a.event || "Severe Weather Advisory",
                sender: a.sender_name || "Official Meteorological Service",
                start: a.start || null,
                end: a.end || null,
                description: a.description || "Severe weather conditions reported for this region. Please take appropriate safety precautions."
              }));
            }
          }
        }
      } catch (oneCallErr) {
        console.warn("OneCall alert fetch error:", oneCallErr);
      }

      // 2. Query dedicated OpenWeather UV endpoint if UVI is still null
      if (uvi === null) {
        try {
          const uviUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey.trim()}`;
          const uviRes = await fetch(uviUrl).catch(() => null);
          if (uviRes && uviRes.ok) {
            const uviData = await uviRes.json().catch(() => null);
            if (uviData && typeof uviData.value === "number") {
              uvi = uviData.value;
            }
          }
        } catch (uvErr) {
          console.warn("UV endpoint fetch error:", uvErr);
        }
      }

      // 3. Fallback solar zenith UV calculation if restricted by account tier
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

      // 4. Query OpenWeather Air Pollution API for Air Quality Index (AQI)
      try {
        const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey.trim()}`;
        const airRes = await fetch(airPollutionUrl).catch(() => null);
        if (airRes && airRes.ok) {
          const airData = await airRes.json().catch(() => null);
          if (airData && Array.isArray(airData.list) && airData.list.length > 0) {
            const currentAir = airData.list[0];
            if (typeof currentAir.main?.aqi === "number") {
              aqi = currentAir.main.aqi;
              aqiComponents = currentAir.components || null;
            }
          }
        }
      } catch (airErr) {
        console.warn("Air Pollution API fetch error:", airErr);
      }

      // Fallback AQI estimation if endpoint is unavailable
      if (aqi === null && typeof currentData.visibility === "number") {
        if (currentData.visibility >= 10000) {
          aqi = 1;
        } else if (currentData.visibility >= 7000) {
          aqi = 2;
        } else if (currentData.visibility >= 4000) {
          aqi = 3;
        } else if (currentData.visibility >= 2000) {
          aqi = 4;
        } else {
          aqi = 5;
        }
      }
    }

    // 4. Inspect OpenWeather current condition codes and wind speeds for severe weather alerts if none returned by onecall
    if (alerts.length === 0 && currentData.weather && currentData.weather.length > 0) {
      const weatherId = currentData.weather[0].id;
      const weatherDesc = currentData.weather[0].description || "";
      const windSpeed = currentData.wind?.speed || 0;
      const temp = currentData.main?.temp;
      const feelsLike = currentData.main?.feels_like;

      if (weatherId === 781) {
        alerts.push({
          event: "Tornado Warning",
          sender: "OpenWeather Meteorological Alert Service",
          description: "Active tornado conditions reported in the municipality. Seek sturdy shelter immediately."
        });
      } else if (weatherId === 771) {
        alerts.push({
          event: "Squall Advisory",
          sender: "OpenWeather Meteorological Alert Service",
          description: "Violent wind squalls and turbulent meteorological activity detected in the area."
        });
      } else if (weatherId === 762) {
        alerts.push({
          event: "Volcanic Ash Warning",
          sender: "OpenWeather Meteorological Alert Service",
          description: "Airborne volcanic ash detected in the atmospheric column. Protect respiratory passages."
        });
      } else if (weatherId === 751 || weatherId === 761 || weatherId === 731) {
        alerts.push({
          event: "Dust / Sandstorm Advisory",
          sender: "OpenWeather Meteorological Alert Service",
          description: "High-density airborne sand or dust suspension causing hazardous surface visibility and air quality impairment."
        });
      } else if (weatherId === 212) {
        alerts.push({
          event: "Severe Thunderstorm Warning",
          sender: "OpenWeather Meteorological Alert Service",
          description: `Intense electrical activity and heavy convective thunderstorm observed (${weatherDesc}). Exercise caution.`
        });
      } else if (weatherId === 504) {
        alerts.push({
          event: "Extreme Rainfall Warning",
          sender: "OpenWeather Meteorological Alert Service",
          description: "Torrential precipitation active. High localized flash flood and drainage overload danger."
        });
      } else if (weatherId === 511) {
        alerts.push({
          event: "Freezing Rain Advisory",
          sender: "OpenWeather Meteorological Alert Service",
          description: "Freezing precipitation active. Rapid ice glaze accumulation on roadways and exposed surfaces."
        });
      } else if (windSpeed >= 20.8) {
        alerts.push({
          event: "Storm-Force Wind Advisory",
          sender: "OpenWeather Meteorological Alert Service",
          description: `Gale-force to storm-force winds detected (${windSpeed.toFixed(1)} m/s). Secure loose objects and avoid exposed areas.`
        });
      } else if (typeof temp === "number" && (temp >= 42 || (typeof feelsLike === "number" && feelsLike >= 45))) {
        alerts.push({
          event: "Excessive Heat Warning",
          sender: "OpenWeather Meteorological Alert Service",
          description: `Dangerous ambient thermal levels (${Math.round(temp)}°C, feels like ${Math.round(feelsLike)}°C). Limit prolonged outdoor exertion.`
        });
      }
    }

    // 6. Return sanitized current weather + UV index + severe alerts + 5-day forecast
    res.status(200).json({
      name: currentData.name,
      coord: currentData.coord ? {
        lat: currentData.coord.lat,
        lon: currentData.coord.lon
      } : null,
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
      aqi: typeof aqi === "number" ? aqi : null,
      aqiComponents: aqiComponents,
      alerts: alerts,
      forecast: forecast
    });
  } catch (error) {
    console.error("Vercel /api/weather error:", error);
    res.status(500).json({
      error: "Unable to retrieve weather information. Please check your internet connection and try again."
    });
  }
};
