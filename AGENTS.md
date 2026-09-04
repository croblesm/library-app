# AGENTS.md

> Cross-platform AI agent instructions for the Library App project.
> Supported by: OpenAI Codex, Claude Code, Cline, Windsurf, Gemini CLI, Aider, and others.

---

## Project Identity

This is a **Library Management App** built with Node.js, Express, Sequelize, and React. It uses SQL Server as its database. The app manages books, authors, and their relationships. It is used for demos and presentations, so it must look polished and run reliably.

---

## Mandatory Technology Constraints

**These constraints are non-negotiable. Do NOT substitute alternative technologies.**

### Database: SQL Server

- **Always use SQL Server.** Never suggest PostgreSQL, MySQL, SQLite, MongoDB, or any other database.
- SQL Server runs locally via Docker (created through the MSSQL extension for VS Code) or on Microsoft Fabric.
- Use `NVARCHAR` for string columns (not VARCHAR or TEXT).
- Use `TOP N` instead of `LIMIT N` in queries.
- Default port: 1433.

### Backend: Node.js + Express + Sequelize

- Backend is Node.js with Express 4.19 and Sequelize 6.37 ORM.
- Do NOT suggest switching to Prisma, Drizzle, TypeORM, Knex, or raw SQL for the Node.js layer.
- Sequelize uses the `tedious` driver for SQL Server connectivity.

### Frontend: React + MUI, built with Vite

- Frontend is React 18 with Material UI (MUI) v7, bundled by Vite 7.
- There is no Tailwind. Style with MUI `sx` props and the theme.
- JSX lives in `.jsx` files; Vite does not parse JSX from `.js`.
- Do NOT suggest switching to Next.js, Vue, Angular, Svelte, or other frameworks.
- All UI lives in a single `ModernApp.jsx` component (intentional for demo simplicity).

### Infrastructure: Terraform (optional)

- Microsoft Fabric provisioning uses Terraform with the `microsoft/fabric` provider.
- Fabric authentication uses Microsoft Entra ID via `@azure/identity`.

---

## Code Conventions

### Database Naming

- All table and column names are **lowercase**: `books`, `authors`, `books_authors`, `first_name`, `book_id`.
- Sequelize `underscored: true` convention -- use snake_case for all database identifiers.
- No timestamps: all models have `timestamps: false` (no `createdAt`/`updatedAt` columns).

### Sequelize Models

- Models use an async init pattern: `async function initBookModel(sequelize)` returning the model.
- Models are stored on `global.models` after initialization in `index.js`.
- Routes access models via `global.models` (e.g., `const { Book, Author } = global.models;`).
- Many-to-many: `books` <-> `authors` through `books_authors` junction table with cascade delete.

### Environment Variables

- **Never hardcode passwords or connection strings** in source code or documentation.
- Use `.env.example` templates with placeholder values like `<your-password>`.
- Both services ship a template:

```bash
cp app/backend/config/.env.example app/backend/config/.env
cp app/backend/ai/.env.example    app/backend/ai/.env
```

**Node.js backend** (`app/backend/config/.env`), local SQL Server:

```
DB_SERVER=<your-server,your-port>
DB_USER=<your-username>
DB_PASSWORD=<your-password>
DB_DATABASE=<your-database>
```

For a SQL database in Microsoft Fabric, set a connection string instead. Fabric
supports Microsoft Entra ID only, so there is no username or password:

```
DB_CONNECTION_STRING=mssql://<server>.database.fabric.microsoft.com:1433/<db>?encrypt=true&trustServerCertificate=false
```

**Python AI service** (`app/backend/ai/.env`). Note the ADO.NET-style keys:
`UID` and `PWD`, not `User Id` and `Password`.

```
MSSQL_CONNECTION_STRING=Server=<your-server>;Database=<your-database>;UID=<your-username>;PWD=<your-password>;TrustServerCertificate=yes;

# Optional, defaults shown:
# OLLAMA_BASE_URL=http://localhost:11434
# EMBEDDING_MODEL=nomic-embed-text
# LLM_MODEL=llama3.2:3b
# LLM_TEMPERATURE=0.1
# LLM_NUM_PREDICT=150
```

---

## Project Structure

```
library-app/
├── app/
│   ├── backend/                        # Node.js/Express API server (port 3000)
│   │   ├── config/                     # Database configuration
│   │   │   ├── db.js                   # Async Sequelize initializer
│   │   │   ├── config.js               # Sequelize CLI config
│   │   │   ├── .env.example            # Template for backend config
│   │   │   └── .env                    # Backend credentials (git-ignored)
│   │   ├── models/                     # Sequelize ORM models
│   │   ├── routes/                     # Express route handlers
│   │   ├── seeders/                    # Sequelize seeders (29 authors, ~200 books)
│   │   ├── scripts/                    # Utility scripts
│   │   ├── index.jsx                   # Express entry point
│   │   └── package.json
│   └── frontend/
│       └── library-frontend/           # React SPA (port 3001)
│           ├── src/
│           │   ├── ModernApp.jsx        # Main app component
│           │   └── index.jsx           # Entry point
│           └── package.json
├── docs/                               # Documentation
│   ├── PRD.md                          # Product Requirements Document
│   └── demos/                          # Step-by-step demo walkthroughs
├── infrastructure/                     # Terraform for Microsoft Fabric
└── README.md                           # Setup and usage guide
```

---

## Database Schema

```
books
  id (PK, INT, auto-increment)
  title (NVARCHAR)
  year (INT)
  pages (INT)
  image_url (NVARCHAR)
  category (NVARCHAR)

authors
  id (PK, INT, auto-increment)
  first_name (NVARCHAR)
  middle_name (NVARCHAR, nullable)
  last_name (NVARCHAR)
  image_url (NVARCHAR, nullable)

books_authors
  author_id (FK -> authors.id, cascade)
  book_id (FK -> books.id, cascade)
  (composite primary key)
```

---

## Common Commands

```bash
# Backend
cd app/backend && npm install
cd app/backend && npm start                       # Port 3000
cd app/backend && npx sequelize-cli db:create     # Create database
cd app/backend && npx sequelize-cli db:seed:all   # Seed 29 authors + ~200 books

# Frontend
cd app/frontend/library-frontend && npm install
cd app/frontend/library-frontend && npm start     # Port 3001

# Database Reset
cd app/backend && node ./scripts/dropAllTables.js
```

---

## What NOT to Do

1. Do NOT switch the database to PostgreSQL, MySQL, SQLite, or MongoDB.
2. Do NOT suggest switching from Sequelize to another ORM.
3. Do NOT add `createdAt`/`updatedAt` timestamps to models.
4. Do NOT rename database columns to camelCase -- everything is lowercase snake_case.
5. Do NOT hardcode passwords or secrets in code or documentation.
6. Do NOT create or modify files in the `.demo/` directory.
