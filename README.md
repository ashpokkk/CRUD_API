# Task API — CRUD & Supabase Authentication API

A REST API built with **Node.js** and **Express.js** for managing tasks, with **PostgreSQL** persistence and **Supabase Authentication**.

The project demonstrates:

* CRUD operations for tasks
* User registration and login
* JWT-based authentication
* Protected API routes
* Reusable authentication middleware
* Supabase token verification
* Logout functionality
* Interactive Swagger API documentation
* PostgreSQL persistence using Docker

---

## Features

### Task Management

* Create new tasks
* Retrieve all tasks
* Retrieve a single task by ID
* Update existing tasks
* Delete tasks
* PostgreSQL database persistence
* Three seed tasks on the first run
* Request validation
* Proper HTTP status codes
* Parameterized SQL queries

### Authentication

* User signup with Supabase
* User login with email and password
* JWT access tokens
* Access-token verification through Supabase
* Reusable authentication middleware
* Protected API endpoints
* User profile endpoint
* Protected dashboard endpoint
* Protected logout endpoint
* Invalid and expired token handling
* Public and protected routes

### Documentation

* Interactive Swagger UI
* Bearer JWT authentication in Swagger
* Swagger Authorize button
* Protected-route lock icons
* Try it out support for authenticated endpoints

---

## Technologies Used

* Node.js
* Express.js
* PostgreSQL
* `pg`
* Supabase
* `@supabase/supabase-js`
* Docker
* Docker Compose
* Swagger UI Express
* Swagger JSDoc

---

## Architecture

The application consists of the Express API, PostgreSQL database, and Supabase Authentication.

```text
                         Client
                           │
                           │ HTTP requests
                           ▼
                  Node.js + Express API
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           Supabase    Auth Middleware PostgreSQL
          Auth / JWT        │          Database
              │             │            │
              └───────┬─────┘            │
                      │                  Docker
                      ▼
              Protected Routes
```

### Authentication Flow

```text
User
 │
 ├── Sign up ───────────────► Supabase
 │
 ├── Login ─────────────────► Supabase
 │                              │
 │                              ▼
 │                         Access Token
 │
 └── Protected Request
          │
          │ Authorization: Bearer <JWT>
          ▼
    Auth Middleware
          │
          ▼
    Supabase getUser()
          │
       ┌──┴──┐
       │     │
    Invalid  Valid
       │     │
      401    ▼
          req.user
             │
             ▼
       Protected Route
```

---

# Authentication

Supabase handles user authentication while the Express API handles the application routes and authentication middleware.

## Signup

Users can register through:

```text
POST /auth/signup
```

The endpoint expects:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Successful registration returns:

```text
201 Created
```

Missing email or password returns:

```text
400 Bad Request
```

---

## Login

Users can log in through:

```text
POST /auth/login
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Successful authentication returns:

```text
200 OK
```

with an access token and refresh token:

```json
{
  "access_token": "JWT...",
  "refresh_token": "..."
}
```

Invalid credentials return:

```text
401 Unauthorized
```

---

## JWT Authentication

Protected endpoints require an access token in the HTTP `Authorization` header:

```text
Authorization: Bearer <access_token>
```

The reusable `authMiddleware.js` middleware:

1. Checks that the Authorization header exists.
2. Extracts the Bearer token.
3. Sends the token to Supabase for verification.
4. Rejects invalid or expired tokens.
5. Attaches the verified user to `req.user`.
6. Allows the request to continue to the protected route.

This middleware is reused by all protected endpoints instead of duplicating authentication code.

---

# Environment Variables

Create a `.env` file using `.env.example` as a template.

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks

SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_publishable_or_anon_key
```

The Supabase key used by this project is the **publishable/anon key**, not the `service_role` key.

### Security

The real `.env` file contains secrets and must **never be committed to Git**.

The repository contains `.env.example` with placeholder values instead.

```text
.env          → local secrets, ignored by Git
.env.example  → safe template, committed to Git
```

---

# Running the Application

After cloning the repository:

```bash
git clone https://github.com/ashpokkk/CRUD_API.git
cd CRUD_API
```

Create your environment file:

```bash
cp .env.example .env
```

Add your own PostgreSQL and Supabase values to `.env`.

Start the complete application stack:

```bash
docker compose up -d
```

Check the running services:

```bash
docker compose ps
```

The API will be available at:

```text
http://localhost:3000
```

Swagger documentation:

```text
http://localhost:3000/docs
```

To stop the application:

```bash
docker compose down
```

---

# API Reference

| Method | Endpoint               | Description                         | Authentication |
| ------ | ---------------------- | ----------------------------------- | -------------- |
| GET    | `/`                    | API information                     | No             |
| GET    | `/health`              | Check API health                    | No             |
| GET    | `/public/info`         | Public information                  | No             |
| GET    | `/tasks`               | Retrieve all tasks                  | No             |
| GET    | `/tasks/:id`           | Retrieve a task by ID               | No             |
| POST   | `/tasks`               | Create a task                       | No             |
| PUT    | `/tasks/:id`           | Update a task                       | No             |
| DELETE | `/tasks/:id`           | Delete a task                       | No             |
| POST   | `/auth/signup`         | Register a user                     | No             |
| POST   | `/auth/login`          | Log in a user                       | No             |
| GET    | `/protected/profile`   | Retrieve authenticated user profile | **Yes**        |
| GET    | `/protected/dashboard` | Access protected dashboard          | **Yes**        |
| POST   | `/auth/logout`         | Log out authenticated user          | **Yes**        |

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

---

# HTTP Status Codes

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| 200    | Successful request                          |
| 201    | Resource successfully created               |
| 204    | Successful request with no response body    |
| 400    | Invalid or missing request data             |
| 401    | Missing, invalid, or expired authentication |
| 404    | Resource not found                          |

---

# Swagger UI

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

Swagger UI provides an interactive interface for viewing and testing the API.

Protected endpoints are marked with a **lock icon** and use the configured Bearer JWT security scheme.

The **Authorize** button allows an access token obtained from `/auth/login` to be entered once and reused when testing protected endpoints.

## Swagger Overview

![Swagger UI overview](./Swagger_auth.png)

## Swagger Bearer Authentication

![Swagger Authorize dialog](./swagger_get_dashboard.png)

## Protected Profile Request

![Swagger protected profile](./swagger_get_protected.png)

---

# Database

The application uses PostgreSQL for persistent task storage.

The database is named:

```text
tasks
```

The `tasks` table contains:

| Column       | Type               | Description            |
| ------------ | ------------------ | ---------------------- |
| `id`         | SERIAL PRIMARY KEY | Unique task ID         |
| `title`      | TEXT               | Task title             |
| `done`       | BOOLEAN            | Task completion status |
| `created_at` | TIMESTAMP          | Task creation time     |
| `updated_at` | TIMESTAMP          | Last update time       |

When the application starts, the repository:

1. Connects to PostgreSQL using `DATABASE_URL`.
2. Creates the `tasks` table if it does not exist.
3. Inserts three example tasks only when the table is empty.
4. Preserves existing data when the application restarts.

---

# PostgreSQL Persistence

PostgreSQL runs in Docker and uses a persistent Docker volume named:

```text
taskdata
```

The volume allows database data to survive when the containers are stopped and recreated.

For example:

```bash
docker compose down
docker compose up -d
```

Tasks created before the restart remain available.

---

# SQL and Repository

PostgreSQL database operations are kept inside the repository module.

The repository uses:

* `SELECT` for retrieving tasks
* `INSERT` for creating tasks
* `UPDATE` for modifying tasks
* `DELETE` for removing tasks

Queries use parameterized placeholders such as:

```text
$1
$2
$3
```

instead of directly inserting user input into SQL statements.

This helps prevent SQL injection.

---

# Project Structure

```text
CRUD/
│
├── server.js
├── supabase.js
├── authMiddleware.js
├── postgres.js
├── postgresRepository.js
├── swagger.js
│
├── Dockerfile
├── compose.yaml
├── init.sql
│
├── .env.example
├── .gitignore
├── .dockerignore
│
├── package.json
├── package-lock.json
│
├── README.md
│
├── Swagger_auth.png
├── swagger_get_protected.png
├── swagger_get_dashboard.png
│
└── tasks.db
```

---

# Security

The project follows several basic security practices:

* Supabase publishable/anon key is used instead of the `service_role` key.
* `.env` is excluded from Git.
* `.env.example` contains placeholders instead of secrets.
* Authentication tokens are verified through Supabase.
* Protected routes use reusable authentication middleware.
* SQL queries use parameterized values.
* Invalid or expired JWTs are rejected with `401 Unauthorized`.

---

# Repository

GitHub repository:

https://github.com/ashpokkk/CRUD_API

The repository contains the complete Node.js API, PostgreSQL/Docker setup, Supabase authentication integration, Swagger documentation, and staged development history.
