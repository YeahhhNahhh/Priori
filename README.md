# Priori

Priori is an intelligent healthcare triage and hospital coordination platform designed to help patients receive timely medical assistance while enabling hospitals to manage emergency requests efficiently.

The platform combines symptom assessment, hospital recommendations, emergency SOS support, live patient tracking, and real-time communication to improve healthcare accessibility and response times.

---

## Features

### Patient Features

* Secure user authentication and profile management
* Symptom-based health assessment and triage
* Personalized hospital recommendations
* Medical history management
* Emergency SOS request system
* Real-time alerts and notifications
* Family profile management
* Live location sharing during emergencies
* Feedback submission

### Hospital/Admin Features

* Hospital dashboard for monitoring requests
* Live patient queue management
* Emergency SOS request handling
* Patient information and medical details access
* Hospital profile management
* Administrative alerts and notifications
* Real-time monitoring of incoming cases

### Real-Time Functionality

* WebSocket-powered live updates
* Real-time emergency notifications
* Live location tracking
* Instant synchronization between patients and hospitals

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Socket.IO Client
* Framer Motion
* React Leaflet

### Backend

* Node.js
* Express.js
* Socket.IO
* Prisma ORM
* JWT Authentication
* BCrypt

### Database

* SQLite / Prisma

---

## Project Structure

```text
Priori/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── prisma/
│   ├── src/
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/YeahhhNahhh/Priori.git
cd Priori
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file and configure the required environment variables.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Start the backend server:

```bash
npm start
```

### Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available on the local development server provided by Vite.

---

## Future Improvements

* AI-powered symptom prediction
* Integration with healthcare APIs
* Appointment scheduling
* Electronic health record support
* Advanced analytics dashboard
* Multi-hospital coordination system

---

## Contributors

Developed as part of a healthcare technology project focused on improving emergency response and patient care coordination.

---

**Note:** To run this project locally, clone the repository and install all required dependencies using `npm install` in both the frontend and backend directories, configure the environment variables, run the database migrations, and start both servers.
