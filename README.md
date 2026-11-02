# CareerBridge — Academia–Industry Internship & Placement Portal

**SIH26044 · Ministry of Ayush**

A full-stack web platform connecting students, companies, and universities through smart skill mapping, internship discovery, application tracking, and placement analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6.1 + Django REST Framework |
| Frontend | Next.js 16 + shadcn/ui + Tailwind CSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT via `djangorestframework-simplejwt` |
| Charts | Recharts + shadcn Chart |
| Skill Matching | Rule-based Python algorithm |

---

## Project Structure

```
ayush_portal/
├── accounts/         # Custom user model, auth, profiles
├── institutions/     # Universities, student profiles, companies
├── internships/      # Listings, skills, matching algorithm
├── applications/     # Apply, track, status updates
├── analytics/        # Dashboard KPIs per role
├── careerbridge-frontend/  # Next.js + shadcn/ui frontend
│   ├── src/app/
│   │   ├── page.tsx               # Landing page
│   │   ├── login/                 # Login page
│   │   ├── register/              # Registration (role-based)
│   │   ├── internships/           # Public listings + apply
│   │   └── dashboard/
│   │       ├── student/           # Student dashboard + skills + profile + applications
│   │       ├── company/           # Recruiter dashboard + internships + applicants
│   │       └── university/        # University analytics dashboard
│   └── src/lib/api.ts             # Full API client with JWT auto-refresh
└── requirements.txt
```

---

## Quick Start

### 1. Activate virtual environment
```powershell
.\myenv\Scripts\Activate.ps1
```

### 2. Start Django backend (port 8000)
```powershell
cd ayush_portal
python manage.py runserver
```

### 3. Start Next.js frontend (port 3000)
```powershell
cd careerbridge-frontend
npm run dev
```

### 4. Access the app
- **Frontend**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin/
- **API Root**: http://localhost:8000/api/

### Default admin credentials
- **Username**: `admin`
- **Password**: `Admin@1234`

---

## User Roles & Workflows

### Student
1. Register → complete academic profile
2. Add skills with proficiency levels
3. Browse & filter internships by skill/location/mode
4. Apply with a cover letter
5. Track applications in real time
6. View skill-match % for any internship

### Company Recruiter
1. Register → create company profile
2. Post internship listings (draft or publish)
3. View and filter applicants
4. Review cover letters, update status (shortlisted/selected/rejected)
5. Add internal recruiter notes

### University
1. View platform-wide placement analytics
2. Monitor top skills across all students
3. See total students, applications, placements, and placement rate

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/token/` | JWT login |
| `POST /api/token/refresh/` | JWT refresh |
| `POST /api/accounts/register/` | Register new user |
| `GET /api/accounts/me/` | Current user info |
| `GET /api/internships/` | List published internships (search/filter) |
| `GET /api/internships/<id>/match/` | Skill-match score for a student |
| `GET/POST /api/applications/` | Student's applications |
| `GET /api/applications/recruiter/` | Recruiter's applicants |
| `PATCH /api/applications/recruiter/<id>/status/` | Update application status |
| `GET /api/analytics/student/` | Student dashboard KPIs |
| `GET /api/analytics/company/` | Company dashboard KPIs |
| `GET /api/analytics/university/` | University placement stats |

---

## Skill Matching Algorithm

Rule-based weighted scoring:
- Required skills: **3× weight**
- Preferred skills: **1× weight**
- Score = (matched_required × 3 + matched_preferred) / (total_required × 3 + total_preferred) × 100

Returns: score (0–100), matched required, missing required, matched preferred.

---

## CV Description

**CareerBridge — Academia–Industry Internship & Placement Portal** | Python, Django, Next.js, PostgreSQL, shadcn/ui, TypeScript

- Developed a full-stack internship platform connecting students, recruiters, and universities with role-based access, JWT authentication, and real-time application tracking.
- Designed relational database models using Django ORM with DB-level constraints preventing duplicate applications.
- Built a rule-based skill-matching algorithm scoring student profiles against internship requirements (weighted required vs. preferred skills).
- Created interactive dashboards with Chart.js/Recharts visualizations and Django ORM aggregations for placement analytics.
- Implemented a Next.js frontend with 15+ shadcn/ui components including sidebar navigation, data tables, dialogs, and charts.
