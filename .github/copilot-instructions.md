# GitHub Copilot Custom Instructions

## Project Context

This is a Library Management App built with Node.js, Express, Sequelize, and React. It uses SQL Server as its database. The app manages books, authors, and their many-to-many relationships. It is used for demos and presentations.

## Technology Constraints

When generating code for this project, always follow these rules:

### Database: SQL Server Only

- Always use **SQL Server** syntax and features. Never generate PostgreSQL, MySQL, or SQLite code.
- Use `NVARCHAR` for string columns (not VARCHAR or TEXT).
- Use `TOP N` instead of `LIMIT N` in queries.

### Node.js Backend

- Use **Sequelize 6** ORM with the `tedious` driver. Do not suggest Prisma, Drizzle, or TypeORM.
- All table/column names are **lowercase snake_case**: `books`, `authors`, `books_authors`, `first_name`, `book_id`.
- Models use `timestamps: false` -- no `createdAt`/`updatedAt`.
- Models use async init: `async function initBookModel(sequelize)`.
- Models are accessed via `global.models` (e.g., `const { Book, Author } = global.models;`).
- Many-to-many relationship: `books` <-> `authors` through `books_authors` with cascade delete.

### React Frontend

- Use **React 18** with **MUI v7** and **Tailwind CSS v4**.
- The main UI is in `app/frontend/library-frontend/src/ModernApp.js`.
- API calls use `axios` to `http://localhost:3000` (backend).

### Environment Variables

- Never hardcode passwords or connection strings.
- Node.js backend config: `app/backend/config/.env` (separate vars: `DB_SERVER`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`).
- Use `.env.example` templates with placeholder values.

## Key File Locations

| Purpose | Path |
|---------|------|
| Express entry point | `app/backend/index.js` |
| Sequelize models | `app/backend/models/` |
| Express routes | `app/backend/routes/` |
| Database config | `app/backend/config/db.js` |
| React app | `app/frontend/library-frontend/src/ModernApp.js` |
| Seeders | `app/backend/seeders/` |

## Do NOT

- Switch the database away from SQL Server
- Add timestamps to Sequelize models
- Use camelCase for database column names
- Create or modify files in the `.demo/` directory
