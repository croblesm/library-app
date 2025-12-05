#!/usr/bin/env python3
"""
Backfill Embeddings Script
---------------------------
This script generates embeddings for all books in the Library database
and populates the description_embedding VECTOR column in SQL Server 2025.

Since the books table doesn't have a description column, we use the
combination of title + category as the text to generate embeddings.

Prerequisites:
- SQL Server 2025 with VECTOR data type support
- books table with description_embedding VECTOR(768) column already added
- Vector index on description_embedding column (recommended for performance)
- Ollama running with nomic-embed-text model: ollama serve
"""

import os
import sys
from dotenv import load_dotenv
import mssql_python as mssql
from langchain_community.embeddings import OllamaEmbeddings

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
    Query all books from the database.

    Args:
        cursor: Database cursor for executing queries

    Returns:
        list: List of tuples containing (id, title, category)
    """
    print("🔄 Fetching books from database...")

    # Query books table for id, title, and category
    # We'll use title + category as the text to embed since there's no description column
    # Column names are lowercase to match the Sequelize schema
    query = """
        SELECT id, title, category
        FROM books
        WHERE title IS NOT NULL AND title != ''
        ORDER BY id
    """

    cursor.execute(query)
    books = cursor.fetchall()

    print(f"✅ Found {len(books)} books to process")
    return books

def generate_embedding(embeddings_model, title, category):
    """
    Generate embedding vector for the given book.

    Since the books table doesn't have a description column, we combine
    the title and category to create meaningful text for embedding.

    Args:
        embeddings_model: Initialized LangChain embeddings model
        title (str): Book title
        category (str): Book category/genre

    Returns:
        list: Embedding vector (list of floats)
    """
    # Combine title and category for a richer embedding
    # Example: "Foundation Science Fiction"
    text = f"{title} {category}" if category else title

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

def backfill_embeddings():
    """
    Main function to backfill embeddings for all books.

    Process:
    1. Connect to SQL Server
    2. Load embedding model
    3. Fetch all books with descriptions
    4. Generate embeddings for each book
    5. Update the VECTOR column in the database
    """
    print("=" * 60)
    print("📚 Library AI Embeddings Backfill Script")
    print("=" * 60)

    # Step 1: Get database connection
    conn = get_connection()
    cursor = conn.cursor()

    # Step 2: Initialize the embedding model
    embeddings_model = initialize_embedding_model()

    # Step 3: Fetch all books from database
    books = fetch_books(cursor)

    if not books:
        print("⚠️  No books found. Exiting.")
        cursor.close()
        conn.close()
        return

    # Step 4 & 5: Process each book - generate embedding and update database
    print(f"\n🔄 Processing {len(books)} books...")
    processed = 0
    failed = 0

    for book_id, title, category in books:
        try:
            # Generate embedding for the book (using title + category)
            print(f"  Processing Book ID {book_id}: {title[:50]}...")
            embedding = generate_embedding(embeddings_model, title, category)

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
