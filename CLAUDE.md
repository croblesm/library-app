# CLAUDE.md

## Project Overview

Library App -- a GitHub Copilot demo application for live presentations. Showcases SQL Server 2025's native VECTOR data type, Node.js/Express backend, React frontend, Python RAG service, and Terraform for Microsoft Fabric. This is NOT a production app; it is a demo vehicle that must look polished and run reliably.

## Tech Stack

| Layer | Technology | Port |
|-------|-----------|------|
| Backend | Node.js, Express 4.19, Sequelize 6.37, tedious/mssql | 3000 |
| Frontend | React 18.3, MUI v7, Tailwind CSS v4, axios, react-router-dom v6 | 3001 |
| AI/RAG Service | Python, FastAPI, LangChain, Ollama | 8000 |
| Database | SQL Server 2025 (Docker or Microsoft Fabric) | 1433 |
| Embeddings | nomic-embed-text via Ollama (768-dimensional) | -- |
| LLM | llama3.2:3b via Ollama | -- |
| Infrastructure | Terraform with Microsoft Fabric provider | -- |
| Auth | Microsoft Entra ID (Fabric mode only, via @azure/identity) | -- |

## Directory Structure

```
app/backend/                  Express API server (entry: index.js)
app/backend/ai/               Python AI services
  chat_service.py             FastAPI RAG service (semantic search + LLM responses)
  backfill_embeddings.py      Embedding generation script for all books
  requirements.txt            Python dependencies
  .env                        Python config (MSSQL_CONNECTION_STRING)
  .env.example                Template for .env
app/backend/config/           Database configuration
  db.js                       Async Sequelize initializer (supports Fabric + local)
  config.js                   Sequelize CLI config
  .env                        Backend DB credentials
  .env.example                Template for .env
app/backend/models/           Sequelize models
  book.model.js               Book model (many-to-many with Author)
  author.model.js             Author model (many-to-many with Book)
  books_authors.model.js      Junction table model
  initModels.js               Registers all models and associations
app/backend/routes/           Express route handlers
  Book.js                     /books endpoints
  Author.js                   /authors endpoints
  BooksAuthors.js             /books_authors endpoints
app/backend/seeders/          Sequelize seeders (5 authors, 24 books)
app/backend/scripts/          Utility scripts (dropAllTables.js, SQL files)
app/frontend/library-frontend/  React SPA
  src/ModernApp.js            Main component (all UI in one file)
  src/index.js                Entry point
infrastructure/               Terraform for Microsoft Fabric provisioning
```

## Key Conventions

- All database table and column names are **lowercase** (Sequelize convention): `books`, `authors`, `books_authors`, `first_name`, `book_id`
- Models use async init pattern: `async function initBookModel(sequelize)` returning the model
- Models are stored on `global.models` after initialization in index.js
- Routes access models via `global.models` (e.g., `const { Book, Author } = global.models;`)
- All models have `timestamps: false` -- no createdAt/updatedAt columns
- Many-to-many: books <-> authors through books_authors junction table with cascade delete
- Vector embeddings: 768-dimensional via Ollama nomic-embed-text
- Embedding text format: `"Book: {title}, Author: {author}, Category: {category}, Year: {year}"`
- RAG pattern: embed user question -> vector similarity search in SQL Server -> format context -> LLM generates response
- Hallucination guardrails: system prompt + response validation + low temperature (0.1)

## Environment Files

Both services have `.env.example` templates. Copy and fill in your credentials:
```bash
cp app/backend/config/.env.example app/backend/config/.env
cp app/backend/ai/.env.example app/backend/ai/.env
```

### Backend (app/backend/config/.env)

For local SQL Server:
```
DB_SERVER=<your-server,your-port>
DB_USER=<your-username>
DB_PASSWORD=<your-password>
DB_DATABASE=<your-database>
```

For Microsoft Fabric:
```
DB_CONNECTION_STRING=mssql://<server>.msit-database.fabric.microsoft.com:1433/<db>?encrypt=true&trustServerCertificate=false
```

### Python AI Service (app/backend/ai/.env)

```
MSSQL_CONNECTION_STRING=Server=<your-server>;Database=<your-database>;UID=<your-username>;PWD=<your-password>;TrustServerCertificate=yes;
```

Note: The Python service uses ADO.NET-style connection strings with `UID`/`PWD`, NOT `User Id`/`Password`.

## Common Commands

```bash
# Backend
cd app/backend && npm install
cd app/backend && npm start                       # Port 3000
cd app/backend && npx sequelize-cli db:seed:all   # Seed 5 authors + 24 books

# Frontend
cd app/frontend/library-frontend && npm install
cd app/frontend/library-frontend && npm start     # Port 3001

# Python AI Service
cd app/backend/ai && pip install -r requirements.txt
ollama serve                                      # Keep running in background
ollama pull nomic-embed-text && ollama pull llama3.2:3b
cd app/backend/ai && python backfill_embeddings.py   # Generate embeddings
cd app/backend/ai && python chat_service.py          # Port 8000

# Database Reset
cd app/backend && node ./scripts/dropAllTables.js
```

## API Endpoints

### Backend REST API (port 3000)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | /books | List books with authors | ?search=keyword (optional) |
| POST | /books | Create book | { title, year, pages, image_url, category, authorId } |
| PUT | /books/:id | Update book | { title, year, pages, image_url, category } |
| DELETE | /books/:id | Delete book + associations | -- |
| GET | /authors | List authors with books | -- |
| POST | /authors | Create author | { first_name, middle_name, last_name } |
| DELETE | /authors/:id | Delete author | -- |
| GET | /books_authors | List all associations | -- |
| POST | /books_authors | Create association | { book_id, author_id } |
| DELETE | /books_authors | Delete association | { book_id, author_id } |

### AI Chat Service (port 8000)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | /chat | RAG semantic search + LLM response | { question, conversation_history? } |
| GET | / | Service info | -- |
| GET | /health | Health check (verifies DB) | -- |
| GET | /docs | Swagger UI | -- |

## Database Schema

```
books
  id (PK, INT, auto-increment)
  title (NVARCHAR)
  year (INT)
  pages (INT)
  image_url (NVARCHAR)
  category (NVARCHAR)
  description_embedding (VECTOR(768), nullable)

authors
  id (PK, INT, auto-increment)
  first_name (NVARCHAR)
  middle_name (NVARCHAR, nullable)
  last_name (NVARCHAR)

books_authors
  author_id (FK -> authors.id, cascade)
  book_id (FK -> books.id, cascade)
  (composite primary key)
```

## Seed Data

5 authors: Isaac Asimov, Arthur C. Clarke, H.G. Wells, Jules Verne, Philip K. Dick
24 books across categories: Science Fiction, Classic Science Fiction, Adventure, Dystopian Science Fiction, Alternate History

## Cross-Platform AI Agent Instructions

This project includes instruction files for multiple AI coding agents:

| File | Agent(s) |
|------|----------|
| `CLAUDE.md` | Claude Code |
| `AGENTS.md` | Codex, Cline, Windsurf, Gemini CLI, Aider, and others |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.cursorrules` | Cursor |

All files enforce the same constraints: SQL Server only, Sequelize conventions, mssql_python driver, Ollama local models, 768-dimensional vectors, lowercase snake_case naming.
