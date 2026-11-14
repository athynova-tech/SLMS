# Smart Library Management System (SLMS)

A full-stack web application for managing a modern library: catalogue and e-books, borrowing and returns, reservations, study-seat booking, multi-branch inventory, payments, reports, and an AI assistant for members.

## Features

**Members**
- Search and browse books, view details, reviews and ratings
- Borrow history, reservations, wishlist and bookmarks
- Read e-books online in the built-in reader
- Book study seats and rooms
- AI assistant and personalised book recommendations
- Notifications and profile management

**Librarians**
- Borrowing and returns desk
- Inventory and reservation management
- Member lookup and seat management

**Administrators**
- Dashboard with KPIs and charts
- User, member, book, category and e-book management
- Library branch management and book transfers between branches
- Reports and analytics, notifications, system settings

**General**
- JWT authentication with role-based access (Admin, Librarian, Member)
- Password change, forgot/reset password
- QR codes for books
- Attendance tracking
- Payments (fines and fees)

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Java, Spring Boot, Spring Security (JWT), Spring Data JPA, Maven |
| Frontend | React, Vite, Tailwind CSS (PostCSS), ESLint |
| Database | Configured in `application.yml` (see Configuration) |

## Project Structure

```
SLMS/
├── smart-library-backend/      # Spring Boot REST API
│   └── src/main/java/com/smartlibrary/
│       ├── config/             # CORS, security, data seeding
│       ├── controller/         # REST controllers
│       ├── dto/                # Request/response objects
│       ├── exception/          # Global error handling
│       ├── model/              # JPA entities and enums
│       ├── repository/         # Data access layer
│       ├── security/           # JWT filter and token provider
│       └── service/            # Business logic
└── smart-library-frontend/     # React + Vite single-page app
    └── src/
        ├── components/         # Reusable UI (books, dashboard, common, ai...)
        ├── context/            # Auth context
        ├── layouts/            # Admin, Librarian, Member layouts
        ├── pages/              # admin, librarian, member, landing, auth
        ├── routes/             # App routing
        └── services/           # API client
```

## Getting Started

### Prerequisites
- JDK 21 (see `pom.xml`) and Maven 3.8+
- Node.js 18+ and npm

### 1. Backend (development)

```bash
cd smart-library-backend
mvn spring-boot:run
```

The `dev` profile is the default: in-memory H2 database, demo data from `DataSeeder`
(`admin@library.com`, `librarian@library.com`, `member@library.com`, password `password123`)
and the H2 console at `/h2-console`. **These accounts exist only in the `dev` profile.**
The API starts on `http://localhost:8081`.

### 2. Frontend

```bash
cd smart-library-frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

### 3. Production

Run with `SPRING_PROFILES_ACTIVE=prod` and the environment variables listed in `.env.example`
(database, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, and `ADMIN_EMAIL`/`ADMIN_PASSWORD` for the first admin).
The application refuses to start without `JWT_SECRET`. Generate one with `openssl rand -base64 48`.

### Tests

```bash
cd smart-library-backend
mvn test
```

## Security model

- Access tokens last 30 minutes; the frontend refreshes them automatically with a 7-day refresh token.
- Roles are enforced on the server in `SecurityConfig`; members can only read and change their own data.
- Never commit real secrets. Anything that was ever committed must be treated as compromised and rotated.

## Roles

| Role      | Access |
|-----------|--------|
| ADMIN     | Full system management |
| LIBRARIAN | Circulation, inventory, members, seats |
| MEMBER    | Search, borrow, reserve, read e-books, book seats |

## Author

**Athuman Haruna Kasele**
GitHub: [@athynova-tech](https://github.com/athynova-tech)

## License

Add a license of your choice (for example MIT) or state that all rights are reserved.
