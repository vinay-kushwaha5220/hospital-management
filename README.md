# Hospital Management System

Full-stack hospital management system with React + Node.js + MongoDB.

## Features

- **Admin Role** — Dashboard, manage doctors, patients, appointments
- **Patient Role** — Book appointments, view patient list
- JWT Authentication with role-based access
- Filter appointments by date, doctor, status
- Responsive UI with Tailwind CSS

## Project Structure

```
├── backend/          # Node.js + Express API
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # Express routes
│   └── server.js
│
└── frontend/         # React app
    └── src/
        ├── api/      # Axios instance
        ├── components/
        ├── context/  # Auth context
        └── pages/    # Dashboard, Doctors, Patients, Appointments
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI and JWT_SECRET in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL if needed
npm start
```

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/dashboard | Admin |
| GET/POST | /api/doctors | Private |
| PUT/DELETE | /api/doctors/:id | Admin |
| GET/POST | /api/patients | Private |
| PUT/DELETE | /api/patients/:id | Private/Admin |
| GET/POST | /api/appointments | Private |
| PUT/DELETE | /api/appointments/:id | Private/Admin |

## Deploy to Vercel

**Backend:** Deploy `backend/` folder — add env vars in Vercel dashboard.

**Frontend:** Deploy `frontend/` folder — set `REACT_APP_API_URL` to your backend URL.
