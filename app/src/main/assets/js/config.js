/**
 * ============================================================================
 * Weather App - Frontend Configuration Module (Vercel Architecture)
 * Undergraduate Mini-Project: "WEATHER APP USING PUBLIC API"
 * ============================================================================
 * 
 * SECURE VERCEL DEPLOYMENT:
 * All meteorological requests are proxied via the serverless function at
 * /api/weather. The OpenWeather API key is managed exclusively via Vercel
 * server-side environment variables (OPENWEATHER_API_KEY) and is NEVER
 * embedded, configured, or visible in frontend client JavaScript.
 */

const APP_CONFIG = {
  // Relative Vercel serverless proxy endpoint
  WEATHER_API_ENDPOINT: "/api/weather",

  // Default featured Nigerian cities for quick selection
  DEFAULT_CITIES: ["Abuja", "Lagos"]
};
