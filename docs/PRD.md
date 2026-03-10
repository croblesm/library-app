# Library App - Product Requirements Document

## Overview

A library management application for tracking books, authors, and their relationships. The app provides a polished, modern UI for browsing and managing a curated collection of classic and science fiction literature.

This application is designed to run inside Dev Containers for quick setup and uses SQL Server as its database backend.

## Goals

1. Manage a collection of books with metadata (title, year, pages, category, cover image URL)
2. Manage authors with name fields (first, middle, last) and optional profile photo URL
3. Track many-to-many relationships between books and authors
4. Provide a modern, dark-themed UI for browsing, searching, and filtering the collection
5. Support seed data for demos and presentations

## User Stories

### Book Management
- As a user, I can browse all books on the home page with filtering by publication year, page count, and genre
- As a user, I can search books by title or category
- As a user, I can paginate through the book collection (10, 20, or 50 per page)
- As a user, I can add a new book with title, year, pages, image URL, category, and author assignment
- As a user, I can delete a book from the collection
- As a user, I can sort books by title, newest first, oldest first, or most pages

### Author Management
- As a user, I can browse all authors with profile photos and see how many books each has written
- As a user, I can search authors by name
- As a user, I can add a new author with first name, optional middle name, last name, and optional profile image URL
- As a user, I can delete an author from the system

### General
- As a user, I can navigate between Home, Books, and Authors pages
- As a user, I see book cover images when available, with a graceful fallback when not

## Technical Requirements

### Database
- **SQL Server** as the only supported database engine
- Three tables: `books`, `authors`, `books_authors` (junction table)
- All table and column names use **lowercase snake_case**
- No timestamp columns (no createdAt/updatedAt)
- Many-to-many relationship between books and authors with cascade delete

### Backend
- **Node.js** with **Express** web framework
- **Sequelize 6** ORM with the `tedious` driver for SQL Server
- RESTful API with endpoints for books, authors, and book-author associations
- Models use async initialization pattern: `async function initBookModel(sequelize)`
- Models accessed globally via `global.models`

### Frontend
- **React 18** single-page application
- **Material UI (MUI) v7** for component library
- **Tailwind CSS v4** available for utility classes
- Dark theme with near-black background (#0a0a0a)
- Card-based layouts with hover animations
- **axios** for API calls to the backend

### Environment
- Dev Container support for quick onboarding
- Environment variables for database credentials (never hardcoded)
- `.env.example` templates provided

## Data Model

```
books
  id          INT (PK, auto-increment)
  title       NVARCHAR
  year        INT
  pages       INT
  image_url   NVARCHAR
  category    NVARCHAR

authors
  id          INT (PK, auto-increment)
  first_name  NVARCHAR
  middle_name NVARCHAR (nullable)
  last_name   NVARCHAR
  image_url   NVARCHAR (nullable)

books_authors
  author_id   INT (FK -> authors.id, cascade delete)
  book_id     INT (FK -> books.id, cascade delete)
  (composite primary key)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /books | List all books with their authors |
| POST | /books | Create a new book |
| PUT | /books/:id | Update a book |
| DELETE | /books/:id | Delete a book and its associations |
| GET | /authors | List all authors with their books |
| POST | /authors | Create a new author |
| DELETE | /authors/:id | Delete an author |
| GET | /books_authors | List all associations |
| POST | /books_authors | Create a book-author association |
| DELETE | /books_authors | Remove a book-author association |

## Seed Data

- **29 authors** including Isaac Asimov, Arthur C. Clarke, Philip K. Dick, H.G. Wells, Jules Verne, Frank Herbert, J.R.R. Tolkien, and more -- each with a Wikipedia profile photo
- **~200 books** across 16 categories: Science Fiction, Classic Science Fiction, Hard Science Fiction, Dystopian Science Fiction, Alternate History, Adventure, Cyberpunk, Fantasy, Epic Fantasy, Techno-Thriller, Non-Fiction, Satire, Post-Apocalyptic, Military Science Fiction, Young Adult, Horror

## Non-Goals

- User authentication or authorization
- File uploads for book covers (URLs only)
- Full-text search (basic string matching is sufficient)
- Internationalization
- Mobile-specific layouts (responsive web only)
- Offline support
