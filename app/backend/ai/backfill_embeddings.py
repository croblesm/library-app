#!/usr/bin/env python3
"""
Backfill Embeddings Script
---------------------------
This script generates embeddings for all books in the Library database
and populates the description_embedding VECTOR column in SQL Server 2025.

Since the books table doesn't have a description column, we use the
combination of title + category as the text to generate embeddings.

Prerequisites:
- SQL Server 2025 (or a SQL database in Microsoft Fabric) for the VECTOR type
- The books table, created by starting the backend and running the seeders

The description_embedding column and its index are created by this script if
they are missing, so there is nothing to set up by hand.
- Ollama running with nomic-embed-text model: ollama serve
"""

import os
import sys
from dotenv import load_dotenv
import mssql_python as mssql
from langchain_ollama import OllamaEmbeddings

# Load environment variables from .env file
# This reads the MSSQL_CONNECTION_STRING variable for database connectivity
load_dotenv()

def get_connection():
    """
    Establish connection to SQL Server using mssql-python driver.
    Reads connection string from environment variable.

    Returns:
        mssql.Connection: Active database connection
    """
    connection_string = os.getenv('MSSQL_CONNECTION_STRING')

    if not connection_string:
        print("❌ Error: MSSQL_CONNECTION_STRING not found in .env file")
        print("Please add your SQL Server connection string to .env:")
        print("MSSQL_CONNECTION_STRING=Server=your-server;Database=Library;...")
        sys.exit(1)

    try:
        # Connect using the mssql-python driver
        conn = mssql.connect(connection_string)
        print("✅ Successfully connected to SQL Server")
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)

def initialize_embedding_model():
    """
    Initialize the Ollama embedding model using LangChain.

    This uses the 'nomic-embed-text' model which generates 768-dimensional
    embeddings. The model runs locally via Ollama for simple management.

    To change the model:
    1. Pull a different Ollama model: ollama pull <model-name>
    2. Update the model parameter below
    3. Ensure the output dimension matches your VECTOR column size (768)
    4. If using a different dimension, update the Books table schema

    Returns:
        OllamaEmbeddings: Initialized embedding model
    """
    print("🔄 Initializing Ollama embedding model...")

    # Initialize Ollama embeddings
    # Ollama must be running: ollama serve
    # Model produces 768-dimensional vectors
    embeddings = OllamaEmbeddings(
        model="nomic-embed-text",
        base_url="http://localhost:11434"
    )

    print("✅ Embedding model loaded successfully")
    return embeddings

def fetch_books(cursor):
    """
    Query all books from the database with author information.

    Args:
        cursor: Database cursor for executing queries

    Returns:
        list: List of tuples containing (id, title, category, year, author_name)
    """
    print("🔄 Fetching books from database...")

    # Query books with author names via the junction table
    # This allows embedding to include author for author-based searches
    query = """
        SELECT b.id, b.title, b.category, b.year,
               CONCAT(a.first_name, ' ', a.last_name) as author_name
        FROM books b
        LEFT JOIN books_authors ba ON b.id = ba.book_id
        LEFT JOIN authors a ON ba.author_id = a.id
        WHERE b.title IS NOT NULL AND b.title != ''
        ORDER BY b.id
    """

    cursor.execute(query)
    books = cursor.fetchall()

    print(f"✅ Found {len(books)} books to process")
    return books

def generate_embedding(embeddings_model, title, category, year=None, author=None):
    """
    Generate embedding vector for the given book.

    Combines title, author, category, and year to create meaningful text for embedding.
    This allows semantic search to match on:
    - Title searches: "Foundation"
    - Author searches: "Isaac Asimov books"
    - Category searches: "science fiction"
    - Era searches: "books from 1950s"

    Args:
        embeddings_model: Initialized LangChain embeddings model
        title (str): Book title
        category (str): Book category/genre
        year (int): Publication year
        author (str): Author name

    Returns:
        list: Embedding vector (list of floats)
    """
    # Build structured text with all available metadata
    # Example: "Book: Foundation, Author: Isaac Asimov, Category: Science Fiction, Year: 1951"
    parts = [f"Book: {title}"]
    
    if author:
        parts.append(f"Author: {author}")
    
    if category:
        parts.append(f"Category: {category}")
    
    if year:
        parts.append(f"Year: {year}")
    
    text = ", ".join(parts)
    
    # Use LangChain to generate embedding
    # The embed_query method returns a list of floats representing the vector
    embedding = embeddings_model.embed_query(text)
    return embedding

def update_book_embedding(cursor, book_id, embedding_vector):
    """
    Update the description_embedding column for a specific book.

    Args:
        cursor: Database cursor for executing queries
        book_id (int): The book's primary key
        embedding_vector (list): The embedding vector to store
    """
    # Convert the embedding list to a SQL-compatible format
    # SQL Server 2025 VECTOR type expects a JSON array format
    vector_str = f"[{','.join(map(str, embedding_vector))}]"

    # Update the VECTOR column in SQL Server 2025
    # CAST the JSON array string to VECTOR(768) data type
    # Column names are lowercase to match the Sequelize schema
    update_query = """
        UPDATE books
        SET description_embedding = CAST(? AS VECTOR(768))
        WHERE id = ?
    """

    cursor.execute(update_query, (vector_str, book_id))

def ensure_embedding_column(cursor, dimensions=768):
    """
    Create the VECTOR column and its index if they are not already there.

    This lives here rather than in the README because this script is the only
    thing that needs the column, it is already connected to the database, and a
    setup step that exists only as SQL to copy and paste is a step that gets
    skipped. The statement is guarded, so re-running is harmless.

    Only the column is created, deliberately not a vector index. On SQL Server
    2025 a vector index makes the whole table read-only:

        Msg 42231: Data modification statement failed because table 'books'
        has a vector index on it.

    which breaks POST /books. VECTOR_DISTANCE works without an index, just as an
    exact scan, so the index is left as an opt-in step documented in the README.

    Requires SQL Server 2025 or a SQL database in Microsoft Fabric, which is
    where the VECTOR type was introduced.
    """
    # Interpolated, not parameterised: a column type is part of the DDL and
    # cannot be a bind parameter. `dimensions` is an int argument, never input.
    cursor.execute(f"""
        IF COL_LENGTH('dbo.books', 'description_embedding') IS NULL
            ALTER TABLE dbo.books ADD description_embedding VECTOR({int(dimensions)}) NULL;
    """)

    cursor.commit()
    print(f"✅ description_embedding VECTOR({dimensions}) column ready")


def backfill_embeddings():
    """
    Main function to backfill embeddings for all books.

    Process:
    1. Connect to SQL Server
    2. Make sure the VECTOR column exists
    3. Load embedding model
    4. Fetch all books with descriptions
    5. Generate embeddings for each book
    6. Update the VECTOR column in the database
    """
    print("=" * 60)
    print("📚 Library AI Embeddings Backfill Script")
    print("=" * 60)

    # Step 1: Get database connection
    conn = get_connection()
    cursor = conn.cursor()

    # Step 2: Make sure the column this script writes to actually exists
    ensure_embedding_column(cursor)

    # Step 3: Initialize the embedding model
    embeddings_model = initialize_embedding_model()

    # Step 4: Fetch all books from database
    books = fetch_books(cursor)

    if not books:
        print("⚠️  No books found. Exiting.")
        cursor.close()
        conn.close()
        return

    # Step 5 & 6: Process each book - generate embedding and update database
    print(f"\n🔄 Processing {len(books)} books...")
    processed = 0
    failed = 0

    for book_id, title, category, year, author in books:
        try:
            # Generate embedding for the book (using title + author + category + year)
            print(f"  Processing Book ID {book_id}: {title[:50]} by {author or 'Unknown'}...")
            embedding = generate_embedding(embeddings_model, title, category, year, author)

            # Update the database with the embedding vector
            update_book_embedding(cursor, book_id, embedding)

            processed += 1

            # Commit after each book to avoid losing progress
            conn.commit()

        except Exception as e:
            print(f"  ❌ Error processing Book ID {book_id}: {e}")
            failed += 1
            # Continue processing other books even if one fails
            continue

    # Final summary
    print("\n" + "=" * 60)
    print(f"✅ Backfill complete!")
    print(f"   Processed: {processed} books")
    print(f"   Failed: {failed} books")
    print("=" * 60)

    # Clean up
    cursor.close()
    conn.close()

if __name__ == "__main__":
    backfill_embeddings()
