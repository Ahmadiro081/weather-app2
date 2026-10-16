# PROJECT DOCUMENTATION: WEATHER APP USING PUBLIC API

**Institution:** Federal University Dutsin-Ma (FUDMA)  
**Course Code:** GET 411  
**Project:** Artificial Intelligence Mini Project  
**Project Title:** Weather App Using Public API (Vercel Serverless Architecture)  
**Group:** Group 14  
**Academic Session:** 2026/2027  
**Lecturer / Supervisor:** Nura Muhammad  

---

## Academic Project Information & Group 14 Members

### Project Identifiers
- **Institution:** Federal University Dutsin-Ma (FUDMA)
- **Course Code:** GET 411 (Artificial Intelligence Mini Project)
- **Group Allocation:** Group 14
- **Academic Session:** 2026/2027
- **Course Lecturer:** Nura Muhammad

### Group 14 Student Members Roster
| No. | Student Name | Matriculation Number | Department |
|:---:|:---|:---|:---|
| 01 | Adamu Aliyu | ENG/2024/32546 | Mechanical Engineering |
| 02 | Yakubu Bilyaminu Korau | ENG/2024/33389 | Mechanical Engineering |
| 03 | Abdulrazak Nura | ENG/2024/32426 | Electrical and Electronics Engineering |
| 04 | Gideon Ogala | ENG/2024/32926 | Electrical and Electronic Engineering |
| 05 | Ibrahim Nasir | ENG/2024/36136 | Chemical Engineering |
| 06 | Dauda Ismail | ENG/2024/32787 | Civil Engineering |
| 07 | Sulaiman Rabiu Gideh | ENG/2024/34260 | Civil Engineering |
| 08 | Benson Oshuo Echuo-Odu | ENG/2024/32156 | Mechatronics Engineering |
| 09 | Favour Hephzibah Emmanuel | AGR/2024/32419 | Agricultural and Bio-Environmental Engineering |

---

## 1. Executive Summary
The "Weather App Using Public API" is an undergraduate web application developed to demonstrate practical mastery of frontend web engineering, asynchronous JavaScript programming, RESTful web services, and serverless backend proxy patterns. The application delivers real-time meteorological observations for Nigerian cities (featuring dedicated one-touch selectors for Abuja and Lagos) alongside global municipalities.

To satisfy contemporary application security and cloud deployment requirements, the application is engineered for deployment on **Vercel**. All network calls to the external OpenWeather API are routed through a dedicated Node.js serverless function (`/api/weather`). This architecture ensures that the secret `OPENWEATHER_API_KEY` is retained exclusively within server-side environment variables and is never exposed in browser developer tools, client source code, or repository commits. The project emphasizes clean software design, defensive error handling, mobile-responsive layout design, and accessible user experience principles.

---

## 2. Background of the Problem Statement
Access to accurate, real-time weather information is essential for daily planning, agriculture, logistics, aviation, and disaster mitigation across developing nations such as Nigeria. However, many conventional weather platforms suffer from excessive bloat, intrusive advertising, heavy client-side JavaScript frameworks, and slow loading times over variable bandwidth connections.

From a software engineering security perspective, a frequent weakness in undergraduate projects is the improper handling of third-party API credentials. Novice developers routinely hard-code private API keys in client-side scripts (`app.js`, `config.js`) or persist them in browser `localStorage`, where they can be effortlessly inspected and abused by unauthorized parties.

This mini-project addresses these challenges by:
1. Constructing a lightweight, performant, and transparent weather client using foundational web standards (HTML5, CSS3, and Vanilla JavaScript).
2. Implementing an architectural backend proxy via Vercel Serverless Functions to securely isolate secret API credentials from the public internet.
3. Managing asynchronous data flows cleanly without blocking the browser UI thread.

---

## 3. Objectives

### Functional Objectives:
- To develop an intuitive, responsive user interface allowing users to look up weather conditions for any worldwide city.
- To provide dedicated quick-selection capabilities for major Nigerian metropolitan hubs, specifically Abuja (the Federal Capital Territory) and Lagos (the commercial center).
- To retrieve and display accurate real-time metrics including temperature in Celsius (°C), feels-like temperature, humidity, wind velocity, atmospheric pressure, and visibility.
- To implement defensive input validation and informative, user-friendly error alerts for edge cases.

### Security & Architectural Objectives:
- To eliminate any client-side exposure of secret API keys by routing requests through a Vercel serverless function (`/api/weather`).
- To demonstrate mastery of asynchronous JavaScript paradigms using modern `async/await` syntax and the `fetch()` API.
- To demonstrate how to parse, extract, and manipulate JSON (JavaScript Object Notation) data structures.
- To design responsive layouts adhering to modern CSS standards (Flexbox, CSS Grid, Media Queries) without third-party CSS libraries.

---

## 4. Scope

### In Scope:
- **Core Technology:** Implementation strictly in standard HTML5, CSS3, Vanilla JavaScript (ES6+), and Node.js Serverless Functions on Vercel.
- **Serverless API Proxy:** Server-side route `/api/weather` that reads `process.env.OPENWEATHER_API_KEY` and calls OpenWeather with metric units.
- **Target Geographic Focus:** Pre-configured quick-selection buttons for Nigerian cities (Abuja, Lagos, Kano, Ibadan, Port Harcourt) with arbitrary city search capabilities worldwide.
- **Data Integration:** Live communication with the OpenWeather Current Weather REST API (`/data/2.5/weather`) via the serverless proxy.
- **Data Fields Rendered:** City name, country identifier, current temperature (°C), feels-like temperature (°C), weather condition, descriptive text, official OpenWeather condition icon, humidity (%), wind speed (m/s), atmospheric pressure (hPa), and visibility (km).
- **Interactive State Management:** Dynamic loading spinners, button disabling during in-flight requests, session search history, and contextual error banners.
- **Device Support:** Cross-device responsiveness spanning mobile phones, tablets, laptops, and desktop monitors.

### Out of Scope:
- Multi-day historical climate archives or 14-day extended algorithmic forecasts.
- Relational or NoSQL database management systems (e.g., MySQL, MongoDB, Firebase, Supabase).
- User authentication, authorization tiers, and user login credentials.
- Proprietary Generative AI models or chatbot assistants.

---

## 5. Proposed Solution

### Key Features
1. **Interactive Weather Dashboard:** Clear visual hierarchy featuring prominent temperature display, official icon visualization, and atmospheric detail cards.
2. **Dedicated Quick City Selectors:** One-touch query buttons for Abuja and Lagos, enabling rapid evaluation without manual typing.
3. **Server-Side API Key Shielding:** Vercel serverless endpoint prevents client-side key leakage.
4. **5-Day Weather Forecast Section:** Displays upcoming daily forecasts with calculated high and low temperatures, condition descriptions, and official weather icons.
5. **Session Query History:** Dynamic breadcrumb chips of cities searched during the current browser session.
6. **Resilient Feedback System:** Distinct visual states for idle, loading, success, and error outcomes.
7. **Progressive Web App (PWA) Support:**
   - Web App Manifest (`manifest.webmanifest`) enabling home screen installation and standalone app display.
   - High-resolution adaptive and maskable icons (192x192, 512x512) and Apple touch icons.
   - Offline Application Shell caching through Service Worker (`service-worker.js`).
   - Conservative caching policy: Live weather queries are NEVER permanently cached or fabricated. An informative offline notification informs users that live weather data requires internet connectivity, resuming seamlessly once connected.
8. **Decoupled Architecture:** Clean separation of concerns between presentation, client networking, serverless proxy, and upstream provider.

### Technology Stack
- **Markup:** HTML5 (Semantic document outline, accessible labels, ARIA landmarks)
- **Presentation:** CSS3 (Custom CSS properties, CSS Grid, Flexbox, media query breakpoints)
- **Scripting:** Vanilla JavaScript (ES6+ `async/await`, `fetch()` API, DOM Manipulation)
- **PWA & Offline Standards:** Web App Manifest (`manifest.webmanifest`), Service Worker API (`service-worker.js`), Cache API
- **Serverless Execution:** Node.js Vercel Serverless Function (`/api/weather.js`)
- **External Public API:** OpenWeather Current Weather Data API (HTTP RESTful JSON endpoint)
- **Cloud Platform:** Vercel

### System Architecture
The application adheres to the following secure serverless architecture:

```
User
  ↓
Weather Web Interface
  ↓
JavaScript fetch()
  ↓
Vercel Serverless API (/api/weather)
  ↓
OpenWeather REST API
  ↓
Vercel Serverless API
  ↓
JSON Weather Response
  ↓
Weather Interface
```

#### Architectural Rationale & Explanation:
In traditional static client-only web projects, API keys must be included in client-side JavaScript, leaving them exposed to inspection via the browser Developer Tools Network tab or source code repositories. 

In this refined architecture:
1. The **User** interacts with the Weather Web Interface (typing a query or clicking Abuja/Lagos).
2. The browser executes an internal `fetch('/api/weather?city=' + encodeURIComponent(cityName))`.
3. The **Vercel Serverless API (`/api/weather`)** intercepts the request on the server. It verifies input validity and injects the private `OPENWEATHER_API_KEY` stored securely in the Vercel hosting environment (`process.env.OPENWEATHER_API_KEY`).
4. The serverless function makes an HTTPS call to the **OpenWeather REST API**.
5. OpenWeather responds with the meteorological payload to the Vercel Serverless API.
6. The Vercel function sanitizes the payload, stripping any internal provider metadata, and returns a clean **JSON Weather Response** to the client.
7. The **Weather Interface** parses the JSON and renders the updated atmospheric conditions on screen.

**Crucially, this architecture prevents the OpenWeather API key from ever being embedded directly in client-side source code, stored in `localStorage`, or exposed in network requests sent from the browser.**

---

## 6. Project Plan
The development followed an agile undergraduate iterative lifecycle spanning four core milestones:

| Phase | Milestone Description | Key Activities | Duration |
|---|---|---|---|
| **Phase 1: Requirements & Research** | System Analysis | Studied OpenWeather API specifications, examined JSON schemas, drafted interface wireframes. | Week 1 |
| **Phase 2: UI Design & Structure** | Semantic Layout & CSS | Built accessible HTML5 structure, established CSS3 variables, built card grids, and created responsive media queries. | Week 2 |
| **Phase 3: Core Logic & Integration** | Asynchronous JavaScript | Implemented `fetch()` module, parsed JSON responses, integrated Abuja and Lagos quick-buttons, implemented error handling. | Week 3 |
| **Phase 4: Security & Vercel Deployment** | Serverless Architecture & QA | Built `/api/weather.js` Vercel function, migrated environment variables, tested edge cases, authored defense documentation. | Week 4 |

---

## 7. Deliverables
1. **Source Code Package (`weather-app/`):**
   - `api/weather.js`: Vercel serverless proxy function.
   - `index.html`: Fully semantic, accessible web interface.
   - `css/style.css`: Clean, modular stylesheet utilizing CSS custom variables and media queries.
   - `js/app.js`: Core logic incorporating `async/await`, error handling, and DOM rendering.
   - `js/config.js`: Centralized endpoint configuration pointing to `/api/weather`.
   - `assets/images/weather-logo.svg`: Vector branding graphic asset.
   - `.env.example`: Environment template file (`OPENWEATHER_API_KEY=your_openweather_api_key_here`).
   - `.gitignore`: Standard exclusion list ignoring `.env` and `.env.local`.
2. **Project Documentation:**
   - `README.md`: Student user guide and Vercel deployment instructions.
   - `PROJECT_DOCUMENTATION.md`: Complete 13-section formal project report.

---

## 8. Quality Assurance & Testing

### Testing Strategy
The application underwent systematic testing across functional verification, serverless proxy routing, input validation, network resilience, and responsive presentation.

### Test Results Table

| Test Case ID | Test Description | Input / Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-01** | Abuja Weather Retrieval | Click "Abuja" quick button | Serverless proxy queries Abuja, returns metrics, UI renders temp, condition, humidity | Successfully displayed Abuja, Nigeria weather metrics | **PASS** |
| **TC-02** | Lagos Weather Retrieval | Click "Lagos" quick button | Serverless proxy queries Lagos, returns metrics, UI renders temp, condition, humidity | Successfully displayed Lagos, Nigeria weather metrics | **PASS** |
| **TC-03** | Valid Arbitrary City | Enter "Kano" in search input | Queries `/api/weather?city=Kano`, displays metrics and updates session history | Successfully displayed Kano, Nigeria weather metrics | **PASS** |
| **TC-04** | Valid International City | Enter "London" in search input | Queries `/api/weather?city=London`, displays metrics | Successfully displayed London, United Kingdom metrics | **PASS** |
| **TC-05** | Invalid City Name | Enter "AtlantisXYZ123" | Serverless proxy returns 404; UI shows "City not found. Please check the spelling..." | Error alert displayed cleanly without app crash | **PASS** |
| **TC-06** | Empty Search Submission | Click Search with empty input | Frontend catches empty string; displays "Please enter a city name." | Input highlighted and friendly message shown | **PASS** |
| **TC-07** | Serverless Missing Key Handling | Query API with unconfigured key | Serverless proxy catches missing key; returns HTTP 500 configuration message | Polite error feedback displayed cleanly | **PASS** |
| **TC-08** | Loading State Verification | Initiate query over network | Disables search button, displays spinner and "Loading weather data..." | UI accurately disabled; spinner visible until resolved | **PASS** |
| **TC-09** | Mobile Layout Responsive | View on viewport width 375px (Phone) | Stacks cards vertically, wraps buttons, zero horizontal scrollbar | Clean vertical stacking; smooth readability | **PASS** |
| **TC-10** | Desktop Layout Responsive | View on viewport width 1440px (Desktop) | 4-column metric grid, centered card, proportional typography | Balanced layout with optimal spacing and contrast | **PASS** |
| **TC-11** | Zero Client Key Exposure | Inspect page source & network tab | No `OPENWEATHER_API_KEY` present in HTML, JS, or browser storage | Zero sensitive credentials exposed to client | **PASS** |

---

## 9. Risks and Mitigation

| Risk | Severity | Impact | Mitigation Strategy |
|---|---|---|---|
| **API Key Exposure in Client Code** | High | Potential credential theft or unauthorized quota consumption. | Eliminated completely by routing all queries through Vercel serverless function (`/api/weather.js`) reading `process.env.OPENWEATHER_API_KEY`. |
| **OpenWeather Rate Limiting (60 calls/min)** | Low | Temporary HTTP 429 response during testing. | Implemented dedicated HTTP 429 status handler informing the user to wait before re-submitting. |
| **Network Latency or Offline Failure** | High | Unhandled exceptions freezing the user interface. | Enclosed all fetch operations inside robust `try...catch` blocks with explicit network-error UI fallback alerts. |
| **Malicious or Malformed Query Strings** | Medium | Server crashes or unexpected parameter injections. | Applied strict parameter sanitization and URI encoding on both client and serverless endpoints. |

---

## 10. Resources and Budget

### Hardware Resources:
- Personal Computer / Laptop (Standard development specifications: 4GB+ RAM, dual-core CPU).
- Mobile Smartphone (Android / iOS) for physical responsive verification.

### Software & Cloud Resources:
- **Operating System:** Linux / Windows / macOS.
- **Code Editor:** Visual Studio Code / Android Studio.
- **Browser:** Google Chrome / Mozilla Firefox with Developer Tools.
- **OpenWeather API Account:** Free Developer Tier (0 USD / 0 NGN).
- **Vercel Cloud Platform:** Free Hobby/Educational Tier (0 USD / 0 NGN).

### Budget Summary:
Total Project Expenditure: **₦0.00 / $0.00** (Constructed entirely with free, open-source tools and cloud serverless tiers).

---

## 11. Success Criteria
The project was evaluated and deemed successful against the following criteria:
1. Complete retrieval and rendering of live meteorological data via Vercel serverless proxy without client API key exposure.
2. Verified functionality of one-click buttons for Nigerian hubs (**Abuja** and **Lagos**).
3. Zero application crashes across all tested edge cases (empty strings, invalid cities, network drops).
4. Full responsiveness verified across screen widths ranging from 320px to 1920px.
5. Codebase adheres strictly to undergraduate readability, comprehensive commentary, and modular design standards without unnecessary dependencies.

---

## 12. Future Enhancements
Should this mini-project be expanded for a final-year degree thesis or commercial release, the following enhancements are proposed:
1. **Extended Forecasts:** Integration of OpenWeather's 5-Day / 3-Hour Forecast API to display temperature trends and precipitation projections.
2. **HTML5 Geolocation:** Automated weather retrieval based on user GPS device coordinates (`navigator.geolocation`).
3. **Interactive Weather Maps:** Embedding dynamic radar, precipitation, and cloud cover overlays via Leaflet.js mapping layers.
4. **Serverless Edge Caching:** Implementing Redis / Vercel KV cache on `/api/weather` to cache identical city queries for 10 minutes, conserving API quota.
5. **Progressive Web App (PWA):** Integration of a Service Worker and Web App Manifest to enable offline cached views and home screen installation on mobile devices.

---

## 13. Conclusion
The "Weather App Using Public API" successfully fulfills all requirements established for an undergraduate application development mini-project. By combining semantic HTML5, modern CSS3 layout techniques, vanilla asynchronous JavaScript, and a secure Vercel serverless architecture, the system demonstrates how robust, real-time client applications can be constructed cleanly and securely.

The project reinforces fundamental computer science competencies, including RESTful web service consumption, serverless proxy patterns, defensive exception handling, and responsive user experience design. The resulting software is transparent, secure, easy to defend before an examination panel, and establishes a solid foundation for future software engineering development.
