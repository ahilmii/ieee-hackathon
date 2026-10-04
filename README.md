# RiverGuard

An integrated water pollution monitoring and decision-support platform developed for the **OneAquaHealth – IEEE Global Hackathon 2026**.

RiverGuard connects scientific environmental measurements, citizen observations, AI-assisted photo validation and regional health risk assessments within a shared system focused on the Ergene Basin in Türkiye.

## What RiverGuard Does

Environmental measurements often remain confined to academic publications, while temporary events noticed by citizens—such as water discoloration, foam, unusual odors or fish deaths—may never become structured and traceable records.

RiverGuard brings these separate sources together.

Citizens can submit photographic reports through the Android application, follow the status of their own reports and explore monitoring locations across the basin. The web platform presents scientific measurements, citizen reports and health risk information through maps, charts and decision-support views.

The backend evaluates applicable water-quality thresholds, coordinates AI-assisted report moderation and converts relevant records into **HL7 FHIR** resources.

## Main Features

- Native Android application for citizen reporting
- Photograph, category, note and optional location submission
- AI-assisted image-category consistency evaluation
- Personal report history and status tracking
- Interactive monitoring map with risk indicators
- Scientific groundwater, surface-water and sediment measurements
- Regional health risk assessments from peer-reviewed studies
- Web-based maps, charts and decision-support views
- HL7 FHIR `Observation` and `RiskAssessment` resources
- Session-based authentication and role-controlled operations
- API access to structured environmental data

## How It Works

1. A citizen notices an unusual water condition.
2. They submit a photograph, category, note and optional location.
3. The backend associates the report with the authenticated account.
4. The AI service checks whether the photograph is visually consistent with the selected category.
5. A confidence score, explanation and preliminary status are recorded.
6. Reports that cannot be verified visually, including odor reports, are directed to human review.
7. The report is converted into a FHIR `Observation`.
8. The citizen can follow the result through the **My Reports** screen.

AI is used only as a preliminary moderation mechanism. It does not identify chemical substances from photographs and does not replace laboratory analysis.

## Architecture

```text
┌────────────────────┐                     ┌────────────────────┐
│   Android Mobile   │                     │    React Web App   │
│ Kotlin + Compose   │                     │ Vite + Leaflet     │
└─────────┬──────────┘                     └─────────┬──────────┘
          │                                          │
          └──────────────────┬───────────────────────┘
                             ▼
                 ┌──────────────────────┐
                 │ Spring Boot Backend  │
                 │ REST API + Sessions  │
                 │       :8080          │
                 └──────┬───────┬───────┘
                        │       │
              ┌─────────┘       └──────────────┐
              ▼                                ▼
     ┌─────────────────┐              ┌──────────────────┐
     │   PostgreSQL    │              │ FastAPI AI      │
     │      :5432      │              │ Service :8000   │
     └─────────────────┘              └────────┬─────────┘
                                               ▼
                                      Gemini Vision Model

                             ┌──────────────────────┐
                             │   HAPI FHIR Server   │
                             │        :8081         │
                             └──────────────────────┘
```

The mobile and web applications communicate with the Spring Boot backend. The backend manages application data, sends citizen photographs to the AI service and creates standardized resources in the HAPI FHIR server.

## Technology Stack

| Component | Technologies |
|---|---|
| Mobile application | Kotlin, Jetpack Compose, MapLibre, Coil |
| Web platform | React, Vite, Leaflet, Recharts |
| Backend | Java 21, Spring Boot, Spring Security, PostgreSQL |
| AI service | Python, FastAPI, Gemini vision model |
| Health interoperability | HL7 FHIR, HAPI FHIR |
| Infrastructure | Docker Compose |

## Scientific Data Foundation

RiverGuard contains structured records derived from four peer-reviewed studies conducted in the Ergene Basin.

| Scientific source | Data coverage | Records |
|---|---|---:|
| Arkoç (2014) | Groundwater samples from 18 wells and six heavy metals | 108 measurements |
| Tokatlı (2021), Varol and Tokatlı (2023) | Surface-water measurements and health risk data | 9 measurements, 4 risk assessments |
| Aydın, Taş-Divrik and Atun (2026) | Water and sediment data from five monitoring stations | 90 measurements, 5 risk assessments |
| **Total** |  | **207 measurements, 9 risk assessments** |

Groundwater, surface-water and sediment records are evaluated separately. Water measurements use `mg/L`, while sediment measurements use `mg/kg`. Values below detection limits are not treated as zero.

Coordinates estimated from scientific figures are stored with their source metadata rather than treated as measured locations.

The backend compares supported water measurements with reference values derived from Turkish Standards, WHO and EPA guidance. Published carcinogenic risk and total hazard index values are preserved without being recalculated.

## HL7 FHIR Integration

RiverGuard uses **HL7 FHIR** to demonstrate how environmental information can become interoperable with digital health technologies.

- Environmental measurements → FHIR `Observation`
- Citizen reports → FHIR `Observation`
- Published regional health risks → FHIR `RiskAssessment`

FHIR resources are stored in a HAPI FHIR server and linked to their corresponding RiverGuard database records.

RiverGuard is not connected to a real hospital or national healthcare system. This implementation is a working proof of concept for future authorized environmental-health integrations.

## Live Demo

**Web platform**

https://ieee-hackathon-omega.vercel.app/

**Backend API base URL**

`http://134.112.41.108:8080/api`

Example requests:

```text
GET /api/locations
GET /api/observations
GET /api/observations?parameter=chromium
GET /api/observations?parameter=chromium&from=2013-01-01&to=2026-12-31
GET /api/risk-assessments
GET /api/risk-status?location={locationName}
```

Environmental observations can be filtered by parameter and date range. Risk assessments and current risk status can be queried by location.

Some operations require an authenticated session or an appropriate role.

## Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a citizen |
| `POST` | `/api/auth/login` | Start a session |
| `GET` | `/api/auth/me` | Read the authenticated user |
| `POST` | `/api/auth/logout` | End the current session |
| `GET` | `/api/locations` | List monitoring locations |
| `GET` | `/api/observations` | Query environmental measurements |
| `GET` | `/api/risk-assessments` | Query published risk assessments |
| `GET` | `/api/risk-status` | Read location-based risk status |
| `POST` | `/api/citizen-reports` | Submit a citizen report |
| `GET` | `/api/citizen-reports/my` | List the current citizen’s reports |
| `PATCH` | `/api/citizen-reports/{id}/status` | Update report status |

Detailed request and response formats are available in [`docs/api-contract.md`](docs/api-contract.md).

## Local Setup

### Requirements

- Docker
- Docker Compose
- A Gemini API key
- Node.js for the web application
- Android Studio for the mobile application

### Running the Backend Services

Create an `ai-service/.env` file:

```env
GEMINI_API_KEY=your_api_key
```

Start PostgreSQL, HAPI FHIR, the backend and AI service from the repository root:

```bash
docker compose up -d --build
```

| Service | Address |
|---|---|
| Backend API | http://localhost:8080 |
| HAPI FHIR | http://localhost:8081/fhir |
| AI service | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

Check the containers:

```bash
docker compose ps
```

Stop the system:

```bash
docker compose down
```

The scientific datasets in the `data/` directory are loaded automatically when the backend starts. Existing records are identified by stable IDs and are not inserted again.

### Running the Web Application

```bash
cd web-frontend
npm install
npm run dev
```

The development server uses `/api` and proxies requests to the backend running at `http://localhost:8080`.

Create a production build with:

```bash
npm run build
```

### Running the Android Application

Open the `mobile` directory in Android Studio and select the required build variant:

| Variant | Backend |
|---|---|
| `localDebug` | `http://10.0.2.2:8080` |
| `liveDebug` | Deployed RiverGuard backend |

`10.0.2.2` allows the Android emulator to access the backend running on the development computer.

Generate a live debug APK on Windows:

```powershell
cd mobile
.\gradlew.bat assembleLiveDebug
```

Generated APK:

```text
mobile/app/build/outputs/apk/live/debug/app-live-debug.apk
```

## Repository Structure

```text
.
├── ai-service/       # AI-assisted photo moderation
├── backend/          # Spring Boot API and services
├── data/             # Structured scientific datasets
├── docs/             # API contract and documentation
├── mobile/           # Native Android application
├── web-frontend/     # React monitoring platform
└── docker-compose.yml
```

## Authentication and Roles

RiverGuard uses server-side sessions and a `JSESSIONID` cookie rather than JWT. Passwords are protected using BCrypt.

Supported roles include:

- `CITIZEN`
- `DOCTOR`
- `MUNICIPALITY_STAFF`

New registrations are assigned the `CITIZEN` role. Account-specific and role-protected operations require a valid authenticated session.

## Team

| Team member | Responsibility |
|---|---|
| **Ahmet Hilmi Güler** | Backend core, API contract, FHIR integration, data processing and infrastructure |
| **Serranur Türkoğlu** | Native Android application, citizen reporting flow, mobile UI/UX and API integration |
| **Yusuf Büyüktaş** | Web dashboard, maps, data visualization, backend integration and web deployment |
| **Faruk Turnalı** | AI-assisted photo moderation, authentication, security and citizen report backend integration |

## Vision

RiverGuard was built around a simple idea: environmental harm is often noticed by local communities before it is formally recorded.

By connecting citizen observations, scientific evidence and health-compatible data standards, RiverGuard aims to shorten the distance between noticing a problem, understanding its context and taking informed action.

Our long-term vision is to expand RiverGuard beyond the Ergene Basin through verified laboratory results, live sensor networks, additional river basins and authorized public health integrations.

## Resources and Scientific References

### Project Resources

- [Live Web Platform](https://ieee-hackathon-omega.vercel.app/)
- [API Contract](docs/api-contract.md)
- Live API base URL: `http://134.112.41.108:8080/api`
- [OneAquaHealth Hackathon](https://oneaquahealth-ieee-hackathon.devpost.com/)

### Scientific References

1. [Arkoç (2014) – Heavy Metal Concentrations of Groundwater in the East of Ergene Basin](https://doi.org/10.1007/s00128-014-1347-x)
2. [Tokatlı (2021) – Health Risk Assessment of Toxic Metals](https://doi.org/10.1007/s12665-021-09467-z)
3. [Varol and Tokatlı (2023) – Water Quality and Health Risk Assessment](https://doi.org/10.1016/j.chemosphere.2022.137096)
4. [Aydın, Taş-Divrik and Atun (2026) – Potentially Toxic Element Contamination](https://doi.org/10.1007/s13762-026-07424-6)

## Scope and Limitations

RiverGuard is a hackathon proof of concept and should not be interpreted as a certified environmental or medical system.

- AI evaluates visual consistency only.
- A photograph cannot identify a chemical pollutant.
- Scientific measurements originate from published studies, not a live sensor network.
- Health risk values describe regional study findings, not individual diagnoses.
- The platform is not connected to real hospital records.
- Human review and laboratory analysis remain necessary for real-world decisions.
