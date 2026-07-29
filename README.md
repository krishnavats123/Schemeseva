# SchemeSeva – Government Scheme Recommendation Portal

A full-stack web application that helps Indian citizens discover and apply for government schemes they are eligible for. Built with **Spring Boot**, **React**, and **MongoDB**.

---

## Features

| Feature | Description |
|---|---|
| Smart Eligibility Engine | Matches user profile against scheme criteria (age, income, state, caste, occupation) |
| Recommendation Score | Scores schemes 0–100 based on how well they match (state 40pt + occupation 25pt + income 20pt + age 15pt) |
| Document Checklist | Per-scheme checklist; users toggle documents as available/missing |
| Application Readiness | `(Eligibility 100% + Doc readiness%) / 2` shown as a ring chart |
| Scheme Search | Full-text search + tag filters (Student, Farmer, Women, Health…) |
| Bookmarks | Save schemes to review later |
| Notification System | Spring Scheduler emails users when a new eligible scheme is added |
| Admin Panel | Add / edit / deactivate schemes with full CRUD |
| JWT Auth | BCrypt password hashing, stateless JWT sessions, role-based access (CITIZEN / ADMIN) |

---

## Tech Stack

**Backend**
- Java 17
- Spring Boot 3.2
- Spring Security + JWT (jjwt 0.11)
- Spring Data MongoDB
- Spring Mail + Spring Scheduler
- Lombok

**Frontend**
- React 18
- React Router v6
- Material UI v5
- Axios
- Recharts

**Infrastructure**
- MongoDB 7
- Docker + Docker Compose
- Nginx (reverse proxy + SPA routing)

---

## Project Structure

```
schemeseva/
├── backend/
│   ├── src/main/java/com/schemeseva/
│   │   ├── SchemeSeva.java              # Entry point
│   │   ├── config/
│   │   │   ├── SecurityConfig.java      # Spring Security + CORS
│   │   │   └── DataSeeder.java          # Seeds admin user + 10 schemes
│   │   ├── controller/
│   │   │   ├── AuthController.java      # POST /api/auth/register|login
│   │   │   ├── UserController.java      # Profile, bookmarks, docs, notifications
│   │   │   └── SchemeController.java    # Scheme CRUD + search
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Scheme.java
│   │   │   ├── UserDocument.java
│   │   │   └── Notification.java
│   │   ├── repository/                  # MongoRepository interfaces
│   │   ├── security/
│   │   │   ├── JwtUtil.java             # Token generation & validation
│   │   │   └── JwtAuthFilter.java       # OncePerRequestFilter
│   │   └── service/
│   │       ├── RecommendationService.java   # Eligibility check + scoring
│   │       ├── AuthService.java
│   │       └── NotificationService.java    # Scheduler + email
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                   # Routes
│   │   ├── context/AuthContext.jsx   # Global auth state
│   │   ├── services/api.js           # Axios + interceptors
│   │   ├── components/Layout.jsx     # Sidebar navigation
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx         # Stats + top schemes + readiness rings
│   │       ├── Schemes.jsx           # Search + filter + bookmarks
│   │       ├── SchemeDetail.jsx      # Full detail + document checklist
│   │       ├── Profile.jsx           # Edit user profile
│   │       ├── Documents.jsx         # All checklists in one view
│   │       ├── Notifications.jsx     # Notification feed
│   │       └── AdminDashboard.jsx    # Admin scheme management
│   ├── public/index.html
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml
```

---

## Quick Start

### Option 1 – Docker Compose (recommended)

```bash
# Clone the project
git clone https://github.com/yourname/schemeseva.git
cd schemeseva

# Add mail credentials (optional – notifications won't work without these)
echo "MAIL_USERNAME=your@gmail.com" > .env
echo "MAIL_PASSWORD=your-app-password" >> .env

# Start everything
docker-compose up --build

# Access
# Frontend:  http://localhost
# Backend:   http://localhost:8080
# Admin:     admin@schemeseva.in / admin123
```

### Option 2 – Local development

**Prerequisites:** Java 17, Maven, Node 18, MongoDB running on port 27017

```bash
# Backend
cd backend
mvn spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

---

## API Reference

### Auth
| Method | URL | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{name, email, password}` | Register new citizen |
| POST | `/api/auth/login` | `{email, password}` | Login → returns JWT |

### User (requires `Authorization: Bearer <token>`)
| Method | URL | Description |
|---|---|---|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/dashboard` | Stats + top schemes |
| GET | `/api/user/recommendations` | All eligible schemes sorted by score |
| POST | `/api/user/bookmarks/:id` | Bookmark a scheme |
| DELETE | `/api/user/bookmarks/:id` | Remove bookmark |
| GET | `/api/user/documents` | Get all document statuses |
| POST | `/api/user/documents` | Update document status `{schemeId, documentStatus: {doc: bool}}` |
| GET | `/api/user/notifications` | Get notifications |
| POST | `/api/user/notifications/mark-read` | Mark all as read |

### Schemes (public GET, admin POST/PUT/DELETE)
| Method | URL | Description |
|---|---|---|
| GET | `/api/schemes?search=&tag=` | List/search schemes |
| GET | `/api/schemes/:id` | Scheme detail |
| POST | `/api/schemes` | Create scheme (admin only) |
| PUT | `/api/schemes/:id` | Update scheme (admin only) |
| DELETE | `/api/schemes/:id` | Soft-delete scheme (admin only) |

---

## Recommendation Scoring

```
score = 0
if user.state in scheme.allowedStates (or scheme is nationwide)  → +40
if user.occupation in scheme.allowedOccupations                  → +25
if user.annualIncome <= scheme.maxIncome                         → +20
if scheme.minAge <= user.age <= scheme.maxAge                    → +15
─────────────────────────────────────────────────────────────────────
max score = 100
```

Schemes where ANY hard criterion fails (age out of range, income too high, wrong category, etc.) are excluded entirely before scoring.

---

## Seeded Test Data

On first startup, 10 real government schemes are automatically seeded:

1. PM Scholarship Scheme
2. Ayushman Bharat – PMJAY
3. PM Awas Yojana – Urban
4. PM Kisan Samman Nidhi
5. NSP Central Sector Scheme
6. Skill India – PMKVY
7. PMJDY – Jan Dhan Yojana
8. Stand-Up India Scheme
9. PM Ujjwala Yojana
10. PM SVANidhi – Street Vendor Loan

---

## Resume Bullet

> Developed **SchemeSeva**, a Government Scheme Recommendation Portal using Spring Boot 3, React 18, and MongoDB. Implemented a rule-based eligibility engine with weighted recommendation scoring, JWT authentication with role-based access control, document readiness tracking, and a Spring Scheduler-driven notification system. Deployed with Docker Compose and Nginx reverse proxy.

---

## SIH Talking Points

- **Problem solved:** 70% of rural Indians are unaware of schemes they qualify for
- **Recommendation engine:** Weighted scoring (not just yes/no filtering) demonstrates algorithmic thinking
- **Document readiness:** Unique UX feature that converts eligibility into actionable steps
- **Admin CRUD:** Demonstrates full lifecycle — not just a read-only app
- **Scheduler + email:** Shows knowledge of Spring's async/background task handling
- **Spring Security + JWT:** Enterprise-grade auth pattern interviewers probe deeply
