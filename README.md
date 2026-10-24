# MedIntelliX — Intelligent Healthcare. Connected Care.

MedIntelliX is an AI-powered unified healthcare management platform designed to connect patients, healthcare providers, and public health officials with real-time health intelligence, electronic health records (EHR), and automated medical workflows.

---

## 🌟 Key Capabilities & Portals

1. **Patient Portal**:
   - Centralized health records & digital prescriptions
   - Appointment booking and physician consultations
   - Medication tracking and dosage schedules
   - Health timeline visualization

2. **Hospital / Healthcare Provider Portal**:
   - Patient intake and medical registry
   - Clinical consultation documentation
   - Bed occupancy and emergency queue management
   - Medical reports & diagnostics generation

3. **Government / Public Health Portal**:
   - Regional health indicators and epidemiological surveillance
   - Disease trend monitoring & vaccination rate tracking
   - Hospital network analytics

---

## 🛠️ Technology Stack (Aligned with Project Specification)

- **Frontend**: Responsive HTML5, CSS3, Modern JavaScript, Bootstrap 5.3, Bootstrap Icons
- **Backend**: Node.js, Express.js REST API
- **Database**: PostgreSQL (Hosted on Supabase with Connection Pooling)
- **Security & Auth**: JSON Web Tokens (JWT), Role-Based Access Control (RBAC), bcryptjs salted password hashing, audit logs
- **External Integrations & AI**:
  - OpenFDA Drug & Medication Database
  - Medical Report / Prescription OCR Scanner
  - AI Health Consultation & Medical Summarization
  - ClinicalTrials.gov API

---

## 📁 Project Structure

```text
MedIntelliX/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js     # PostgreSQL connection pool with local fallback
│   │   │   └── migrate.js      # One-click PostgreSQL schema migration script
│   │   ├── middleware/
│   │   │   ├── authenticate.js # JWT verification
│   │   │   ├── authorize.js    # Role-Based Access Control (RBAC)
│   │   │   └── error-handler.js# Centralized error handling
│   │   ├── routes/
│   │   │   ├── auth.routes.js  # Registration, Login, Profile endpoints
│   │   │   ├── patient.routes.js
│   │   │   ├── hospital.routes.js
│   │   │   └── government.routes.js
│   │   └── server.js           # Express application entrypoint
│   ├── .env.example            # Environment variables template
│   └── package.json            # Node.js dependencies
├── database/
│   └── schema.sql              # Production PostgreSQL DDL schema
├── css/                        # Stylesheets for portals and landing page
├── js/                         # Client-side scripts & API integration
├── pages/                      # Multi-portal application views
│   ├── patient/
│   ├── hospital/
│   ├── government/
│   ├── login.html
│   └── register.html
├── docs/                       # Project documentation & architecture
└── index.html                  # Landing page
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/sonia776/MedIntelliX.git
cd MedIntelliX/backend

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend/` directory by copying `.env.example`:
```bash
cp .env.example .env
```
Configure your PostgreSQL / Supabase connection string:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_jwt_key
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 4. Database Setup
Run the database migration to create all tables and initial seed data:
```bash
npm run migrate
```

### 5. Running the Application
```bash
# Start backend server
node src/server.js

# Serve frontend (e.g. using any local static server on port 3000)
# Open http://localhost:3000 in your browser
```

---

## 🔒 Security & Privacy
- **Environment Isolation**: All credentials and database connection strings are excluded from version control via `.gitignore`.
- **Role-Based Access Control**: Strict access boundaries between Patient, Hospital, and Government accounts.
- **Audit Logs**: Secure tracking of authentication events and resource access.

---

## 👩‍💻 Contributors
- **Sonia** — Backend Architecture, PostgreSQL Database Engineering, REST APIs, Authentication & External Integrations
- **Simran, Shweta, Sundaram, Shreya** — MedIntelliX Healthcare Team
"# MedIntelliX" 
