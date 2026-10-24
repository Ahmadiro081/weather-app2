# WEATHER APP USING PUBLIC API

**Institution:** Federal University Dutsin-Ma (FUDMA)  
**Course Code:** GET 411  
**Project:** Artificial Intelligence Mini Project  
**Group:** Group 14  
**Academic Session:** 2026/2027  
**Honorable Course Lecturer & Academic Supervisor:** Engr. Nura Muhammad (Faculty of Engineering • Federal University Dutsin-Ma (FUDMA))  
**Project Developers:** Group 14 Software Engineering Team  
**Target Deployment Platform:** Vercel (Production Serverless Architecture)

---

## Academic Project Details & Project Leadership

### Course & Academic Supervision
- **Institution:** Federal University Dutsin-Ma (FUDMA)
- **Course Code:** GET 411
- **Project Title:** Artificial Intelligence Mini Project - Weather App Using Public API
- **Group:** Group 14
- **Academic Session:** 2026/2027
- **Honorable Course Lecturer & Academic Supervisor:** Engr. Nura Muhammad (Faculty of Engineering • Federal University Dutsin-Ma (FUDMA))

### Group 14 Project Developers (Software Engineering Roster)
| S/N | Developer Name | Role | Matric Number | Department |
|:---:|:---|:---:|:---|:---|
| 01 | Adamu Aliyu | Developer | ENG/2024/32546 | Mechanical Engineering |
| 02 | Yakubu Bilyaminu Korau | Developer | ENG/2024/33389 | Mechanical Engineering |
| 03 | Abdulrazak Nura | Developer | ENG/2024/32426 | Electrical and Electronics Engineering |
| 04 | Gideon Ogala | Developer | ENG/2024/32926 | Electrical and Electronic Engineering |
| 05 | Ibrahim Nasir | Developer | ENG/2024/36136 | Chemical Engineering |
| 06 | Dauda Ismail | Developer | ENG/2024/32787 | Civil Engineering |
| 07 | Sulaiman Rabiu Gideh | Developer | ENG/2024/34260 | Civil Engineering |
| 08 | Benson Oshuo Echuo-Odu | Developer | ENG/2024/32156 | Mechatronics Engineering |
| 09 | Aliyu Abubakar | Developer | ENG/2025/36887 | Civil Engineering |
| 10 | Favour Hephzibah Emmanuel | Developer | AGR/2024/32419 | Agricultural and Bio-Environmental Engineering |

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
  - Interactive temperature unit toggle switch allowing seamless switching between **Celsius (°C)** and **Fahrenheit (°F)** for all displayed temperatures (persisted across sessions)
  - Current temperature and perceived ("Feels Like") temperature in active unit (°C / °F)
  - Primary weather condition (e.g., Clear, Clouds, Rain, Thunderstorm)
  - Detailed weather description (e.g., "scattered clouds")
  - Official OpenWeather weather condition icon
  - Relative humidity percentage (%)
  - Wind speed in meters per second (m/s)
  - Atmospheric pressure in hectopascals (hPa)
  - Visibility distance in kilometers (km)
  - Real-time **UV Index** with World Health Organization (WHO) risk level indicator (Low, Moderate, High, Very High, Extreme) powered by the OpenWeather API
  - **Air Quality Index (AQI)** card powered by the OpenWeather Air Pollution API (`/data/2.5/air_pollution`) with risk level categorization (1 - Good, 2 - Fair, 3 - Moderate, 4 - Poor, 5 - Very Poor)
- **Contextual Weather Tip Helper Component:**
  - Located directly below the main weather presentation card.
  - Dynamically evaluates temperature, weather condition code, humidity, wind speed, UV index, and air quality index across 14 priority tiers.
  - Displays actionable personal guidance (e.g., umbrella reminder during rain/drizzle, freeze & thermal layering alert for cold temperatures, hydration and cooling advisory for high heat, UV sunscreen warning, and respiratory protection during poor AQI).
  - Adapts visual styling with contextual badges and color-coded themes (Rain Blue, Heat Orange/Red, Freeze Cyan, Warning Amber, and Pleasant Green).
- **Severe Weather Alert Banner Notification:**
  - Automatically queries official meteorological alerts from the OpenWeather API (One Call & active severe weather classification system) for the searched municipality.
  - Displays a high-visibility, accessible banner notification with pulsing warning icon, issuing organization, alert event title, and description.
  - Allows immediate one-click dismissal.
- **Weather Summary Share to Clipboard:**
  - One-click share button on the Weather Presentation Card that copies a formatted, emoji-enhanced weather summary directly to the system clipboard.
  - Respects active temperature unit settings (°C or °F), current metrics, UV index, and active severe alerts.
  - Provides visual button confirmation ("Copied!") and floating toast feedback.
- **5-Day Weather Forecast UI Section:**
  - Aggregates daily forecasts for the next 5 days.
  - Displays day of the week, formatted date, condition icon, and text.
  - Highlights upcoming **High (Warm Red)** and **Low (Cool Blue)** temperatures in °C.
- **Geographical Location Mini-Map Section (Leaflet.js Integration):**
  - Interactive map powered by **Leaflet.js** and **OpenStreetMap** tile layers pinpointing the queried city's exact geographical coordinates.
  - Features a custom pulsing radar marker pin with coordinates popup showing municipality name, active temperature, weather condition icon, and latitude/longitude.
  - Glassmorphic floating control overlay with one-touch **Recenter**, **Zoom In (+)**, and **Zoom Out (−)** controls.
  - Comprehensive metadata footer displaying cardinal compass coordinates (e.g., 9.0765° N, 7.3986° E), mapping engine, and tile attribution.
- **Progressive Web App (PWA) Capabilities:**
  - Fully installable on Android, iOS, Windows, macOS, and Linux.
  - Complete Web App Manifest (`manifest.webmanifest`) with standalone display mode.
  - Custom high-resolution PWA icons (192x192, 512x512, maskable, and Apple touch icon).
  - Background Service Worker (`service-worker.js`) with versioned application shell caching.
  - Graceful offline experience: offline banner notification, friendly prompt if weather is requested without internet, and zero fabrication of outdated or mock data.
- **Active Loading State:** Visual spinner and `"Loading weather data..."` indicator with search button disabled during in-flight network requests.
- **Defensive Error Handling:** Polite, user-friendly feedback for empty submissions, invalid city names (404), unauthorized API keys (401), rate limits (429), and offline state.
- **Search History for Session:** Displays recent queries conducted during the current browser session for rapid re-querying.
- **Fully Responsive Design:** Fluid grid and flexbox layout optimized across mobile phones, tablets, laptops, and wide desktop screens without horizontal scroll.

---

## 4. Technologies Used
- **Frontend Presentation:** HTML5 (Semantic elements, accessible ARIA attributes)
- **Styling:** CSS3 (Custom properties/variables, Flexbox, CSS Grid, media queries, smooth animations)
- **Frontend Logic:** Vanilla JavaScript (ES6+ `async/await`, `fetch()`, DOM Manipulation)
- **PWA Toolchain:** Web App Manifest (`manifest.webmanifest`), Service Worker API (`service-worker.js`), Cache API
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
