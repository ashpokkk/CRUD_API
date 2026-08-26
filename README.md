# Task API — CRUD API

A REST API built using **Node.js** and **Express.js** that manages a to-do task list.

This project demonstrates the four main CRUD operations:

- Create
- Read
- Update
- Delete

The API uses **PostgreSQL** for persistent data storage. PostgreSQL runs inside Docker, while **Docker Compose** manages the API and database together.

---

# Features

- RESTful API endpoints
- Create new tasks
- Retrieve all tasks
- Retrieve a single task by ID
- Update existing tasks
- Delete tasks
- PostgreSQL database persistence
- Dockerized PostgreSQL database
- Docker Compose for the complete application stack
- Automatic database and table creation
- Three seed tasks on the first run
- Request validation
- Proper HTTP status codes
- Parameterized SQL queries
- Interactive Swagger API documentation
- Persistent Docker volume for database data
- Environment-based database configuration

---

# Technologies Used

- Node.js
- Express.js
- PostgreSQL
- `pg`
- Docker
- Docker Compose
- Swagger UI Express
- Swagger JSDoc

---

# Architecture

The application consists of two Docker Compose services:

```text
Client
  │
  │ HTTP requests
  ▼
Node.js + Express API
  │
  │ DATABASE_URL
  ▼
PostgreSQL
  │
  ▼
Docker persistent volume




The API connects to PostgreSQL using the Docker Compose service name db.

Database

The application uses PostgreSQL with a database named:

tasks

The tasks table contains:

Column	Type	Description
id	SERIAL PRIMARY KEY	Unique task ID
title	TEXT	Task title
done	BOOLEAN	Task completion status
created_at	TIMESTAMP	Time the task was created
updated_at	TIMESTAMP	Time the task was last updated

When the application starts, the repository:

Connects to PostgreSQL using DATABASE_URL.
Creates the tasks table if it does not exist.
Inserts three example tasks only if the table is empty.

The seed tasks are only inserted when the table contains no tasks. Existing data is not replaced when the application restarts.

Environment Variables

Database configuration is provided through the DATABASE_URL environment variable.

Create a .env file using .env.example as a template:

DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks

The real .env file is ignored by Git and should not be committed.

When the application runs inside Docker Compose, the API uses:

postgres://postgres:dev@db:5432/tasks

The hostname is db because db is the PostgreSQL service name inside the Docker Compose network.

Running the Application

The complete application stack can be started with one command:

docker compose up -d

Check the services:

docker compose ps

The API will be available at:

http://localhost:3000

Swagger documentation is available at:

http://localhost:3000/docs

To stop the stack:

docker compose down
API Endpoints
Method	Endpoint	Description
GET	/	API information
GET	/health	Check API health
GET	/tasks	Retrieve all tasks
GET	/tasks/:id	Retrieve a single task
POST	/tasks	Create a new task
PUT	/tasks/:id	Update an existing task
DELETE	/tasks/:id	Delete a task
HTTP Status Codes
200 — Successful read/update
201 — Task successfully created
204 — Task successfully deleted
400 — Invalid request
404 — Task not found
Example Requests
Get all tasks
curl -i http://localhost:3000/tasks

Example response:

[
  {
    "id": 1,
    "title": "Read Quran",
    "done": true
  },
  {
    "id": 2,
    "title": "Push up day workout",
    "done": false
  },
  {
    "id": 3,
    "title": "Give fifi a bath",
    "done": false
  }
]
Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn PostgreSQL"}'
Update a task
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn PostgreSQL properly","done":true}'
Delete a task
curl -i -X DELETE http://localhost:3000/tasks/1
PostgreSQL Persistence

The PostgreSQL database uses a Docker volume named:

taskdata

The volume allows database data to survive when the containers are stopped and recreated.

For example:

docker compose down
docker compose up -d

Tasks created before the restart remain available after the application starts again.

This was tested by creating a task, stopping the entire Compose stack, starting it again, and confirming that the task was still present.

SQL and Repository

All PostgreSQL database operations are kept inside the repository module.

CRUD operations use SQL statements:

SELECT — retrieve tasks
INSERT — create tasks
UPDATE — modify tasks
DELETE — remove tasks

Queries use parameterized placeholders such as $1, $2, and $3 instead of directly inserting user input into SQL statements.

Swagger Documentation

Interactive API documentation is available through Swagger UI:

http://localhost:3000/docs

Swagger provides an interactive interface for viewing and testing the available API endpoints.

Database Evidence

PostgreSQL can be inspected directly inside the database container:

docker compose exec db psql -U postgres -d tasks

List the tables:

\dt

View the stored tasks:

SELECT * FROM tasks;

The database was verified to contain the tasks table and the seeded task data.

Project Structure
CRUD/
│
├── server.js
├── postgres.js
├── postgresRepository.js
├── swagger.js
├── Dockerfile
├── compose.yaml
├── init.sql
├── .env.example
├── .gitignore
├── .dockerignore
├── package.json
├── package-lock.json
├── README.md
├── image.png
└── database-screenshot.png
One-Command Setup

After cloning the repository:

git clone https://github.com/ashpokkk/CRUD_API.git
cd CRUD_API
cp .env.example .env
docker compose up -d

The API and PostgreSQL database will start together without requiring manual database setup.

Repository

GitHub repository:

https://github.com/ashpokkk/CRUD_API


### One small adjustment

I used:

```markdown
![PostgreSQL database screenshot](./PostgresSQL(Docker Desktop).png)