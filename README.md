# 💳 FintechIQ — Transaction Intelligence Platform

<div align="center">

![FintechIQ Banner](https://img.shields.io/badge/FintechIQ-Transaction%20Intelligence-3b82f6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7wn5KzPC90ZXh0Pjwvc3ZnPg==)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-6db33f?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-f89820?style=flat-square&logo=java)](https://adoptium.net/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/Groq-llama3--70b-f55036?style=flat-square)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**An enterprise-grade banking dashboard powered by Spring Boot, Supabase PostgreSQL, and Groq AI (llama3-8b). Automatically categorizes transactions, detects fraud anomalies, streams live alerts, and generates monthly AI financial health reports.**

[▶ Live App (Vercel)](https://fintech-iq.vercel.app) · [⚙️ Backend API (Render)](https://fintech-iq.onrender.com) · [📖 API Docs](#-api-endpoints) · [🏗️ Architecture](#-architecture)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Spring Security 6 with role-based access (ADMIN / USER) |
| 🤖 **AI Categorization** | Groq llama3-8b auto-categorizes every transaction |
| 🚨 **Fraud Detection** | AI anomaly detection with LOW / MEDIUM / HIGH severity |
| 🚪 **Access Requests** | Employees request access; Admins approve and issue secure passwords |
| 📡 **Live Streaming** | Spring WebFlux SSE — real-time fraud alerts in browser |
| 📊 **Monthly Reports** | Cron-scheduled AI financial health reports |
| 📈 **Analytics Charts** | 6-month income/expense trends via Recharts |
| 🛡️ **Admin Panel** | User management, platform stats, access control (ADMIN role only) |
| 🌐 **Supabase DB** | Cloud PostgreSQL with auto-schema via JPA DDL |
| 🐳 **Docker Ready** | Full docker-compose for production deployment |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                  │
│         Recharts · Axios · SSE · React Router v6         │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / SSE (port 5173 → 8080)
┌──────────────────────────▼──────────────────────────────┐
│              Spring Boot 3.3 API (port 8080)             │
│                                                          │
│  Spring Security 6 ── JWT Filter ── Role-based Guards    │
│  Spring Data JPA  ── Hibernate 6 ── Custom JPQL queries  │
│  Spring WebFlux   ── SseEmitter ── Per-user event stream │
│  Spring Scheduler ── @Scheduled cron ── Monthly reports  │
│  Spring 6.1 RestClient ── Groq API (llama3-70b-8192)     │
└──────────────────────────┬──────────────────────────────┘
                           │ JDBC / SSL
┌──────────────────────────▼──────────────────────────────┐
│           Supabase PostgreSQL (Cloud Hosted)             │
│   tables: users · transactions · monthly_reports         │
└──────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
Transaction/
├── 📄 README.md
├── 📄 docker-compose.yml          # Production Docker setup
├── 📄 start.bat                   # Windows one-click dev launcher
│
├── 📁 backend/                    # Spring Boot 3.3 (Java 21)
│   ├── 📄 pom.xml
│   ├── 📄 Dockerfile
│   ├── 📄 .env                    # ← Your secrets (gitignored!)
│   └── src/main/java/com/fintech/
│       ├── config/
│       │   ├── SecurityConfig.java       # JWT + CORS + Role guards
│       │   ├── RestClientConfig.java     # Groq API RestClient bean
│       │   ├── DataSeeder.java           # Auto-seeds demo data
│       │   └── GlobalExceptionHandler.java
│       ├── security/
│       │   ├── JwtUtil.java              # JJWT 0.12 token lifecycle
│       │   ├── JwtFilter.java            # OncePerRequestFilter
│       │   └── UserDetailsServiceImpl.java
│       ├── model/
│       │   ├── User.java                 # ROLE_USER / ROLE_ADMIN
│       │   ├── Transaction.java          # AI category + anomaly fields
│       │   └── MonthlyReport.java        # AI insights as TEXT
│       ├── repository/                   # Spring Data JPA repos
│       ├── dto/                          # Request/Response DTOs
│       ├── service/
│       │   ├── AiService.java            # Groq API integration
│       │   ├── TransactionService.java   # AI pipeline per transaction
│       │   ├── ReportService.java        # Monthly AI reports
│       │   ├── SseService.java           # Live notification streams
│       │   └── AuthService.java
│       ├── controller/                   # REST API controllers
│       └── scheduler/
│           └── ReportScheduler.java      # cron: 1st of every month
│
└── 📁 frontend/                   # React 18 + Vite
    ├── 📄 .env                    # VITE_API_URL
    ├── 📄 Dockerfile
    ├── 📄 nginx.conf              # SPA + SSE-compatible reverse proxy
    └── src/
        ├── pages/
        │   ├── Login.jsx          # Glassmorphism auth
        │   ├── Register.jsx
        │   ├── Dashboard.jsx      # Stats + charts + anomaly panel
        │   ├── Transactions.jsx   # Paginated table + add form
        │   ├── Analytics.jsx      # 4 Recharts visualizations
        │   ├── Reports.jsx        # AI monthly report viewer
        │   └── Admin.jsx          # User management (admin only)
        ├── components/
        │   └── Layout.jsx         # Sidebar + SSE notification toasts
        ├── context/AuthContext.jsx # JWT auth state
        ├── hooks/useSSE.js        # EventSource with auto-reconnect
        └── services/api.js        # Axios + JWT interceptor
```

---

## ⚡ Quick Start

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Java JDK | 21+ | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Node.js | 18+ | `node -v` |
| Supabase account | Free tier | [supabase.com](https://supabase.com) |
| Groq API key | Free | [console.groq.com](https://console.groq.com) |

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/fintech-transaction-intelligence.git
cd fintech-transaction-intelligence/Transaction
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
# Supabase PostgreSQL
SPRING_DATASOURCE_URL=jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_supabase_db_password

# JWT (change this in production!)
JWT_SECRET=3cfa76ef14937c1c0ea519f8fc057a80fcd04a7ac7e4cb5001d6a7f9b5a3e3d

# Groq AI
GROQ_API_KEY=gsk_your_groq_api_key_here

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

> **Where to get these:**
> - Supabase URL: Dashboard → Settings → Database → Connection String (JDBC tab)
> - Groq key: [console.groq.com](https://console.groq.com) → API Keys → Create

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

✅ Look for: `Started TransactionIntelligenceApplication in XX seconds`  
✅ Look for: `🌱 Seeding initial data...` on first run

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Open: **http://localhost:5173**

### 5. Windows One-Click (Optional)

```bash
# From Transaction/ directory — just double-click:
start.bat
```

> Automatically reads `.env`, sets `JAVA_HOME`, and opens both servers.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👤 User | `user@fintech.com` | `user1234` | Dashboard, Transactions, Reports |
| 🛡️ Admin | `admin@fintech.com` | `admin123` | All pages + Admin Panel |

---

## 📡 API Endpoints

### Auth (Public)
```
POST   /api/auth/register       → Register new user → returns JWT
POST   /api/auth/login          → Login → returns JWT
POST   /api/auth/request-access → Submit access request for Admin approval
```

### Transactions (🔒 JWT Required)
```
GET    /api/transactions                    → Paginated list (page, size, category, type)
POST   /api/transactions                    → Add transaction → AI categorizes + anomaly check
GET    /api/transactions/summary            → Monthly totals + category breakdown
GET    /api/transactions/anomalies          → All flagged transactions
```

### Reports (🔒 JWT Required)
```
GET    /api/reports                         → All reports for current user
GET    /api/reports/monthly?month=2026-03   → Get or auto-generate monthly report
POST   /api/reports/generate?month=2026-03  → Force generate with AI insights
```

### Live Notifications (🔒 JWT Required)
```
GET    /api/notifications/stream            → SSE stream (text/event-stream)
```

Events emitted:
- `ANOMALY_ALERT` — when a suspicious transaction is added
- `REPORT_READY` — when a scheduled report is generated

### Admin (🔒 ROLE_ADMIN Only)
```
GET    /api/admin/users                        → All registered users
GET    /api/admin/reports                      → All reports across all users
GET    /api/admin/stats                        → Platform stats
GET    /api/admin/access-requests              → View pending employee requests
POST   /api/admin/access-requests/{id}/approve → Approve, auto-create user, return secure password
POST   /api/admin/access-requests/{id}/reject  → Mark request as rejected
```

### Health
```
GET    /actuator/health        → Application health status (public)
```

---

## 🤖 AI Layer — Groq API

Every transaction flows through the AI pipeline:

```
New Transaction
      │
      ▼
categorizeTransaction()       ← Groq: "What category is Swiggy ₹500?"
      │                         → Returns: FOOD
      ▼
detectAnomaly()               ← Groq: "Is ₹75,000 to Unknown Transfer suspicious?"
      │                         → Returns: {anomalous: true, severity: HIGH}
      ▼
Save to Supabase
      │
      ▼
If anomalous → pushNotification() via SSE → Browser popup
```

**AI Categories:** `FOOD` `TRANSPORT` `SHOPPING` `UTILITIES` `ENTERTAINMENT` `HEALTH` `SALARY` `INVESTMENT` `OTHER`

**Anomaly Severity:** `LOW` `MEDIUM` `HIGH`

**Monthly Reports:** AI writes a 3-paragraph financial health narrative with personalized savings tips.

> **Mock Mode:** If no Groq key is set, the app uses rule-based categorization (merchant name matching) and threshold-based anomaly detection. Fully functional without an API key.

---

## 📊 Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL | Primary key |
| email | VARCHAR | Unique |
| password | VARCHAR | BCrypt hashed |
| full_name | VARCHAR | |
| role | VARCHAR | `ROLE_USER` or `ROLE_ADMIN` |
| created_at | TIMESTAMP | Auto |

### `transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL | Primary key |
| user_id | BIGINT | FK → users |
| amount | DECIMAL(12,2) | |
| merchant | VARCHAR | |
| description | VARCHAR | |
| category | VARCHAR | AI-assigned |
| type | VARCHAR | `CREDIT` or `DEBIT` |
| timestamp | TIMESTAMP | |
| is_anomalous | BOOLEAN | AI-flagged |
| anomaly_reason | VARCHAR | AI explanation |
| anomaly_severity | VARCHAR | `LOW`/`MEDIUM`/`HIGH` |

### `monthly_reports`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL | Primary key |
| user_id | BIGINT | FK → users |
| report_month | VARCHAR | Format: `2026-03` |
| total_income | DECIMAL | |
| total_spend | DECIMAL | |
| net_savings | DECIMAL | |
| anomaly_count | INT | |
| category_breakdown | TEXT | JSON string |
| ai_insights | TEXT | Groq-generated narrative |
| generated_at | TIMESTAMP | Auto |

### `access_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL | Primary key |
| full_name | VARCHAR | |
| email | VARCHAR | Unique |
| department | VARCHAR | |
| reason | VARCHAR | |
| status | VARCHAR | `PENDING`/`INVITED`/`REJECTED` |
| requested_at | TIMESTAMP | Auto |
| reviewed_at | TIMESTAMP | |

---

## 🐳 Docker Deployment

```bash
# Set your secrets in docker-compose.yml environment section
# or pass them as env vars:

SPRING_DATASOURCE_PASSWORD=your_pass GROQ_API_KEY=your_key docker-compose up --build
```

Services:
- `fintech-backend` → `localhost:8080`
- `fintech-frontend` (Nginx) → `localhost:3000`

---

## 🔧 Spring Features Demonstrated

| Spring Feature | Implementation |
|---------------|----------------|
| `Spring Security 6` | Stateless JWT, BCrypt, Role guards, CORS |
| `Spring Data JPA` | 3 entities, custom JPQL, pagination |
| `Spring WebFlux SSE` | `SseEmitter` per-user notification streams |
| `Spring @Scheduled` | Monthly cron job (`0 0 1 1 * ?`) |
| `Spring 6.1 RestClient` | Fluent Groq API calls |
| `@PreAuthorize` | Method-level admin access control |
| `CommandLineRunner` | Auto data seeding on startup |
| `@ControllerAdvice` | Global exception handling |
| `HikariCP` | Connection pool with Supabase SSL |

---

## ☁️ Live Cloud Deployment Architecture

This project is deployed using a decoupled, serverless-friendly cloud architecture to ensure maximum uptime and zero-configuration scaling:

*   **Frontend (Vercel):** The React Vite application is edge-deployed on Vercel. Requests are routed dynamically via the `VITE_API_URL` environment variable.
*   **Backend API (Render):** The Spring Boot API runs as a containerized web service on Render. It handles all business logic, Groq AI integrations, and strict CORS filtering (`CORS_ORIGINS`).
*   **Database (Supabase):** The PostgreSQL database uses Supabase's **IPv4 Transaction/Session Pooler** (Port `6543`) to guarantee compatibility with Render's IPv4 network architecture.

### Deployment Variables Walkthrough:
1. **Frontend to Backend:** `VITE_API_URL` -> `https://fintech-iq.onrender.com`
2. **Backend to Database:** `SPRING_DATASOURCE_URL` -> Base JDBC paired with `pooler.supabase.com:6543`
3. **Backend CORS:** `CORS_ORIGINS` -> `https://fintech-iq.vercel.app`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | Java 21 (Eclipse Temurin) |
| **Backend Framework** | Spring Boot 3.3 |
| **Security** | Spring Security 6 + JJWT 0.12.6 |
| **Database ORM** | Spring Data JPA + Hibernate 6 |
| **Database** | Supabase (PostgreSQL 15) |
| **AI Model** | Groq API — llama3-8b-8192 |
| **Streaming** | Spring WebFlux SSE |
| **Scheduling** | Spring `@EnableScheduling` |
| **HTTP Client** | Spring 6.1 RestClient |
| **Frontend** | React 18 + Vite 8 |
| **Charts** | Recharts |
| **Routing** | React Router v6 |
| **HTTP Client FE** | Axios |
| **Styling** | Vanilla CSS (dark mode) |
| **Container** | Docker + Nginx |
| **Build Tool** | Maven 3.9 |

---

## 📁 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_DATASOURCE_URL` | ✅ | Supabase JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | ✅ | Database username (usually `postgres`) |
| `SPRING_DATASOURCE_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | 256-bit hex string for JWT signing |
| `GROQ_API_KEY` | ⭐ | Groq API key (falls back to mock if absent) |
| `CORS_ORIGINS` | ⚙️ | Comma-separated allowed frontend origins |
| `JWT_EXPIRATION_MS` | ⚙️ | Token expiry in ms (default: 86400000 = 24h) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ using **Spring Boot** + **React** + **Groq AI** + **Supabase**

⭐ Star this repo if you found it useful!

</div>
