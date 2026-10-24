/**
 * ============================================================================
 * Weather App - Main JavaScript Application File (Vercel Architecture)
 * University Undergraduate Mini-Project: "WEATHER APP USING PUBLIC API"
 * ============================================================================
 * 
 * Topics Demonstrated:
 * 1. DOM Selection and Event Listeners
 * 2. Asynchronous JavaScript (async / await)
 * 3. Fetch API and HTTP GET Requests to Serverless Proxy (/api/weather)
 * 4. JSON Parsing and Data Extraction
 * 5. Dynamic DOM Manipulation and State Management
 * 6. Defensive Error Handling & Input Validation
 * 7. Browser Session History Management
 * 8. Server-Side Secret Protection (Zero API keys in client-side code)
 */

// ============================================================================
// 1. STATE & CONSTANTS
// ============================================================================

// Session search history array (stores recent successful queries this session)
let searchHistory = [];

// Track active fetch request state to prevent duplicate concurrent queries
let isLoading = false;

// Country code mapping for friendly display
const countryNames = {
  NG: "Nigeria",
  GH: "Ghana",
  KE: "Kenya",
  ZA: "South Africa",
  EG: "Egypt",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada"
};

// Active temperature unit: 'C' (Celsius) or 'F' (Fahrenheit)
let currentUnit = "C";

// Persistent preference recovery (if available in browser localStorage)
try {
  const savedUnit = localStorage.getItem("fudma_weather_unit");
  if (savedUnit === "F" || savedUnit === "C") {
    currentUnit = savedUnit;
  }
} catch (e) {
  // Graceful fallback for environments with restricted storage
}

// Cached latest weather response to enable instantaneous client-side unit toggling
let lastWeatherData = null;

// ============================================================================
// 2. DOM ELEMENT REFERENCES
// ============================================================================

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const quickCityButtons = document.querySelectorAll(".quick-btn");

const loadingState = document.getElementById("loadingState");
const alertBox = document.getElementById("alertBox");
const alertTitle = document.getElementById("alertTitle");
const alertMessage = document.getElementById("alertMessage");

const weatherCard = document.getElementById("weatherCard");
const initialPlaceholder = document.getElementById("initialPlaceholder");

// Severe weather alert banner elements
const severeAlertBanner = document.getElementById("severeAlertBanner");
const severeAlertSender = document.getElementById("severeAlertSender");
const severeAlertEvent = document.getElementById("severeAlertEvent");
const severeAlertDesc = document.getElementById("severeAlertDesc");
const dismissSevereAlertBtn = document.getElementById("dismissSevereAlertBtn");

// Temperature unit toggle switch elements
const unitToggleBtn = document.getElementById("unitToggleBtn");
const unitOptC = document.getElementById("unitOptC");
const unitOptF = document.getElementById("unitOptF");
const tempUnitElem = document.getElementById("tempUnit");

// User-facing Dark / Light Theme Toggle elements
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeToggleLabel = document.getElementById("themeToggleLabel");

// Share button and toast notification elements
const shareWeatherBtn = document.getElementById("shareWeatherBtn");
const shareBtnText = document.getElementById("shareBtnText");
const toastNotification = document.getElementById("toastNotification");
const toastMessage = document.getElementById("toastMessage");

const cityNameElem = document.getElementById("cityName");
const countryNameElem = document.getElementById("countryName");
const weatherDateElem = document.getElementById("weatherDate");
const currentTempElem = document.getElementById("currentTemp");
const feelsLikeElem = document.getElementById("feelsLike");
const weatherConditionElem = document.getElementById("weatherCondition");
const weatherDescriptionElem = document.getElementById("weatherDescription");
const weatherIconElem = document.getElementById("weatherIcon");

const humidityValueElem = document.getElementById("humidityValue");
const windSpeedValueElem = document.getElementById("windSpeedValue");
const pressureValueElem = document.getElementById("pressureValue");
const visibilityValueElem = document.getElementById("visibilityValue");
const uvIndexValueElem = document.getElementById("uvIndexValue");
const uvIndexRiskElem = document.getElementById("uvIndexRisk");
const aqiIndexValueElem = document.getElementById("aqiIndexValue");
const aqiRiskBadgeElem = document.getElementById("aqiRiskBadge");

// Contextual Weather Tip helper elements
const weatherTipCard = document.getElementById("weatherTipCard");
const weatherTipEmoji = document.getElementById("weatherTipEmoji");
const weatherTipCategory = document.getElementById("weatherTipCategory");
const weatherTipText = document.getElementById("weatherTipText");

const historyContainer = document.getElementById("historyContainer");
const historyChips = document.getElementById("historyChips");

const forecastSection = document.getElementById("forecastSection");
const forecastGrid = document.getElementById("forecastGrid");

// Geographical Location Mini-Map elements (Leaflet.js)
const locationMapSection = document.getElementById("locationMapSection");
const mapCityBadge = document.getElementById("mapCityBadge");
const mapCoordsBadge = document.getElementById("mapCoordsBadge");
const cityMiniMap = document.getElementById("cityMiniMap");
const mapOverlayTitle = document.getElementById("mapOverlayTitle");
const mapOverlayCoords = document.getElementById("mapOverlayCoords");
const mapRecenterBtn = document.getElementById("mapRecenterBtn");
const mapZoomInBtn = document.getElementById("mapZoomInBtn");
const mapZoomOutBtn = document.getElementById("mapZoomOutBtn");
const mapLatDisplay = document.getElementById("mapLatDisplay");
const mapLonDisplay = document.getElementById("mapLonDisplay");

// Leaflet map instance and state variables
let cityMapInstance = null;
let cityMapMarker = null;
let currentMapCoords = { lat: 9.0765, lon: 7.3986, city: "Abuja", country: "Nigeria" };

// Known coordinates fallback dictionary for fast and reliable resolution
const CITY_COORDINATES_MAP = {
  abuja: { lat: 9.0765, lon: 7.3986, country: "Nigeria" },
  lagos: { lat: 6.5244, lon: 3.3792, country: "Nigeria" },
  kano: { lat: 12.0022, lon: 8.5920, country: "Nigeria" },
  ibadan: { lat: 7.3775, lon: 3.9470, country: "Nigeria" },
  "port harcourt": { lat: 4.8156, lon: 7.0498, country: "Nigeria" },
  kaduna: { lat: 10.5105, lon: 7.4165, country: "Nigeria" },
  "benin city": { lat: 6.3350, lon: 5.6037, country: "Nigeria" },
  maiduguri: { lat: 11.8311, lon: 13.1510, country: "Nigeria" },
  zaria: { lat: 11.0855, lon: 7.7199, country: "Nigeria" },
  jos: { lat: 9.8965, lon: 8.8583, country: "Nigeria" },
  ilorin: { lat: 8.4799, lon: 4.5418, country: "Nigeria" },
  enugu: { lat: 6.4584, lon: 7.5464, country: "Nigeria" },
  "dutsin-ma": { lat: 12.4542, lon: 7.4975, country: "Nigeria" },
  "dutsin ma": { lat: 12.4542, lon: 7.4975, country: "Nigeria" },
  katsina: { lat: 12.9908, lon: 7.6018, country: "Nigeria" },
  sokoto: { lat: 13.0609, lon: 5.2476, country: "Nigeria" },
  calabar: { lat: 4.9757, lon: 8.3417, country: "Nigeria" },
  warri: { lat: 5.5167, lon: 5.7500, country: "Nigeria" },
  aba: { lat: 5.1167, lon: 7.3667, country: "Nigeria" },
  onitsha: { lat: 6.1667, lon: 6.7833, country: "Nigeria" },
  abeokuta: { lat: 7.1557, lon: 3.3458, country: "Nigeria" },
  akure: { lat: 7.2571, lon: 5.2058, country: "Nigeria" },
  osogbo: { lat: 7.7827, lon: 4.5418, country: "Nigeria" },
  asaba: { lat: 6.1989, lon: 6.7329, country: "Nigeria" },
  minna: { lat: 9.6139, lon: 6.5569, country: "Nigeria" },
  bauchi: { lat: 10.3158, lon: 9.8442, country: "Nigeria" },
  gombe: { lat: 10.2897, lon: 11.1673, country: "Nigeria" },
  yola: { lat: 9.2003, lon: 12.4836, country: "Nigeria" },
  lafia: { lat: 8.4932, lon: 8.5153, country: "Nigeria" },
  makurdi: { lat: 7.7327, lon: 8.5214, country: "Nigeria" },
  lokoja: { lat: 7.8000, lon: 6.7333, country: "Nigeria" },
  london: { lat: 51.5074, lon: -0.1278, country: "United Kingdom" },
  "new york": { lat: 40.7128, lon: -74.0060, country: "United States" },
  tokyo: { lat: 35.6762, lon: 139.6503, country: "Japan" },
  paris: { lat: 48.8566, lon: 2.3522, country: "France" },
  dubai: { lat: 25.2048, lon: 55.2708, country: "United Arab Emirates" },
  accra: { lat: 5.6037, lon: -0.1870, country: "Ghana" },
  nairobi: { lat: -1.2921, lon: 36.8219, country: "Kenya" },
  cairo: { lat: 30.0444, lon: 31.2357, country: "Egypt" },
  johannesburg: { lat: -26.2041, lon: 28.0473, country: "South Africa" }
};

// ============================================================================
// 3. API INTEGRATION LOGIC (VERCEL SERVERLESS PROXY)
// ============================================================================

/**
 * Dedicated function to fetch real-time weather data.
 * Calls the secure Vercel serverless proxy endpoint: /api/weather?city={cityName}
 * The server securely injects OPENWEATHER_API_KEY without exposing it to the client.
 *
 * @param {string} cityName - Name of the city to query
 * @returns {Promise<Object>} - Parsed JSON response object
 */
async function fetchWeatherData(cityName) {
  const query = cityName ? cityName.trim() : "";
  if (!query) {
    throw new Error("EMPTY_INPUT");
  }

  // Pre-flight check: Verify connectivity before network dispatch
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("OFFLINE");
  }

  // Target Vercel serverless endpoint
  const endpoint = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.WEATHER_API_ENDPOINT)
    ? APP_CONFIG.WEATHER_API_ENDPOINT
    : "/api/weather";

  const url = `${endpoint}?city=${encodeURIComponent(query)}`;

  // Execute asynchronous HTTP GET request
  const response = await fetch(url);

  // Safely parse JSON response payload
  const payload = await response.json().catch(() => null);

  // Handle HTTP error status codes from the serverless API
  if (!response.ok) {
    const serverMessage = payload && payload.error ? payload.error : "";
    if (payload && payload.offline) {
      throw new Error("OFFLINE");
    } else if (response.status === 404) {
      throw new Error("CITY_NOT_FOUND");
    } else if (response.status === 401) {
      throw new Error(serverMessage || "INVALID_API_KEY");
    } else if (response.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    } else if (response.status === 400) {
      throw new Error("EMPTY_INPUT");
    } else {
      throw new Error(serverMessage || "SERVER_ERROR");
    }
  }

  if (!payload) {
    throw new Error("SERVER_ERROR");
  }

  return payload;
}

// ============================================================================
// 4. UI RENDERING & DOM MANIPULATION
// ============================================================================

/**
 * Converts a temperature value from Celsius to the active unit (°C or °F).
 * 
 * @param {number|string} celsiusVal - Temperature in Celsius
 * @param {string} unit - Target unit ('C' or 'F')
 * @returns {number|string} - Converted integer value or fallback string
 */
function convertTemperature(celsiusVal, unit = currentUnit) {
  if (typeof celsiusVal !== "number" || isNaN(celsiusVal)) {
    const parsed = parseFloat(celsiusVal);
    if (!isNaN(parsed)) {
      celsiusVal = parsed;
    } else {
      return "--";
    }
  }

  if (unit === "F") {
    return Math.round((celsiusVal * 9) / 5 + 32);
  }
  return Math.round(celsiusVal);
}

/**
 * Updates all displayed temperature values across the UI to match currentUnit.
 * Modifies:
 * - Current temperature value (#currentTemp)
 * - Temperature unit indicator (#tempUnit)
 * - Feels-like temperature text (#feelsLike)
 * - 5-Day forecast cards (#forecastGrid)
 * - Toggle switch slider position and ARIA state
 */
function updateTemperatureDisplays() {
  const isFahrenheit = currentUnit === "F";
  const unitSymbol = isFahrenheit ? "°F" : "°C";

  // 1. Update toggle switch ARIA attributes and option states
  if (unitToggleBtn) {
    unitToggleBtn.setAttribute("aria-checked", isFahrenheit ? "true" : "false");
    unitToggleBtn.setAttribute(
      "aria-label",
      `Temperature unit is ${isFahrenheit ? "Fahrenheit" : "Celsius"}. Click to switch to ${isFahrenheit ? "Celsius" : "Fahrenheit"}.`
    );
  }

  if (unitOptC && unitOptF) {
    if (isFahrenheit) {
      unitOptC.classList.remove("active");
      unitOptF.classList.add("active");
    } else {
      unitOptC.classList.add("active");
      unitOptF.classList.remove("active");
    }
  }

  // 2. Update CSS helper classes for forecast pseudo-elements
  if (weatherCard) {
    if (isFahrenheit) {
      weatherCard.classList.add("unit-f");
    } else {
      weatherCard.classList.remove("unit-f");
    }
  }
  if (forecastSection) {
    if (isFahrenheit) {
      forecastSection.classList.add("unit-f");
    } else {
      forecastSection.classList.remove("unit-f");
    }
  }

  // 3. Update main unit indicator
  if (tempUnitElem) {
    tempUnitElem.textContent = unitSymbol;
  }

  // 4. Update current temp and feels-like temp
  if (lastWeatherData && lastWeatherData.main) {
    const rawTemp = lastWeatherData.main.temp;
    const rawFeelsLike = lastWeatherData.main.feels_like;

    if (currentTempElem) {
      const displayTemp = convertTemperature(rawTemp);
      currentTempElem.textContent = `${displayTemp}`;

      // Subtle pulse animation on unit switch
      currentTempElem.classList.remove("animate-update");
      void currentTempElem.offsetWidth;
      currentTempElem.classList.add("animate-update");
    }

    if (feelsLikeElem) {
      const displayFeelsLike = convertTemperature(rawFeelsLike);
      feelsLikeElem.textContent = `Feels Like: ${displayFeelsLike}${unitSymbol}`;
    }

    // 5. Update forecast cards
    if (Array.isArray(lastWeatherData.forecast) && lastWeatherData.forecast.length > 0) {
      renderForecast(lastWeatherData.forecast);
    }

    // 6. Update Leaflet map marker popup if map is active
    if (cityMapMarker && typeof L !== "undefined" && currentMapCoords) {
      const displayTemp = convertTemperature(rawTemp);
      const cond = lastWeatherData.weather?.[0]?.main || "Clear";
      const iconCd = lastWeatherData.weather?.[0]?.icon || "01d";
      const cName = lastWeatherData.name || currentMapCoords.city || "";
      const cCountry = countryNames[lastWeatherData.sys?.country] || lastWeatherData.sys?.country || currentMapCoords.country || "";
      const latStr = formatCoordinate(currentMapCoords.lat, true);
      const lonStr = formatCoordinate(currentMapCoords.lon, false);
      const coordsCombined = `${latStr}, ${lonStr}`;
      const popupHtml = `
        <div class="weather-map-popup">
          <div class="weather-map-popup-header">
            <img class="weather-map-popup-icon" src="https://openweathermap.org/img/wn/${iconCd}@2x.png" alt="${cond}">
            <div>
              <div class="weather-map-popup-city">${cName}${cCountry ? ', ' + cCountry : ''}</div>
              <span class="weather-map-popup-badge">${displayTemp}°${unitSymbol} • ${cond}</span>
            </div>
          </div>
          <div class="weather-map-popup-coords">📍 ${coordsCombined}</div>
        </div>
      `;
      cityMapMarker.setPopupContent(popupHtml);
    }
  } else {
    // If user flips toggle prior to first fetch, keep initial demo values in sync
    if (currentTempElem) {
      const defaultCelsius = 28;
      currentTempElem.textContent = `${convertTemperature(defaultCelsius)}`;
    }
    if (feelsLikeElem) {
      const defaultFeelsLikeCelsius = 31;
      feelsLikeElem.textContent = `Feels Like: ${convertTemperature(defaultFeelsLikeCelsius)}${unitSymbol}`;
    }
  }
}

/**
 * Sets the active temperature unit to 'C' or 'F' and updates the UI.
 * 
 * @param {string} unit - 'C' or 'F'
 */
function setTemperatureUnit(unit) {
  if (unit !== "C" && unit !== "F") return;
  if (currentUnit === unit) return;
  currentUnit = unit;
  try {
    localStorage.setItem("fudma_weather_unit", currentUnit);
  } catch (e) {
    // Graceful fallback for restricted storage
  }
  updateTemperatureDisplays();
}

/**
 * Toggles the temperature unit between Celsius and Fahrenheit.
 */
function toggleTemperatureUnit() {
  const nextUnit = currentUnit === "C" ? "F" : "C";
  setTemperatureUnit(nextUnit);
}

/**
 * Applies weather-condition theme classes to the .weather-card element
 * so CSS animations and gradients subtly transition based on current meteorological conditions
 * (warm ambers for sunny, cool blues for rainy, fresh cyans for drizzle, deep indigo for storm, etc.).
 * 
 * @param {HTMLElement} card - The .weather-card DOM element
 * @param {number} weatherId - OpenWeather weather condition ID
 * @param {string} condition - Main weather condition string (e.g. "Clear", "Rain")
 * @param {number} tempC - Current temperature in Celsius
 */
function applyWeatherCardTheme(card, weatherId, condition, tempC) {
  if (!card) return;

  const allThemes = [
    "weather-theme-clear",
    "weather-theme-clouds",
    "weather-theme-rain",
    "weather-theme-drizzle",
    "weather-theme-thunderstorm",
    "weather-theme-snow",
    "weather-theme-atmosphere"
  ];
  allThemes.forEach(cls => card.classList.remove(cls));

  const cond = (condition || "").toLowerCase().trim();
  let selectedTheme = "weather-theme-clear";

  if (weatherId >= 200 && weatherId < 300) {
    selectedTheme = "weather-theme-thunderstorm";
  } else if (weatherId >= 300 && weatherId < 400) {
    selectedTheme = "weather-theme-drizzle";
  } else if (weatherId >= 500 && weatherId < 600) {
    selectedTheme = "weather-theme-rain";
  } else if (weatherId >= 600 && weatherId < 700) {
    selectedTheme = "weather-theme-snow";
  } else if (weatherId >= 700 && weatherId < 800) {
    selectedTheme = "weather-theme-atmosphere";
  } else if (weatherId === 800) {
    selectedTheme = "weather-theme-clear";
  } else if (weatherId > 800) {
    selectedTheme = "weather-theme-clouds";
  } else {
    // Condition string fallback
    if (cond.includes("thunder") || cond.includes("storm") || cond.includes("lightning")) {
      selectedTheme = "weather-theme-thunderstorm";
    } else if (cond.includes("drizzle")) {
      selectedTheme = "weather-theme-drizzle";
    } else if (cond.includes("rain") || cond.includes("shower")) {
      selectedTheme = "weather-theme-rain";
    } else if (cond.includes("snow") || cond.includes("sleet") || cond.includes("ice") || cond.includes("blizzard")) {
      selectedTheme = "weather-theme-snow";
    } else if (cond.includes("cloud") || cond.includes("overcast")) {
      selectedTheme = "weather-theme-clouds";
    } else if (cond.includes("mist") || cond.includes("fog") || cond.includes("haze") || cond.includes("dust") || cond.includes("smoke")) {
      selectedTheme = "weather-theme-atmosphere";
    } else {
      selectedTheme = "weather-theme-clear";
    }
  }

  card.classList.add(selectedTheme);
}

/**
 * Renders the fetched weather data into the UI components.
 * 
 * @param {Object} data - Clean JSON object from serverless API
 */
function renderWeatherData(data) {
  hideLoadingState();
  hideError();

  // Cache latest dataset for instant client-side unit toggling
  lastWeatherData = data;

  // Extract core fields from JSON payload
  const city = data.name;
  const countryCode = data.sys && data.sys.country ? data.sys.country : "";
  const countryDisplayName = countryNames[countryCode] || countryCode || "";

  const isFahrenheit = currentUnit === "F";
  const unitSymbol = isFahrenheit ? "°F" : "°C";

  // Temperatures converted based on active unit
  const temp = typeof data.main?.temp === "number" ? convertTemperature(data.main.temp) : "--";
  const feelsLike = typeof data.main?.feels_like === "number" ? convertTemperature(data.main.feels_like) : "--";

  // Weather description & conditions
  const weatherObj = data.weather && data.weather.length > 0 ? data.weather[0] : null;
  const condition = weatherObj ? weatherObj.main : "Clear";
  const description = weatherObj ? weatherObj.description : "No description available";
  const iconCode = weatherObj ? weatherObj.icon : "01d";

  // Detailed atmospheric metrics
  const humidity = data.main?.humidity !== undefined ? data.main.humidity : "--";
  const windSpeed = typeof data.wind?.speed === "number" ? data.wind.speed.toFixed(1) : "0.0";
  const pressure = data.main?.pressure !== undefined ? data.main.pressure : "--";
  
  // Visibility in meters -> convert to kilometers
  let visibilityDisplay = "N/A";
  if (typeof data.visibility === "number") {
    const visKm = (data.visibility / 1000).toFixed(1);
    visibilityDisplay = `${visKm} km`;
  }

  // Update text content across elements
  cityNameElem.textContent = city;
  countryNameElem.textContent = countryDisplayName ? `, ${countryDisplayName}` : "";
  weatherDateElem.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  currentTempElem.textContent = `${temp}`;
  if (tempUnitElem) tempUnitElem.textContent = unitSymbol;
  feelsLikeElem.textContent = `Feels Like: ${feelsLike}${unitSymbol}`;
  weatherConditionElem.textContent = condition;
  weatherDescriptionElem.textContent = description;

  // Ensure switch visual and accessibility attributes match currentUnit
  if (unitToggleBtn) {
    unitToggleBtn.setAttribute("aria-checked", isFahrenheit ? "true" : "false");
  }
  if (unitOptC && unitOptF) {
    if (isFahrenheit) {
      unitOptC.classList.remove("active");
      unitOptF.classList.add("active");
    } else {
      unitOptC.classList.add("active");
      unitOptF.classList.remove("active");
    }
  }
  if (weatherCard) {
    if (isFahrenheit) {
      weatherCard.classList.add("unit-f");
    } else {
      weatherCard.classList.remove("unit-f");
    }
  }

  // Trigger subtle CSS entrance animation (fade-in & gentle scale-up) on weather icon
  if (weatherIconElem) {
    const newIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIconElem.alt = description;

    const triggerIconEntrance = () => {
      weatherIconElem.classList.remove("animate-update");
      void weatherIconElem.offsetWidth; // Force reflow to re-trigger entrance animation
      weatherIconElem.classList.add("animate-update");
    };

    if (weatherIconElem.src !== newIconUrl) {
      weatherIconElem.classList.remove("animate-update");
      weatherIconElem.onload = () => {
        triggerIconEntrance();
      };
      weatherIconElem.src = newIconUrl;
    } else {
      triggerIconEntrance();
    }
  }

  // Trigger subtle CSS animation on temperature display
  if (currentTempElem) {
    currentTempElem.classList.remove("animate-update");
    void currentTempElem.offsetWidth; // Force reflow to re-trigger animation
    currentTempElem.classList.add("animate-update");
  }

  // Update metrics grid
  humidityValueElem.textContent = `${humidity}%`;
  windSpeedValueElem.textContent = `${windSpeed} m/s`;
  pressureValueElem.textContent = `${pressure} hPa`;
  visibilityValueElem.textContent = visibilityDisplay;

  // UV Index metric and risk categorization
  if (uvIndexValueElem) {
    if (typeof data.uvi === "number") {
      const uviVal = Math.round(data.uvi * 10) / 10;
      uvIndexValueElem.textContent = `${uviVal}`;

      if (uvIndexRiskElem) {
        let riskLabel = "Low";
        let riskClass = "uv-low";
        if (uviVal >= 11) {
          riskLabel = "Extreme";
          riskClass = "uv-extreme";
        } else if (uviVal >= 8) {
          riskLabel = "Very High";
          riskClass = "uv-very-high";
        } else if (uviVal >= 6) {
          riskLabel = "High";
          riskClass = "uv-high";
        } else if (uviVal >= 3) {
          riskLabel = "Moderate";
          riskClass = "uv-moderate";
        }
        uvIndexRiskElem.textContent = riskLabel;
        uvIndexRiskElem.className = `uv-risk-badge ${riskClass}`;
        uvIndexRiskElem.style.display = "inline-flex";
      }
    } else {
      uvIndexValueElem.textContent = "N/A";
      if (uvIndexRiskElem) {
        uvIndexRiskElem.style.display = "none";
      }
    }
  }

  // Air Quality Index (AQI) metric and categorization
  if (aqiIndexValueElem) {
    if (typeof data.aqi === "number") {
      const aqiVal = data.aqi;
      aqiIndexValueElem.textContent = `${aqiVal}`;

      if (aqiRiskBadgeElem) {
        let aqiLabel = "Good";
        let aqiClass = "aqi-good";
        if (aqiVal === 1) {
          aqiLabel = "Good";
          aqiClass = "aqi-good";
        } else if (aqiVal === 2) {
          aqiLabel = "Fair";
          aqiClass = "aqi-fair";
        } else if (aqiVal === 3) {
          aqiLabel = "Moderate";
          aqiClass = "aqi-moderate";
        } else if (aqiVal === 4) {
          aqiLabel = "Poor";
          aqiClass = "aqi-poor";
        } else if (aqiVal >= 5) {
          aqiLabel = "Very Poor";
          aqiClass = "aqi-very-poor";
        }
        aqiRiskBadgeElem.textContent = aqiLabel;
        aqiRiskBadgeElem.className = `aqi-badge ${aqiClass}`;
        aqiRiskBadgeElem.style.display = "inline-flex";
      }
    } else {
      aqiIndexValueElem.textContent = "N/A";
      if (aqiRiskBadgeElem) {
        aqiRiskBadgeElem.style.display = "none";
      }
    }
  }

  // Reveal weather card with subtle fade-in and scale-up animation
  if (initialPlaceholder) initialPlaceholder.style.display = "none";
  if (weatherCard) {
    // Apply meteorological condition theme class for smooth background gradient transition
    const weatherId = weatherObj && typeof weatherObj.id === "number" ? weatherObj.id : 800;
    const rawTempC = typeof data.main?.temp === "number" ? data.main.temp : 25;
    applyWeatherCardTheme(weatherCard, weatherId, condition, rawTempC);

    weatherCard.classList.remove("active");
    weatherCard.classList.remove("animate-card");
    void weatherCard.offsetWidth; // Force reflow to smoothly re-trigger fade-in and scale-up animation
    weatherCard.classList.add("active");
    weatherCard.classList.add("animate-card");
  }

  // Render 5-day weather forecast with upcoming high and low temperatures
  renderForecast(data.forecast);

  // Check and display severe weather alert banner if any active advisories
  renderSevereAlerts(data.alerts);

  // Render contextual helper tip below the main presentation card
  renderContextualTip(data);

  // Render interactive geographical mini-map using Leaflet.js
  initOrUpdateCityMap(data.coord, city, countryDisplayName, temp, condition, iconCode);

  // Add to session search history
  addToSessionHistory(city);
}

/**
 * Renders the 5-day weather forecast section.
 * 
 * @param {Array} forecastList - Array of daily forecast objects
 */
function renderForecast(forecastList) {
  if (!forecastSection || !forecastGrid) return;

  if (!Array.isArray(forecastList) || forecastList.length === 0) {
    forecastSection.style.display = "none";
    forecastSection.classList.remove("active");
    return;
  }

  const isFahrenheit = currentUnit === "F";
  const unitSymbol = isFahrenheit ? "°F" : "°C";

  if (isFahrenheit) {
    forecastSection.classList.add("unit-f");
  } else {
    forecastSection.classList.remove("unit-f");
  }

  forecastGrid.innerHTML = "";

  forecastList.forEach(day => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    const conditionText = day.condition || "Clear";
    const descText = day.description || conditionText;
    const iconCode = day.icon || "01d";
    const displayMax = typeof day.tempMax === "number" ? convertTemperature(day.tempMax) : day.tempMax;
    const displayMin = typeof day.tempMin === "number" ? convertTemperature(day.tempMin) : day.tempMin;

    card.innerHTML = `
      <div class="forecast-day-wrap">
        <span class="forecast-day">${day.dayName || ""}</span>
        <span class="forecast-date">${day.formattedDate || ""}</span>
      </div>
      <div class="forecast-condition-wrap">
        <img class="forecast-icon-img" src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${descText}">
        <span class="forecast-condition" title="${descText}">${conditionText}</span>
      </div>
      <div class="forecast-temp-range" title="Upcoming High: ${displayMax}${unitSymbol} | Low: ${displayMin}${unitSymbol}">
        <span class="temp-high" title="Upcoming High">${displayMax}</span>
        <span class="temp-separator">/</span>
        <span class="temp-low" title="Upcoming Low">${displayMin}</span>
      </div>
    `;

    forecastGrid.appendChild(card);
  });

  forecastSection.style.display = "block";
  forecastSection.classList.add("active");
}

/**
 * Renders or hides severe weather alerts banner based on API alerts.
 * 
 * @param {Array} alerts - Array of alert objects from OpenWeather
 */
function renderSevereAlerts(alerts) {
  if (!severeAlertBanner) return;

  if (Array.isArray(alerts) && alerts.length > 0) {
    const alertData = alerts[0]; // Primary active advisory
    if (severeAlertSender) {
      severeAlertSender.textContent = alertData.sender || "Official Meteorological Service";
    }
    if (severeAlertEvent) {
      severeAlertEvent.textContent = alertData.event || "Severe Weather Advisory";
    }
    if (severeAlertDesc) {
      severeAlertDesc.textContent = alertData.description || "Severe meteorological conditions reported for this region. Please take appropriate safety precautions.";
    }
    severeAlertBanner.style.display = "flex";
  } else {
    severeAlertBanner.style.display = "none";
  }
}

/**
 * Dismisses or hides the severe weather alert banner.
 */
function hideSevereAlert() {
  if (severeAlertBanner) {
    severeAlertBanner.style.display = "none";
  }
}

/**
 * Renders a contextual helper tip component below the main weather presentation card
 * based on current atmospheric conditions, temperature, UV, and air quality.
 * 
 * @param {Object} data - Processed weather data payload
 */
function renderContextualTip(data) {
  if (!weatherTipCard || !weatherTipText || !weatherTipEmoji) return;
  if (!data || !data.main) {
    weatherTipCard.style.display = "none";
    return;
  }

  const tempC = typeof data.main.temp === "number" ? data.main.temp : 25;
  const weatherObj = data.weather && data.weather.length > 0 ? data.weather[0] : null;
  const weatherId = weatherObj && typeof weatherObj.id === "number" ? weatherObj.id : 800;
  const condition = weatherObj ? (weatherObj.main || "").toLowerCase() : "";
  const windSpeed = typeof data.wind?.speed === "number" ? data.wind.speed : 0;
  const uvi = typeof data.uvi === "number" ? data.uvi : 0;
  const aqi = typeof data.aqi === "number" ? data.aqi : 1;

  let emoji = "💡";
  let tip = "Check current conditions and stay prepared for daily weather changes.";
  let category = "General Advice";
  let themeClass = "tip-theme-good";

  // 1. Extreme storm hazards & active alerts
  if (weatherId === 781 || weatherId === 771) {
    emoji = "🚨";
    category = "Storm Safety";
    tip = "Extreme storm conditions reported: seek sturdy shelter immediately and stay away from windows.";
    themeClass = "tip-theme-warning";
  } else if (Array.isArray(data.alerts) && data.alerts.length > 0) {
    emoji = "⚠️";
    category = "Weather Advisory";
    tip = `Active alert: ${data.alerts[0].event || "Meteorological Advisory"}. Exercise extra caution today.`;
    themeClass = "tip-theme-warning";
  }
  // 2. Thunderstorm
  else if (weatherId >= 200 && weatherId < 300) {
    emoji = "⛈️";
    category = "Thunderstorm Safety";
    tip = "Thunderstorms active: stay indoors, avoid open fields, and keep an umbrella handy.";
    themeClass = "tip-theme-rain";
  }
  // 3. Rain & Drizzle
  else if (weatherId >= 300 && weatherId < 600) {
    emoji = "☔";
    category = "Rain Gear";
    tip = "Rainy weather: carry an umbrella, wear waterproof shoes, and drive with care.";
    themeClass = "tip-theme-rain";
  }
  // 4. Snow
  else if (weatherId >= 600 && weatherId < 700) {
    emoji = "❄️";
    category = "Winter Advisory";
    tip = "Snow conditions: dress in thermal layers, wear insulated boots, and beware of slick roads.";
    themeClass = "tip-theme-cold";
  }
  // 5. Reduced visibility (Fog, Mist, Haze, Dust)
  else if (weatherId >= 700 && weatherId < 800) {
    emoji = "🌫️";
    category = "Low Visibility";
    tip = "Reduced visibility from atmospheric haze or fog: use low-beam headlights and reduce driving speed.";
    themeClass = "tip-theme-warning";
  }
  // 6. Extreme Heat
  else if (tempC >= 35) {
    emoji = "🥵";
    category = "Heat Precautions";
    tip = "Extreme heat advisory: stay hydrated, avoid direct sun exposure between 12 PM - 3 PM, and seek cool spaces.";
    themeClass = "tip-theme-heat";
  }
  // 7. High Heat
  else if (tempC >= 30) {
    emoji = "💧";
    category = "Hydration Reminder";
    tip = "High temperatures: drink plenty of water throughout the day, wear light breathable clothes, and stay hydrated.";
    themeClass = "tip-theme-heat";
  }
  // 8. Freezing cold
  else if (tempC <= 5) {
    emoji = "🧤";
    category = "Cold Protection";
    tip = "Freezing temperatures: bundle up with a heavy coat, gloves, and a warm hat before heading outside.";
    themeClass = "tip-theme-cold";
  }
  // 9. Chilly
  else if (tempC <= 15) {
    emoji = "🧥";
    category = "Chilly Weather";
    tip = "Brisk and cool: a light jacket, sweater, or hoodie is recommended when stepping out.";
    themeClass = "tip-theme-cold";
  }
  // 10. High UV Index
  else if (uvi >= 8) {
    emoji = "🕶️";
    category = "Sun Protection";
    tip = "Very high UV radiation: wear sunglasses, apply sunscreen (SPF 30+), and wear a wide-brimmed hat.";
    themeClass = "tip-theme-heat";
  }
  // 11. High Air Pollution (AQI 4 or 5)
  else if (aqi >= 4) {
    emoji = "😷";
    category = "Air Quality";
    tip = "Elevated air pollution levels: consider wearing a protective mask outdoors and limit strenuous exercise.";
    themeClass = "tip-theme-warning";
  }
  // 12. Strong winds
  else if (windSpeed >= 8.5) {
    emoji = "💨";
    category = "Wind Advisory";
    tip = "Gusty winds: secure outdoor patio items and hold on to your umbrella tightly.";
    themeClass = "tip-theme-rain";
  }
  // 13. Mild / Pleasant Clear Skies
  else if (condition === "clear" && tempC >= 18 && tempC < 30) {
    emoji = "✨";
    category = "Pleasant Weather";
    tip = "Clear skies and comfortable temperatures: ideal weather for outdoor recreation or a study session!";
    themeClass = "tip-theme-good";
  }
  // 14. Cloudy / Overcast
  else if (condition === "clouds") {
    emoji = "☁️";
    category = "Cloudy Day";
    tip = "Mild overcast conditions: great weather for outdoor walks and commuting without harsh sun glare.";
    themeClass = "tip-theme-good";
  }

  weatherTipEmoji.textContent = emoji;
  weatherTipText.textContent = tip;
  if (weatherTipCategory) weatherTipCategory.textContent = category;

  // Apply contextual theme class
  weatherTipCard.className = `weather-tip-card ${themeClass}`;
  weatherTipCard.style.display = "flex";
}

/**
 * Formats decimal degrees into standard compass notation (e.g. 9.0765° N, 7.3986° E).
 * 
 * @param {number} val - Coordinate value
 * @param {boolean} isLat - True for latitude, false for longitude
 * @returns {string} - Formatted coordinate
 */
function formatCoordinate(val, isLat) {
  if (typeof val !== "number" || isNaN(val)) return "--";
  const absVal = Math.abs(val).toFixed(4);
  const dir = isLat ? (val >= 0 ? "° N" : "° S") : (val >= 0 ? "° E" : "° W");
  return `${absVal}${dir}`;
}

/**
 * Initializes or updates the interactive Leaflet.js mini-map pinpointing the selected municipality.
 * 
 * @param {Object} coord - { lat: number, lon: number } from API
 * @param {string} cityName - Name of the city
 * @param {string} countryName - Name of the country
 * @param {number|string} temp - Current temperature
 * @param {string} condition - Current condition (e.g. Clear, Rain)
 * @param {string} iconCode - OpenWeather condition icon code
 */
function initOrUpdateCityMap(coord, cityName, countryName, temp, condition, iconCode) {
  if (!locationMapSection) return;

  // 1. Resolve coordinates from payload or fallback dictionary
  let lat = null;
  let lon = null;

  if (coord && typeof coord.lat === "number" && typeof coord.lon === "number") {
    lat = coord.lat;
    lon = coord.lon;
  } else {
    const key = (cityName || "").toLowerCase().trim();
    if (CITY_COORDINATES_MAP[key]) {
      lat = CITY_COORDINATES_MAP[key].lat;
      lon = CITY_COORDINATES_MAP[key].lon;
    }
  }

  // If coordinates cannot be established, keep section hidden
  if (lat === null || lon === null) {
    locationMapSection.style.display = "none";
    return;
  }

  // Update tracking state
  currentMapCoords = {
    lat: lat,
    lon: lon,
    city: cityName,
    country: countryName || ""
  };

  const latStr = formatCoordinate(lat, true);
  const lonStr = formatCoordinate(lon, false);
  const coordsCombined = `${latStr}, ${lonStr}`;
  const fullLocationName = countryName ? `${cityName}, ${countryName}` : cityName;

  // Update metadata badges and labels
  if (mapCityBadge) mapCityBadge.textContent = cityName;
  if (mapCoordsBadge) mapCoordsBadge.textContent = coordsCombined;
  if (mapOverlayTitle) mapOverlayTitle.textContent = fullLocationName;
  if (mapOverlayCoords) mapOverlayCoords.textContent = `Lat: ${lat.toFixed(4)} • Lon: ${lon.toFixed(4)}`;
  if (mapLatDisplay) mapLatDisplay.textContent = latStr;
  if (mapLonDisplay) mapLonDisplay.textContent = lonStr;

  // Reveal map card
  locationMapSection.style.display = "block";

  // Check if Leaflet mapping library is loaded
  if (typeof L === "undefined") {
    if (cityMiniMap) {
      cityMiniMap.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:0.875rem;padding:1rem;text-align:center;">
          <div>
            <p style="font-weight:700;color:#0f172a;margin-bottom:0.25rem;">📍 ${fullLocationName}</p>
            <p style="font-variant-numeric:tabular-nums;margin-bottom:0.5rem;color:#0369a1;">${coordsCombined}</p>
            <p style="font-size:0.775rem;">Interactive map will render when online connectivity is restored.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  try {
    const popupHtml = `
      <div class="weather-map-popup">
        <div class="weather-map-popup-header">
          <img class="weather-map-popup-icon" src="https://openweathermap.org/img/wn/${iconCode || '01d'}@2x.png" alt="${condition}">
          <div>
            <div class="weather-map-popup-city">${cityName}${countryName ? ', ' + countryName : ''}</div>
            <span class="weather-map-popup-badge">${temp}°${currentUnit} • ${condition}</span>
          </div>
        </div>
        <div class="weather-map-popup-coords">📍 ${coordsCombined}</div>
      </div>
    `;

    // Initialize Leaflet map instance on first query
    if (!cityMapInstance) {
      cityMapInstance = L.map("cityMiniMap", {
        center: [lat, lon],
        zoom: 12,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true
      });

      // Add high-contrast OpenStreetMap raster tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(cityMapInstance);

      // Create distinctive pulse-ring marker pin
      const pinIcon = L.divIcon({
        className: "custom-map-pin",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12]
      });

      cityMapMarker = L.marker([lat, lon], {
        icon: pinIcon,
        title: cityName
      }).addTo(cityMapInstance);

      cityMapMarker.bindPopup(popupHtml);
      cityMapMarker.openPopup();
    } else {
      // Smoothly pan and re-center on the new location
      cityMapInstance.setView([lat, lon], 12, { animate: true, duration: 0.8 });

      if (cityMapMarker) {
        cityMapMarker.setLatLng([lat, lon]);
        cityMapMarker.setPopupContent(popupHtml);
        cityMapMarker.openPopup();
      }
    }

    // Force Leaflet container re-measurement after CSS rendering settles
    setTimeout(() => {
      if (cityMapInstance) {
        cityMapInstance.invalidateSize();
      }
    }, 250);
  } catch (err) {
    console.warn("Leaflet mini-map error:", err);
  }
}

/**
 * Activates loading state: shows spinner and disables search buttons.
 */
function showLoadingState() {
  isLoading = true;
  hideError();
  hideSevereAlert();
  if (weatherTipCard) weatherTipCard.style.display = "none";
  loadingState.classList.add("active");
  searchButton.disabled = true;
  searchButton.innerHTML = `
    <span class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span>
    <span>Searching...</span>
  `;
}

/**
 * Deactivates loading state and restores interactive buttons.
 */
function hideLoadingState() {
  isLoading = false;
  loadingState.classList.remove("active");
  searchButton.disabled = false;
  searchButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    <span>Search</span>
  `;
}

/**
 * Displays user-friendly error message based on error classification.
 * 
 * @param {string} type - Error classification identifier
 * @param {string} customMsg - Optional specific message
 */
function showError(type, customMsg = "") {
  hideLoadingState();
  hideSevereAlert();
  if (weatherTipCard) weatherTipCard.style.display = "none";
  if (locationMapSection) locationMapSection.style.display = "none";
  if (forecastSection) {
    forecastSection.style.display = "none";
    forecastSection.classList.remove("active");
  }

  let title = "Notice";
  let message = "Unable to retrieve weather information. Please try again.";

  switch (type) {
    case "EMPTY_INPUT":
      title = "Input Required";
      message = "Please enter a city name.";
      break;
    case "OFFLINE":
      title = "You Are Offline";
      message = "You are currently offline. Live weather information requires an internet connection.";
      break;
    case "CITY_NOT_FOUND":
      title = "City Not Found";
      message = "City not found. Please check the spelling and try again.";
      break;
    case "RATE_LIMIT_EXCEEDED":
      title = "Rate Limit Reached";
      message = "API rate limit reached. Please wait a few moments and try again.";
      break;
    case "NETWORK_ERROR":
      title = "Network Connection Issue";
      message = "Network error. Please check your internet connection and try again.";
      break;
    default:
      if (customMsg) {
        message = customMsg;
      }
      break;
  }

  alertTitle.textContent = title;
  alertMessage.textContent = message;
  alertBox.classList.add("active");
}

/**
 * Dismisses error alert box.
 */
function hideError() {
  alertBox.classList.remove("active");
}

// ============================================================================
// 5. SESSION SEARCH HISTORY
// ============================================================================

/**
 * Adds queried city to session search history.
 * 
 * @param {string} city - Name of the queried city
 */
function addToSessionHistory(city) {
  const normalized = city.trim();
  if (!searchHistory.includes(normalized)) {
    searchHistory.unshift(normalized);
    if (searchHistory.length > 5) {
      searchHistory.pop(); // Keep maximum 5 recent queries
    }
    renderSessionHistory();
  }
}

/**
 * Renders interactive chips for quick re-searching.
 */
function renderSessionHistory() {
  if (searchHistory.length === 0) {
    historyContainer.classList.remove("active");
    return;
  }

  historyChips.innerHTML = "";
  searchHistory.forEach(city => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "history-chip";
    chip.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>${city}</span>
    `;
    chip.addEventListener("click", () => {
      cityInput.value = city;
      handleSearch(city);
    });
    historyChips.appendChild(chip);
  });

  historyContainer.classList.add("active");
}

// ============================================================================
// 6. WEATHER SUMMARY SHARING & CLIPBOARD CONTROLLER
// ============================================================================

let toastTimer = null;
let shareSuccessResetTimer = null;

/**
 * Displays a non-intrusive floating toast notification.
 * 
 * @param {string} message - Notification text
 * @param {number} duration - Display time in ms
 */
function showToast(message, duration = 2800) {
  if (!toastNotification) return;

  if (toastMessage) {
    toastMessage.textContent = message;
  }
  toastNotification.classList.add("active");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toastNotification.classList.remove("active");
  }, duration);
}

/**
 * Generates an informative, formatted text summary of current weather conditions.
 * Respects the active temperature unit (°C / °F) and active alert states.
 * 
 * @returns {string} Formatted text summary suitable for messaging and clipboard
 */
function generateWeatherSummary() {
  const city = cityNameElem ? cityNameElem.textContent.trim() : "Current Location";
  const rawCountry = countryNameElem ? countryNameElem.textContent.trim() : "";
  const country = rawCountry.replace(/^,\s*/, "");
  const locationText = country ? `${city}, ${country}` : city;
  const dateText = weatherDateElem ? weatherDateElem.textContent.trim() : new Date().toLocaleDateString();

  const temp = currentTempElem ? currentTempElem.textContent.trim() : "--";
  const unit = tempUnitElem ? tempUnitElem.textContent.trim() : "°C";
  const rawFeels = feelsLikeElem ? feelsLikeElem.textContent.trim() : "";
  const feelsLike = rawFeels.replace(/^Feels Like:\s*/i, "");

  const condition = weatherConditionElem ? weatherConditionElem.textContent.trim() : "Clear";
  const description = weatherDescriptionElem ? weatherDescriptionElem.textContent.trim() : "";

  const humidity = humidityValueElem ? humidityValueElem.textContent.trim() : "--";
  const windSpeed = windSpeedValueElem ? windSpeedValueElem.textContent.trim() : "--";
  const pressure = pressureValueElem ? pressureValueElem.textContent.trim() : "--";
  const visibility = visibilityValueElem ? visibilityValueElem.textContent.trim() : "--";

  const uvi = uvIndexValueElem ? uvIndexValueElem.textContent.trim() : "";
  const uviRisk = uvIndexRiskElem ? uvIndexRiskElem.textContent.trim() : "";
  const aqiVal = aqiIndexValueElem ? aqiIndexValueElem.textContent.trim() : "";
  const aqiRisk = aqiRiskBadgeElem ? aqiRiskBadgeElem.textContent.trim() : "";

  let lines = [
    `🌤️ Weather Report for ${locationText}`,
    `📅 ${dateText}`,
    `🌡️ Temperature: ${temp}${unit} (Feels like: ${feelsLike})`,
    `☁️ Conditions: ${condition} (${description})`,
    `💧 Humidity: ${humidity} | 💨 Wind Speed: ${windSpeed}`,
    `🧭 Atmospheric Pressure: ${pressure} | 👁️ Visibility: ${visibility}`
  ];

  if (uvi && uvi !== "N/A") {
    lines.push(`☀️ UV Index: ${uvi}${uviRisk ? ` [${uviRisk}]` : ""}`);
  }

  if (aqiVal && aqiVal !== "N/A") {
    lines.push(`🍃 Air Quality (AQI): ${aqiVal}${aqiRisk ? ` [${aqiRisk}]` : ""}`);
  }

  if (severeAlertBanner && severeAlertBanner.style.display !== "none") {
    const alertTitle = severeAlertEvent ? severeAlertEvent.textContent.trim() : "Severe Weather Advisory";
    lines.push(`⚠️ Active Meteorological Alert: ${alertTitle}`);
  }

  if (weatherTipText && weatherTipCard && weatherTipCard.style.display !== "none") {
    lines.push(`💡 Contextual Tip: ${weatherTipText.textContent.trim()}`);
  }

  lines.push(`\nShared via FUDMA Weather Dashboard • GET 411 Artificial Intelligence Group 14 Developers`);

  return lines.join("\n");
}

/**
 * Copies the current weather summary to the user's system clipboard.
 * Provides immediate visual feedback on the button and displays a toast notification.
 */
async function shareWeatherSummary() {
  const summaryText = generateWeatherSummary();
  let copied = false;

  // Modern Async Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(summaryText);
      copied = true;
    } catch (err) {
      console.warn("Async clipboard copy failed, attempting execCommand fallback:", err);
    }
  }

  // Cross-browser synchronous fallback
  if (!copied) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = summaryText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      copied = document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (fallbackErr) {
      console.error("Clipboard copy fallback error:", fallbackErr);
    }
  }

  if (copied) {
    if (shareWeatherBtn) {
      shareWeatherBtn.classList.add("copied");
      shareWeatherBtn.innerHTML = `
        <svg class="share-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span id="shareBtnText">Copied!</span>
      `;

      if (shareSuccessResetTimer) {
        clearTimeout(shareSuccessResetTimer);
      }

      shareSuccessResetTimer = setTimeout(() => {
        if (shareWeatherBtn) {
          shareWeatherBtn.classList.remove("copied");
          shareWeatherBtn.innerHTML = `
            <svg class="share-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <span id="shareBtnText">Share</span>
          `;
        }
      }, 2500);
    }

    showToast("Weather summary copied to clipboard! 📋");
  } else {
    showToast("Unable to copy to clipboard. Please check browser permissions.");
  }
}

// ============================================================================
// 7. CONTROLLER & EVENT COORDINATION
// ============================================================================

/**
 * Main coordinator function for initiating and resolving a city search.
 * 
 * @param {string} cityName - Name of the target city
 */
async function handleSearch(cityName) {
  if (isLoading) return;

  const query = cityName ? cityName.trim() : "";

  // Validation: Check for empty input
  if (!query) {
    showError("EMPTY_INPUT");
    cityInput.focus();
    return;
  }

  showLoadingState();

  try {
    const weatherData = await fetchWeatherData(query);
    renderWeatherData(weatherData);
  } catch (error) {
    console.error("Weather query failed:", error);

    if (error.message === "OFFLINE") {
      showError("OFFLINE");
    } else if (error.message === "CITY_NOT_FOUND") {
      showError("CITY_NOT_FOUND");
    } else if (error.message === "EMPTY_INPUT") {
      showError("EMPTY_INPUT");
    } else if (error.message === "RATE_LIMIT_EXCEEDED") {
      showError("RATE_LIMIT_EXCEEDED");
    } else if (error instanceof TypeError && error.message.includes("fetch")) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        showError("OFFLINE");
      } else {
        showError("NETWORK_ERROR");
      }
    } else {
      showError("SERVER_ERROR", error.message || "Unable to retrieve weather information. Please try again.");
    }
  }
}

// ============================================================================
// 7. EVENT LISTENERS SETUP
// ============================================================================

// Form submit event
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSearch(cityInput.value);
});

// Quick city button clicks (Abuja & Lagos)
quickCityButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const city = btn.getAttribute("data-city");
    if (city) {
      cityInput.value = city;
      handleSearch(city);
    }
  });
});

// Temperature Unit Toggle Switch (°C / °F)
if (unitToggleBtn) {
  unitToggleBtn.addEventListener("click", (e) => {
    // If user clicked directly on one of the unit options, set that specific unit
    if (e.target === unitOptC) {
      setTemperatureUnit("C");
    } else if (e.target === unitOptF) {
      setTemperatureUnit("F");
    } else {
      toggleTemperatureUnit();
    }
  });

  unitToggleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTemperatureUnit();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTemperatureUnit("C");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setTemperatureUnit("F");
    }
  });
}

// Severe weather alert banner dismissal
if (dismissSevereAlertBtn) {
  dismissSevereAlertBtn.addEventListener("click", () => {
    hideSevereAlert();
  });
}

// Share Weather Summary Button Click
if (shareWeatherBtn) {
  shareWeatherBtn.addEventListener("click", () => {
    shareWeatherSummary();
  });
}

// Initial boot: focus input and synchronize temperature unit display
document.addEventListener("DOMContentLoaded", () => {
  if (cityInput) {
    cityInput.focus();
  }
  updateTemperatureDisplays();
});

// ============================================================================
// 8. PROJECT TEAM MODAL CONTROLLER (GET 411 • GROUP 14)
// ============================================================================

const openTeamModalBtn = document.getElementById("openTeamModalBtn");
const heroTeamBtn = document.getElementById("heroTeamBtn");
const openModalFromSectionBtn = document.getElementById("openModalFromSectionBtn");
const closeTeamModalBtn = document.getElementById("closeTeamModalBtn");
const teamModal = document.getElementById("teamModal");

/**
 * Open the Project Team dialog
 */
function openTeamModal() {
  if (teamModal) {
    teamModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

/**
 * Close the Project Team dialog
 */
function closeTeamModal() {
  if (teamModal) {
    teamModal.style.display = "none";
    document.body.style.overflow = "";
  }
}

if (openTeamModalBtn) {
  openTeamModalBtn.addEventListener("click", openTeamModal);
}

if (heroTeamBtn) {
  heroTeamBtn.addEventListener("click", openTeamModal);
}

if (openModalFromSectionBtn) {
  openModalFromSectionBtn.addEventListener("click", openTeamModal);
}

if (closeTeamModalBtn) {
  closeTeamModalBtn.addEventListener("click", closeTeamModal);
}

if (teamModal) {
  // Click on background backdrop to close
  teamModal.addEventListener("click", (e) => {
    if (e.target === teamModal) {
      closeTeamModal();
    }
  });

  // ESC key to dismiss modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && teamModal.style.display === "flex") {
      closeTeamModal();
    }
  });
}

// ============================================================================
// 9. PROGRESSIVE WEB APP (PWA) SERVICE WORKER REGISTRATION
// ============================================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
  });
}

// ============================================================================
// 10. REAL-TIME OFFLINE / ONLINE CONNECTIVITY CONTROLLER
// ============================================================================
const offlineBanner = document.getElementById("offlineBanner");

function handleOnlineStatusChange() {
  if (!navigator.onLine) {
    if (offlineBanner) {
      offlineBanner.classList.remove("online-recovered");
      offlineBanner.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <span>You are currently offline. Live weather information requires an internet connection.</span>
      `;
      offlineBanner.style.display = "flex";
    }
  } else {
    if (offlineBanner && offlineBanner.style.display !== "none") {
      offlineBanner.classList.add("online-recovered");
      offlineBanner.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <span>Back online. Live weather functionality resumed.</span>
      `;
      setTimeout(() => {
        if (navigator.onLine && offlineBanner) {
          offlineBanner.style.display = "none";
          offlineBanner.classList.remove("online-recovered");
        }
      }, 3500);
    }
  }
}

window.addEventListener("online", handleOnlineStatusChange);
window.addEventListener("offline", handleOnlineStatusChange);

// Initial check on load
if (typeof navigator !== "undefined" && !navigator.onLine) {
  handleOnlineStatusChange();
}

// ============================================================================
// 10. LEAFLET MINI-MAP CONTROLS
// ============================================================================

if (mapRecenterBtn) {
  mapRecenterBtn.addEventListener("click", () => {
    if (cityMapInstance && currentMapCoords) {
      cityMapInstance.setView([currentMapCoords.lat, currentMapCoords.lon], 12, { animate: true, duration: 0.6 });
      if (cityMapMarker) {
        cityMapMarker.openPopup();
      }
    }
  });
}

if (mapZoomInBtn) {
  mapZoomInBtn.addEventListener("click", () => {
    if (cityMapInstance) {
      cityMapInstance.zoomIn();
    }
  });
}

if (mapZoomOutBtn) {
  mapZoomOutBtn.addEventListener("click", () => {
    if (cityMapInstance) {
      cityMapInstance.zoomOut();
    }
  });
}

// ============================================================================
// 11. PERSISTENT THEME CONTROLLER (DARK / LIGHT MODE)
// ============================================================================

const THEME_STORAGE_KEY = "fudma_weather_theme";

/**
 * Checks system preference for dark color scheme
 * @returns {'dark'|'light'}
 */
function getSystemThemePreference() {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/**
 * Apply the selected theme to documentElement, update UI labels/attributes,
 * and persist into localStorage if requested.
 *
 * @param {'dark'|'light'} theme - Target theme ('dark' or 'light')
 * @param {boolean} [persist=true] - Whether to write to localStorage
 */
function applyTheme(theme, persist = true) {
  const isDark = theme === "dark";
  
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }

  // Update button accessible state and label
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute("aria-checked", isDark ? "true" : "false");
    themeToggleBtn.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggleBtn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  }

  if (themeToggleLabel) {
    // Shows what the user will switch to on click
    themeToggleLabel.textContent = isDark ? "Light" : "Dark";
  }

  // Update theme-color meta tag for Android status bar / browser chrome
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", isDark ? "#0f172a" : "#0284c7");
  }

  // Persist preference to browser localStorage
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      // Storage unavailable or restricted
    }
  }
}

/**
 * Toggle between 'dark' and 'light' theme
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const nextTheme = (currentTheme === "dark") ? "light" : "dark";
  applyTheme(nextTheme, true);

  // Show friendly toast feedback
  if (typeof showToast === "function") {
    if (nextTheme === "dark") {
      showToast("Dark mode activated 🌙");
    } else {
      showToast("Light mode activated ☀️");
    }
  }
}

/**
 * Initialize theme based on localStorage preference or system fallback
 */
function initThemeController() {
  let activeTheme = "light";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      activeTheme = saved;
    } else {
      activeTheme = getSystemThemePreference();
    }
  } catch (e) {
    activeTheme = getSystemThemePreference();
  }

  // Apply without overriding localStorage on initial load
  applyTheme(activeTheme, false);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Listen to OS system color scheme changes when user hasn't explicitly saved a preference
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        try {
          const userSaved = localStorage.getItem(THEME_STORAGE_KEY);
          if (!userSaved) {
            applyTheme(e.matches ? "dark" : "light", false);
          }
        } catch (err) {}
      });
    } catch (err) {}
  }
}

// Initialize theme immediately
initThemeController();




