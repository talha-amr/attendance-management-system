# Attendance Tracker

A full-stack attendance management system designed for educational institutions, with dedicated workflows for **Administrators, Teachers, and Students**.

The system manages users, teacher approvals, subjects, course sections, enrollments, timetables, and attendance through a role-based architecture built with **FastAPI, PostgreSQL, SQLAlchemy, Alembic, and Next.js**.

## Features

### Admin

Administrators have complete control over the academic structure and attendance system.

* Manage teachers and teacher approval requests
* Approve or reject teacher registrations
* Create and manage subjects
* Create course sections and assign teachers
* Manage student enrollments
* Create and manage course timetables
* Prevent timetable conflicts between teachers
* View attendance across the entire system
* Filter attendance by:

  * Student
  * Course section
  * Teacher
  * Date
  * Attendance status
* Update attendance records within the allowed time window

### Teacher

Approved teachers can manage attendance for the course sections assigned to them.

* View assigned course sections
* View enrolled students for each section
* View teaching timetable
* Mark attendance for students
* Mark students as present or absent
* View recent attendance records
* Update attendance records within the allowed attendance window
* Attendance marking is restricted to the teacher's own course sections

Teacher accounts use an approval workflow:

```text
Teacher Signup
      ↓
   Pending
      ↓
Admin Review
   ↙       ↘
Approved   Rejected
   ↓
Teacher Access
```

### Student

Students can manage their academic enrollment and track their attendance.

* View available course sections
* Enroll in courses
* Prevent duplicate course enrollment
* Prevent timetable conflicts during enrollment
* View enrolled courses
* View personal timetable
* View attendance records
* Filter attendance by course section
* View attendance status and marking time

## Attendance Rules

Attendance is protected by backend business rules rather than relying only on frontend validation.

* Attendance cannot be marked for future dates
* Attendance cannot be marked outside the configured attendance window
* Attendance cannot be duplicated for the same student, course section, and date
* Teachers can only manage attendance for their own course sections
* Attendance records become locked after the allowed update period
* Attendance can only be marked when a timetable exists for the selected course section and date

## Role-Based Access Control

The application uses JWT-based authentication together with role and profile checks.

| Role    | Access                          |
| ------- | ------------------------------- |
| Admin   | System-wide management          |
| Teacher | Assigned courses and attendance |
| Student | Personal courses and attendance |

Teacher accounts also have an approval state:

* `PENDING`
* `APPROVED`
* `REJECTED`

This ensures that newly registered teachers cannot access teaching functionality until an administrator approves them.

## Architecture

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                    ┌──────────▼──────────┐
                    │       FastAPI       │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        Authentication     Role Control     Business Logic
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │     SQLAlchemy      │
                    │         ORM         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │     PostgreSQL      │
                    └─────────────────────┘
```

## Tech Stack

### Backend

* **Python 3.12+**
* **FastAPI**
* **SQLAlchemy**
* **PostgreSQL**
* **Alembic**
* **Pydantic**
* **PyJWT**
* **pwdlib + Argon2**
* **uv** for dependency management

The backend dependencies are managed through `pyproject.toml` and locked with `uv.lock`.

### Frontend

* **Next.js**
* **React**
* **Tailwind CSS**
* React Context API for application state
* Next.js App Router

## Project Structure

```text
attendance-tracker/
│
├── app/
│   ├── routers/
│   │   ├── admin.py
│   │   ├── auth.py
│   │   ├── student.py
│   │   ├── teacher.py
│   │   └── user.py
│   │
│   ├── models.py
│   ├── schemas.py
│   ├── dependencies.py
│   ├── security.py
│   ├── database.py
│   └── main.py
│
├── alembic/
│   └── versions/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   └── ...
│
├── seed.py
├── seed_admin.py
├── alembic.ini
├── pyproject.toml
├── uv.lock
└── README.md
```

## Database

The backend uses PostgreSQL with SQLAlchemy as the ORM.

Database schema changes are managed through Alembic migrations.

Major entities include:

```text
User
 ├── Admin
 ├── Teacher
 └── Student

Subject
   │
   ▼
CourseSection
   │
   ├── Teacher
   ├── Enrollment ── Student
   └── TimeTable
          │
          ▼
      Attendance
```

This structure keeps attendance tied to a specific student, course section, and date while allowing the same course/teacher/student relationships to be reused throughout the application.

## API

The FastAPI backend exposes separate route groups for each role.

### Authentication

```text
/auth
/user
```

### Admin

```text
/admin
```

Handles teacher approval, subjects, course sections, enrollments, timetables, and system-wide attendance management.

### Teacher

```text
/teachers
```

Handles teacher profiles, assigned course sections, students, timetables, and attendance.

### Student

```text
/students
```

Handles student profiles, enrollments, available courses, timetables, and personal attendance.

FastAPI also provides interactive API documentation through Swagger UI when the backend is running.

## Getting Started

### Prerequisites

Make sure you have:

* Python 3.12+
* PostgreSQL
* Node.js
* npm
* `uv`

### Backend Setup

Clone the repository:

```bash
git clone https://github.com/talha-amr/attendance-tracker.git
cd attendance-tracker
```

Install Python dependencies using `uv`:

```bash
uv sync
```

Create your environment configuration:

```text
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key
```

Run database migrations:

```bash
uv run alembic upgrade head
```

Start the FastAPI development server:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

Configure the frontend API base URL through environment variables rather than hardcoding the backend URL when deploying.

## Database Seeding

The project includes seed scripts for populating development data.

```bash
uv run python seed.py
```

An administrator can be created using:

```bash
uv run python seed_admin.py
```

Use seed scripts only with a development or intentionally prepared database.

## Security

The application implements several security mechanisms:

* JWT authentication
* Password hashing with Argon2
* Role-based authorization
* Teacher approval authorization
* Protected route dependencies
* Server-side business-rule validation
* Database-backed access control
* CORS configuration

Authorization is enforced on the backend, meaning protected functionality cannot be accessed simply by manipulating the frontend.

## Attendance Flow

```text
Teacher selects course section
            ↓
      Load enrolled students
            ↓
       Check timetable
            ↓
      Select attendance date
            ↓
 Mark Present / Absent for students
            ↓
        Save records
            ↓
      Attendance stored
            ↓
 Student/Admin can view records
```

The same attendance records are shared across the system, allowing teachers to manage their records while administrators can monitor and manage attendance system-wide.

## What I Built

This project was built as a full-stack application to practice and demonstrate:

* REST API development with FastAPI
* Relational database design
* SQLAlchemy ORM
* Alembic database migrations
* JWT authentication and authorization
* Role-based access control
* React state management with Context API
* Next.js application architecture
* Frontend/backend integration
* API validation and error handling
* Academic scheduling and conflict detection
* Attendance business rules
* Multi-role application design

## Future Improvements

Potential future additions include:

* Attendance analytics and dashboards
* Attendance percentage calculations
* Low-attendance alerts
* Email notifications
* Pagination for large attendance datasets
* Production deployment
* Automated tests
* CI/CD
* More granular permissions
* Improved reporting and export functionality

## Status

The core attendance management system is functional, including the Admin, Teacher, and Student workflows.

The project is currently being prepared for production deployment.

## Author

**Muhammad Talha**

BS Software Engineering student focused on full-stack development and backend engineering.

GitHub: [@talha-amr](https://github.com/talha-amr)
