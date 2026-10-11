# WEATHER APP USING PUBLIC API

**Undergraduate Mini-Project**  
**Course:** Application Development / Web Technologies  
**Focus Area:** REST API Integration, Asynchronous JavaScript, Serverless Security, and Responsive Web Design  
**Target Deployment Platform:** Vercel (Production Serverless Architecture)

---

## 1. Project Title
**Weather App Using Public API** (Focused on Nigerian Cities and Global Municipalities)

---

## 2. Project Description
The **Weather App** is a simple, modern, and responsive web application engineered for secure, serverless cloud deployment on **Vercel**. It allows users to query real-time meteorological observations for Nigerian cities (with dedicated one-touch selectors for Abuja and Lagos) and cities worldwide.

To ensure professional software engineering security standards, the frontend application **never stores, handles, or exposes the OpenWeather API key**. Instead, all requests are routed through a serverless backend proxy function (`/api/weather`) running on Vercel. This function reads the secret key from server-side environment variables (`OPENWEATHER_API_KEY`), queries OpenWeather, and returns sanitized meteorological JSON data to the browser.

---

## 3. Key Features
- **Modern Responsive Dashboard:** Clean, intuitive interface with zero extraneous clutter.
- **Dedicated Nigerian City Selection:** One-click quick selection buttons for **Abuja** (the Federal Capital Territory) and **Lagos** (economic hub), plus additional major regional hubs (Kano, Ibadan, Port Harcourt).
- **Global Search Functionality:** Real-time search support for any valid municipality globally.
- **Serverless API Proxy (`/api/weather`):**
  - Keeps the OpenWeather API key completely hidden from browser network tabs and client source code.
  - Validates city input on the server side.
  - Queries OpenWeather using metric units.
  - Sanitizes and formats the response JSON before returning it to the frontend.
- **Comprehensive Meteorological Data Display:**
  - City name and Country identifier
  - Current temperature in degrees Celsius (°C)
  - Perceived ("Feels Like") temperature in °C
  - Primary weather condition (e.g., Clear, Clouds, Rain, Thunderstorm)
  - Detailed weather description (e.g., "scattered clouds")
  - Official OpenWeather weather condition icon
  - Relative humidity percentage (%)
  - Wind speed in meters per second (m/s)
  - Atmospheric pressure in hectopascals (hPa)
- **5-Day Weather Forecast UI Section:**
  - Aggregates daily forecasts for the next 5 days.
  - Displays day of the week, formatted date, condition icon, and text.
  - Highlights upcoming **High (Warm Red)** and **Low (Cool Blue)** temperatures in °C.
- **Active Loading State:** Visual spinner and `"Loading weather data..."` indicator with search button disabled during in-flight network requests.
- **Defensive Error Handling:** Polite, user-friendly feedback for empty submissions, invalid city names (404), unauthorized API keys (401), rate limits (429), and network drops.
- **Search History for Session:** Displays recent queries conducted during the current browser session for rapid re-querying.
- **Fully Responsive Design:** Fluid grid and flexbox layout optimized across mobile phones, tablets, laptops, and wide desktop screens without horizontal scroll.

---

## 4. Technologies Used
- **Frontend Presentation:** HTML5 (Semantic elements, accessible ARIA attributes)
- **Styling:** CSS3 (Custom properties/variables, Flexbox, CSS Grid, media queries, smooth animations)
- **Frontend Logic:** Vanilla JavaScript (ES6+ `async/await`, `fetch()`, DOM Manipulation)
- **Serverless Backend:** Node.js Vercel Serverless Function (`/api/weather.js`)
- **External Public API:** [OpenWeather Current Weather Data API](https://openweathermap.org/current)
- **Cloud Hosting & Deployment:** Vercel

---

## 5. How the Architecture Works
```
User
  ↓
Weather Web Interface (HTML5/CSS3/Vanilla JS)
  ↓
JavaScript fetch('/api/weather?city=Abuja')
  ↓
Vercel Serverless API Function (/api/weather)
  ↓ (Injects secret OPENWEATHER_API_KEY from process.env)
OpenWeather REST API (https://api.openweathermap.org/data/2.5/weather)
  ↓
Vercel Serverless API
  ↓ (Returns sanitized JSON)
Weather Web Interface Displayed
```

1. The client browser executes `fetch('/api/weather?city=Abuja')`.
2. The Vercel serverless function receives the request, validates the input, and reads `process.env.OPENWEATHER_API_KEY`.
3. The serverless function queries OpenWeather using standard HTTPS.
4. The OpenWeather response is validated and parsed.
5. Clean JSON is returned to the client. At no point is the API key exposed to the user, inspectable in browser DevTools, or stored in `localStorage`.

---

## 6. How to Obtain an OpenWeather API Key
1. Visit: **[https://openweathermap.org/](https://openweathermap.org/)**
2. Register a free account and confirm your email.
3. Navigate to **My API Keys** in your account dashboard.
4. Copy your 32-character key.
*(Note: New keys can take 10–30 minutes to activate on OpenWeather servers).*

---

## 7. How to Deploy on Vercel (Step-by-Step Instructions)

Follow these exact steps to deploy the application with server-side API key protection:

1. **Import GitHub repository into Vercel:**
   - Log into [Vercel](https://vercel.com/) with your GitHub account.
   - Click **"Add New..."** -> **"Project"**.
   - Select and import your GitHub repository.
2. **Open Project Settings:**
   - On the configure project screen (or under the project's **Settings** tab).
3. **Open Environment Variables:**
   - Click on the **"Environment Variables"** section in the left sidebar.
4. **Add `OPENWEATHER_API_KEY`:**
   - In the **Key** field, enter: `OPENWEATHER_API_KEY`
5. **Paste the actual OpenWeather API key as its value:**
   - In the **Value** field, paste your 32-character OpenWeather API key.
6. **Apply to Environments:**
   - Ensure the checkboxes for **Production**, **Preview**, and **Development** are checked.
   - Click **Save**.
7. **Redeploy:**
   - Click **"Deploy"** (or trigger a redeploy from the Deployments tab).
   - Your live URL (e.g., `https://your-weather-app.vercel.app`) is now securely querying live weather data without any exposed keys!

---

## 8. Local Development with Vercel CLI
To test the serverless function locally with environment variables:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Create a local `.env` file (which is git-ignored):
   ```bash
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
3. Run:
   ```bash
   vercel dev
   ```
   Open `http://localhost:3000` to test the frontend and `/api/weather` route locally.

---

## 9. Project Folder Structure
```
weather-app/
│
├── api/
│   └── weather.js              # Vercel serverless function (proxies OpenWeather)
├── index.html                  # Semantic HTML5 application layout & markup
├── css/
│   └── style.css               # Responsive CSS3 styling & CSS variables
├── js/
│   ├── app.js                  # Frontend logic: calls /api/weather, DOM updates
│   └── config.js               # Frontend endpoint configuration
├── assets/
│   └── images/
│       └── weather-logo.svg    # Vector application branding logo
├── .env.example                # Sample environment file template
├── .gitignore                  # Git tracking exclusion rules (ignores .env, .env.local)
├── README.md                   # Project overview & Vercel deployment guide
└── PROJECT_DOCUMENTATION.md    # Formal 13-section academic project report
```

---

## 10. Limitations
1. **Third-Party Rate Limits:** The free tier of OpenWeather allows up to 60 calls per minute and 1,000 calls per day.
2. **Current Weather Snapshot:** Returns current conditions; extended multi-day forecasts require additional endpoints.
3. **Internet Dependency:** Requires active network connectivity to reach OpenWeather servers.

---

## 11. Future Enhancements
- 5-day / 3-hour extended meteorological forecast.
- HTML5 device geolocation to automatically detect user location.
- Interactive weather radar maps with Leaflet.js.
- Edge caching / redis cache for repeated city queries to save API quota.
- Progressive Web App (PWA) manifest and Service Worker for offline viewing.
