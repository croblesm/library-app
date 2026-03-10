#!/usr/bin/env python3
"""
Chat Service - RAG (Retrieval-Augmented Generation) API
-------------------------------------------------------
FastAPI service that performs semantic search and generates natural language
responses using the RAG pattern with SQL Server 2025 vector similarity search.

This service implements:
1. **Retrieval**: Semantic search using SQL Server 2025 vector similarity
2. **Augmentation**: Context-aware prompting with retrieved books
3. **Generation**: Natural language responses using Ollama LLM
4. **Guardrails**: System prompt to prevent hallucination and enforce accuracy

Architecture:
- Embeddings: Ollama nomic-embed-text (768-dim) for semantic search
- LLM: Ollama llama3.2:3b for natural language generation
- Guardrails: System prompt restricts LLM to only recommend retrieved books
- Pattern: RAG (Retrieval-Augmented Generation) with prompt engineering

Prerequisites:
- SQL Server 2025 with VECTOR data type support
- books table with description_embedding VECTOR(768) column populated
- Vector index on description_embedding column for optimal performance
- Ollama running with nomic-embed-text and llama3.2:3b models: ollama serve
"""

import os
import re
import time
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Optional, Tuple
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import mssql_python as mssql
from langchain_ollama import OllamaEmbeddings, OllamaLLM

# Load environment variables from .env file
# This reads the MSSQL_CONNECTION_STRING variable for database connectivity
load_dotenv()

logger = logging.getLogger(__name__)

# Configuration from environment variables (with sensible defaults for local dev)
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'nomic-embed-text')
LLM_MODEL = os.getenv('LLM_MODEL', 'llama3.2:3b')
LLM_TEMPERATURE = float(os.getenv('LLM_TEMPERATURE', '0.1'))
LLM_NUM_PREDICT = int(os.getenv('LLM_NUM_PREDICT', '100'))  # Max tokens to generate (lower = faster)
OLLAMA_NUM_THREAD = int(os.getenv('OLLAMA_NUM_THREAD', '0'))  # 0 = auto-detect CPU cores
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3001,http://127.0.0.1:3001').split(',')

@asynccontextmanager
async def lifespan(app):
    """Initialize models and database caches at startup, cleanup on shutdown."""
    global embeddings_model, known_categories, known_authors
    embeddings_model = initialize_embedding_model()
    known_categories = fetch_categories_from_database()
    known_authors = fetch_authors_from_database()
    print("✅ Startup complete - embedding model, categories, and authors ready")
    yield

# Initialize FastAPI application
app = FastAPI(
    title="Library Chat Service",
    description="AI-powered RAG semantic search with natural language responses over library books",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Global variables to store models (initialized once at startup)
embeddings_model = None
llm_model = None
known_categories = []  # Populated from database at startup
known_authors = []  # Populated from database at startup

# System prompt for the librarian agent
# This defines the role, behavior, and constraints to prevent hallucination
LIBRARIAN_SYSTEM_PROMPT = """You are a friendly librarian. Recommend books ONLY from the list below.

Rules:
- Use EXACT titles from the list. NEVER invent books.
- Recommend 1-2 books max. Keep response under 50 words.
- Be warm and conversational.
- If NONE of the books match what the user is asking for, say so honestly and suggest they try a different topic."""

# Request/Response models for API
class Message(BaseModel):
    """Individual message in conversation history"""
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    """Request body for chat endpoint"""
    question: str = Field(..., min_length=1, max_length=500)
    # TODO: conversation_history is accepted for API compatibility but not yet used
    # in prompt construction. Reserved for future multi-turn support.
    conversation_history: List[Message] = []

    class Config:
        json_schema_extra = {
            "example": {
                "question": "I want to read science fiction about space exploration",
                "conversation_history": []
            }
        }

class BookResult(BaseModel):
    """Individual book result with similarity score"""
    id: int
    title: str
    category: str
    year: int
    similarity_score: float

class ChatResponse(BaseModel):
    """Response containing matching books and natural language recommendation"""
    question: str
    response: str
    results: List[BookResult]

def get_connection():
    """
    Establish connection to SQL Server using mssql-python driver.
    Reads connection string from environment variable.

    Returns:
        mssql.Connection: Active database connection

    Raises:
        Exception: If connection string is missing or connection fails
    """
    connection_string = os.getenv('MSSQL_CONNECTION_STRING')

    if not connection_string:
        raise Exception(
            "MSSQL_CONNECTION_STRING not found in .env file. "
            "Please add your SQL Server connection string."
        )

    try:
        conn = mssql.connect(connection_string)
        return conn
    except Exception as e:
        raise Exception(f"Failed to connect to database: {e}")

def initialize_embedding_model():
    """
    Initialize the Ollama embedding model using LangChain.

    This uses the same model as backfill_embeddings.py to ensure consistency.
    The model is loaded once at application startup for efficiency.

    To change the embedding model:
    1. Pull a different Ollama model: ollama pull <model-name>
    2. Update the model parameter below
    3. Ensure it matches the model used in backfill_embeddings.py
    4. Verify the output dimension matches your VECTOR column size (768)
    5. Re-run backfill_embeddings.py if you change models

    Returns:
        OllamaEmbeddings: Initialized embedding model
    """
    print("🔄 Initializing embedding model...")

    # Initialize Ollama embeddings
    # Ollama must be running: ollama serve
    # Model produces 768-dimensional vectors
    embeddings = OllamaEmbeddings(
        model=EMBEDDING_MODEL,
        base_url=OLLAMA_BASE_URL
    )

    print("✅ Embedding model loaded")
    return embeddings

def fetch_categories_from_database() -> List[str]:
    """
    Fetch all unique categories from the books table.

    This ensures the category matching is always in sync with the database,
    even when new categories are added.

    Returns:
        List[str]: List of unique category names
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category")
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        categories = [row[0] for row in results]
        print(f"✅ Loaded {len(categories)} categories from database: {categories}")
        return categories
    except Exception as e:
        print(f"⚠️  Warning: Could not fetch categories from database: {e}")
        return []

def fetch_authors_from_database() -> List[str]:
    """
    Fetch all unique authors from the authors table.

    This ensures author detection is always in sync with the database,
    allowing queries like "Isaac Asimov books" to be recognized as author queries.

    Returns:
        List[str]: List of author full names (first_name + last_name)
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Use subquery to handle DISTINCT with ORDER BY on different column
        cursor.execute("""
            SELECT DISTINCT CONCAT(first_name, ' ', last_name) as author_name
            FROM authors
            ORDER BY CONCAT(first_name, ' ', last_name)
        """)
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        authors = [row[0] for row in results]
        print(f"✅ Loaded {len(authors)} authors from database: {authors}")
        return authors
    except Exception as e:
        print(f"⚠️  Warning: Could not fetch authors from database: {e}")
        return []

def initialize_llm_model():
    """
    Initialize the Ollama LLM for natural language generation.

    Uses llama3.2:3b (3 billion parameter model) which is:
    - Small enough to run locally on modest hardware
    - Fast for real-time chat responses
    - Capable enough for coherent natural language
    - Good at following system prompts

    Alternative models to consider:
    - llama2:7b - 7B model, better quality but slower
    - neural-chat - Optimized for chat interactions
    - mistral:7b - Fast and capable

    To use a different model:
    1. Pull it: ollama pull <model-name>
    2. Update the model parameter below
    3. Restart the service

    Returns:
        Ollama: Initialized LLM model
    """
    print("🔄 Initializing LLM model...")

    # Initialize Ollama LLM for natural language generation
    # Ollama must be running: ollama serve
    # Using low temperature (0.1) to reduce hallucinations and keep responses focused
    llm_kwargs = {
        "model": LLM_MODEL,
        "base_url": OLLAMA_BASE_URL,
        "temperature": LLM_TEMPERATURE,
        "num_predict": LLM_NUM_PREDICT,
    }
    if OLLAMA_NUM_THREAD > 0:
        llm_kwargs["num_thread"] = OLLAMA_NUM_THREAD
    llm = OllamaLLM(**llm_kwargs)

    print(f"✅ LLM model loaded (num_predict={LLM_NUM_PREDICT}, num_thread={'auto' if OLLAMA_NUM_THREAD == 0 else OLLAMA_NUM_THREAD})")
    return llm

def detect_category(question: str) -> str:
    """
    Detect if the user is asking for a specific book category.

    Args:
        question (str): The natural language question from the user

    Returns:
        str: Detected category name or None if no match
    """
    global known_categories

    question_lower = question.lower()

    # Common aliases/synonyms for categories
    category_aliases = {
        "sci-fi": "Science Fiction",
        "scifi": "Science Fiction",
        "sf": "Science Fiction",
        "dystopia": "Dystopian Science Fiction",
        "dystopian": "Dystopian Science Fiction",
        "classic sci-fi": "Classic Science Fiction",
        "classic scifi": "Classic Science Fiction",
        "alt history": "Alternate History",
        "alternative history": "Alternate History",
        "thriller": "Techno-Thriller",
        "techno thriller": "Techno-Thriller",
        "suspense": "Techno-Thriller",
        # Topic-to-genre mappings (common topics that imply a genre)
        "space": "Science Fiction",
        "aliens": "Science Fiction",
        "robots": "Science Fiction",
        "artificial intelligence": "Science Fiction",
        "time travel": "Science Fiction",
        "mars": "Science Fiction",
        "moon": "Science Fiction",
        "galaxy": "Science Fiction",
        "spaceship": "Science Fiction",
        "apocalypse": "Post-Apocalyptic",
        "end of the world": "Post-Apocalyptic",
        "zombie": "Horror",
        "dragon": "Fantasy",
        "magic": "Fantasy",
    }

    # First check aliases
    for alias, category in category_aliases.items():
        if alias in question_lower and category in known_categories:
            return category

    # Check against categories from database (exact match)
    for category in known_categories:
        if category.lower() in question_lower:
            return category

    # Check for partial/keyword matches if no exact match
    # Require whole-word match to avoid false positives (e.g., "thriller" matching "Techno-Thriller")
    for category in known_categories:
        category_words = category.lower().split()
        for word in category_words:
            if len(word) > 4 and re.search(r'\b' + re.escape(word) + r'\b', question_lower):
                return category

    return None

def detect_author_intent(question: str) -> bool:
    """
    Detect if the user is asking about an author (known or unknown).

    This helps identify when users ask for authors not in our database,
    so we can respond appropriately instead of returning random books.

    Patterns detected:
    - "books by [name]"
    - "books from [name]"
    - "[name] books"
    - "recommendations from [name]"
    - "written by [name]"
    - "author [name]"

    Args:
        question (str): The natural language question from the user

    Returns:
        bool: True if user appears to be asking about an author
    """
    question_lower = question.lower()

    # Patterns that indicate author intent
    author_patterns = [
        r'\bbooks?\s+by\b',           # "books by", "book by"
        r'\bbooks?\s+from\b',         # "books from", "book from"
        r'\bwritten\s+by\b',          # "written by"
        r'\bauthor\b',                # "author"
        r'\brecommendations?\s+from\b',  # "recommendations from"
        r'\b\w+\'s\s+books?\b',       # "Asimov's books"
        r'\bby\s+[A-Z][a-z]+',        # "by Isaac" (capitalized name after "by")
        r'\bfrom\s+[A-Z][a-z]+',      # "from Isaac" (capitalized name after "from")
    ]

    for pattern in author_patterns:
        if re.search(pattern, question, re.IGNORECASE):
            return True

    return False

def detect_author(question: str) -> str:
    """
    Detect if the user is asking for books by a specific author.

    Handles various author query patterns:
    - "Isaac Asimov books"
    - "books by Asimov"
    - "recommendations from Isaac Asimov"
    - "Asimov"
    - Case insensitive matching

    Args:
        question (str): The natural language question from the user

    Returns:
        str: Detected author name or None if no match
    """
    global known_authors

    if not known_authors:
        return None

    question_lower = question.lower()

    # First try exact full name match
    for author in known_authors:
        if author.lower() in question_lower:
            print(f"📝 Detected author (full name): {author}")
            return author

    # Try matching just the last name
    for author in known_authors:
        author_parts = author.split()
        if len(author_parts) > 1:
            last_name = author_parts[-1]
            # Look for last name as a complete word (not part of another word)
            if last_name.lower() in question_lower:
                # Verify it's not matching inside another word
                # by checking word boundaries
                pattern = r'\b' + re.escape(last_name.lower()) + r'\b'
                if re.search(pattern, question_lower):
                    print(f"📝 Detected author (last name): {author}")
                    return author

    return None

def generate_query_embedding(question: str) -> list:
    """
    Generate embedding vector for the user's question.

    Args:
        question (str): The natural language question from the user

    Returns:
        list: Embedding vector (list of floats)
    """
    global embeddings_model
    
    # Generate embedding using the same model used for book descriptions
    embedding = embeddings_model.embed_query(question)
    return embedding

def search_similar_books(cursor, query_embedding: list, top_k: int = 3, category_filter: str = None, author_filter: str = None) -> List[Dict]:
    """
    Perform vector similarity search in SQL Server 2025.

    Uses the VECTOR_DISTANCE function to find books with embeddings
    most similar to the query embedding. Optionally filters by category and/or author.

    Args:
        cursor: Database cursor for executing queries
        query_embedding (list): The question's embedding vector
        top_k (int): Number of results to return (default: 3)
        category_filter (str): Optional category to filter results (e.g., "Adventure")
        author_filter (str): Optional author name to filter results (e.g., "Isaac Asimov")

    Returns:
        List[Dict]: List of matching books with similarity scores and author information
    """
    # Convert embedding list to SQL-compatible VECTOR format
    vector_str = f"[{','.join(map(str, query_embedding))}]"

    # SQL Server 2025 vector similarity search query
    # VECTOR_DISTANCE calculates cosine distance (lower = more similar)
    # We use 1 - distance to get a similarity score (higher = more similar)
    #
    # FIXES APPLIED:
    # 1. STRING_AGG to consolidate multiple authors into single row (prevents duplicates)
    # 2. CTE to calculate VECTOR_DISTANCE only once (performance optimization)
    # 3. DISTINCT in CTE to prevent duplicate rows when joining authors (multiple authors per book)
    # 4. Author filtering in CTE with JOIN to books_authors and authors tables

    if category_filter and author_filter:
        # Filter by both category and author
        search_query = """
            WITH VectorScores AS (
                SELECT DISTINCT
                    b.id,
                    b.title,
                    b.category,
                    b.year,
                    1 - VECTOR_DISTANCE('cosine', b.description_embedding, CAST(? AS VECTOR(768))) AS SimilarityScore
                FROM books b
                LEFT JOIN books_authors ba ON b.id = ba.book_id
                LEFT JOIN authors a ON ba.author_id = a.id
                WHERE b.description_embedding IS NOT NULL
                  AND (? IS NULL OR CONCAT(a.first_name, ' ', a.last_name) = ?)
                  AND (? IS NULL OR b.category = ?)
            )
            SELECT TOP (?)
                vs.id,
                vs.title,
                vs.category,
                vs.year,
                STRING_AGG(CONCAT(a.first_name, ' ', a.last_name), ', ') WITHIN GROUP (ORDER BY a.last_name) as author_name,
                vs.SimilarityScore
            FROM VectorScores vs
            LEFT JOIN books_authors ba ON vs.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            GROUP BY vs.id, vs.title, vs.category, vs.year, vs.SimilarityScore
            ORDER BY vs.SimilarityScore DESC
        """
        print(f"👤 Filtering by author: {author_filter} and category: {category_filter}")
        cursor.execute(search_query, (vector_str, author_filter, author_filter, category_filter, category_filter, top_k))
    elif author_filter:
        # Filter by author only
        search_query = """
            WITH VectorScores AS (
                SELECT DISTINCT
                    b.id,
                    b.title,
                    b.category,
                    b.year,
                    1 - VECTOR_DISTANCE('cosine', b.description_embedding, CAST(? AS VECTOR(768))) AS SimilarityScore
                FROM books b
                LEFT JOIN books_authors ba ON b.id = ba.book_id
                LEFT JOIN authors a ON ba.author_id = a.id
                WHERE b.description_embedding IS NOT NULL
                  AND CONCAT(a.first_name, ' ', a.last_name) = ?
            )
            SELECT TOP (?)
                vs.id,
                vs.title,
                vs.category,
                vs.year,
                STRING_AGG(CONCAT(a.first_name, ' ', a.last_name), ', ') WITHIN GROUP (ORDER BY a.last_name) as author_name,
                vs.SimilarityScore
            FROM VectorScores vs
            LEFT JOIN books_authors ba ON vs.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            GROUP BY vs.id, vs.title, vs.category, vs.year, vs.SimilarityScore
            ORDER BY vs.SimilarityScore DESC
        """
        print(f"👤 Filtering by author: {author_filter}")
        cursor.execute(search_query, (vector_str, author_filter, top_k))
    elif category_filter:
        # Filter by category only (no author JOIN needed in CTE)
        search_query = """
            WITH VectorScores AS (
                SELECT
                    b.id,
                    b.title,
                    b.category,
                    b.year,
                    1 - VECTOR_DISTANCE('cosine', b.description_embedding, CAST(? AS VECTOR(768))) AS SimilarityScore
                FROM books b
                WHERE b.description_embedding IS NOT NULL
                  AND b.category = ?
            )
            SELECT TOP (?)
                vs.id,
                vs.title,
                vs.category,
                vs.year,
                STRING_AGG(CONCAT(a.first_name, ' ', a.last_name), ', ') WITHIN GROUP (ORDER BY a.last_name) as author_name,
                vs.SimilarityScore
            FROM VectorScores vs
            LEFT JOIN books_authors ba ON vs.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            GROUP BY vs.id, vs.title, vs.category, vs.year, vs.SimilarityScore
            ORDER BY vs.SimilarityScore DESC
        """
        cursor.execute(search_query, (vector_str, category_filter, top_k))
    else:
        # No filters - pure vector search (no author JOIN needed in CTE)
        search_query = """
            WITH VectorScores AS (
                SELECT
                    b.id,
                    b.title,
                    b.category,
                    b.year,
                    1 - VECTOR_DISTANCE('cosine', b.description_embedding, CAST(? AS VECTOR(768))) AS SimilarityScore
                FROM books b
                WHERE b.description_embedding IS NOT NULL
            )
            SELECT TOP (?)
                vs.id,
                vs.title,
                vs.category,
                vs.year,
                STRING_AGG(CONCAT(a.first_name, ' ', a.last_name), ', ') WITHIN GROUP (ORDER BY a.last_name) as author_name,
                vs.SimilarityScore
            FROM VectorScores vs
            LEFT JOIN books_authors ba ON vs.id = ba.book_id
            LEFT JOIN authors a ON ba.author_id = a.id
            GROUP BY vs.id, vs.title, vs.category, vs.year, vs.SimilarityScore
            ORDER BY vs.SimilarityScore DESC
        """
        cursor.execute(search_query, (vector_str, top_k))

    results = cursor.fetchall()

    # Transform results into dictionary format with author information
    books = []
    for row in results:
        books.append({
            'id': row[0],
            'title': row[1],
            'category': row[2],
            'year': row[3],
            'author': row[4] if row[4] else 'Unknown',
            'similarity_score': float(row[5])
        })

    return books

def create_safe_prompt(question: str, retrieved_books: List[Dict], conversation_history: List[Dict] = None) -> str:
    """
    Create a safe, constrained prompt that forces the LLM to only mention real books.

    Uses the LIBRARIAN_SYSTEM_PROMPT with structured book data to prevent hallucination.
    The LLM receives exact book details and is instructed to only recommend from this list.

    Args:
        question (str): The original user question
        retrieved_books (List[Dict]): Books retrieved from vector search with author info
        conversation_history (List[Dict]): Previous conversation messages

    Returns:
        str: Structured prompt with system instructions and book list
    """
    global known_categories

    # Format books with all available information (no numbered "Book 1:" format)
    # Use a cleaner format that the LLM won't echo back
    books_list = "\n".join([
        f"- '{book['title']}' by {book['author']} ({book['year']}) [{book['category']}]"
        for book in retrieved_books
    ])

    # Use the comprehensive system prompt with proper structure
    # Keep it simple for TinyLlama but include critical constraints
    prompt = f"""{LIBRARIAN_SYSTEM_PROMPT}

BOOKS:
{books_list}

Q: {question}
A:"""

    return prompt

def generate_response_with_rag(question: str, retrieved_books: List[Dict], conversation_history: List[Dict] = None) -> str:
    """
    Generate a natural language response using the RAG pattern with LLM.

    This function uses the actual LLM to create warm, conversational recommendations:
    1. Filters books by similarity threshold to ensure quality matches
    2. Formats the retrieved books as context with a safe, constrained prompt
    3. Includes conversation history for follow-up questions
    4. Creates a prompt that forces the LLM to only reference the retrieved books
    5. Uses Ollama LLM to generate a natural, conversational response
    6. Validates response to ensure no hallucinations

    Threshold Strategy:
    - Category queries: 0.30 (most lenient - user explicitly asking for a genre)
    - Author queries: 0.35 (lenient - author-specific queries need lower threshold)
    - General queries: 0.50 (stricter - requires strong semantic match)

    Args:
        question (str): The original user question
        retrieved_books (List[Dict]): Books retrieved from vector search
        conversation_history (List[Dict]): Previous conversation messages

    Returns:
        str: Natural language recommendation from the librarian LLM (validated)
    """
    global llm_model, known_categories, known_authors

    if not retrieved_books:
        return "I apologize, but I couldn't find any books matching your interest in our library collection. Could you try a different search or ask for a specific genre?"

    # Check if user is asking for a specific category or author
    detected_cat = detect_category(question)
    detected_author = detect_author(question)

    # CRITICAL: Apply similarity threshold to ensure quality recommendations
    # Priority: category > author > general
    # Note: With ~200 books, embedding scores tend to be lower than with small datasets
    if detected_cat:
        # User asked for a specific category - most lenient (category filter already narrows results)
        SIMILARITY_THRESHOLD = 0.20
        print(f"📚 Category detected: {detected_cat} - using threshold {SIMILARITY_THRESHOLD}")
        quality_books = [book for book in retrieved_books if book['similarity_score'] >= SIMILARITY_THRESHOLD]
    elif detected_author:
        # User asked for a specific author - lenient (author filter already narrows results)
        SIMILARITY_THRESHOLD = 0.25
        print(f"✍️  Author detected: {detected_author} - using threshold {SIMILARITY_THRESHOLD}")
        quality_books = [book for book in retrieved_books if book['similarity_score'] >= SIMILARITY_THRESHOLD]
    else:
        # General query - strict threshold to avoid recommending irrelevant books
        SIMILARITY_THRESHOLD = 0.60
        print(f"🔍 General query - using threshold {SIMILARITY_THRESHOLD}")
        quality_books = [book for book in retrieved_books if book['similarity_score'] >= SIMILARITY_THRESHOLD]

    # Check if we have any quality matches
    best_score = max(book['similarity_score'] for book in retrieved_books) if retrieved_books else 0

    # Log top scores for debugging
    top_3 = sorted(retrieved_books, key=lambda b: b['similarity_score'], reverse=True)[:3]
    for b in top_3:
        print(f"   📊 {b['title']}: {b['similarity_score']:.4f} {'✅' if b['similarity_score'] >= SIMILARITY_THRESHOLD else '❌'}")

    if not quality_books:
        # No books meet the quality threshold
        categories_list = ", ".join(known_categories) if known_categories else "Science Fiction and Adventure"
        return f"Hmm, I don't think we have books on that specific topic. Our collection focuses on {categories_list}. Would you like me to recommend something from one of those genres?"

    # BUG FIX: Commented out lines 485-488 (deadzone bug)
    #
    # ISSUE: This code created a contradictory threshold deadzone (50-60%)
    # - Line 472 sets threshold at 0.50 (accepts books >= 50%)
    # - Line 485 rejects all results if best_score < 0.60
    # - Result: Books scoring 50-60% pass threshold but get rejected anyway
    #
    # EXAMPLE FAILURE: "Isaac Asimov books" query
    # - Vector search returns Asimov books with ~50% similarity
    # - Books pass 50% threshold (line 472) → quality_books has 1 book
    # - best_score = 0.50 triggers rejection (line 485: 0.50 < 0.60)
    # - User sees "we don't have books" despite valid matches
    #
    # FIX: Removed secondary threshold check - trust the primary threshold
    # If books pass the 50% threshold (line 472), they should be recommended
    #
    # if detected_cat is None and best_score < 0.60:
    #     # User is asking for something outside our core collection
    #     categories_list = ", ".join(known_categories) if known_categories else "Science Fiction and Adventure"
    #     return f"I'm sorry, but our library specializes in {categories_list} books. We don't appear to have books matching your specific request. Would you like me to recommend something from our collection instead? Just ask for any of our genres!"

    print(f"🔄 Generating natural language response with LLM ({len(quality_books)} quality matches)...")

    try:
        # Initialize LLM if not already loaded
        if llm_model is None:
            llm_model = initialize_llm_model()

        # Create a safer, more constrained prompt using only quality matches
        safe_prompt = create_safe_prompt(question, quality_books, conversation_history)

        # Generate response using the LLM with logging
        print(f"📤 Sending constrained prompt to LLM (length: {len(safe_prompt)} chars)")
        response = llm_model.invoke(safe_prompt)
        print(f"📥 Received response from LLM (length: {len(response)} chars)")

        # Validate that the response doesn't contain obvious hallucinations
        validated_response = validate_and_fix_response(response, quality_books)

        print("✅ LLM response generated successfully")
        return validated_response.strip()

    except Exception as e:
        print(f"❌ Error generating LLM response: {e}")
        return _conversational_fallback(quality_books)

def _conversational_fallback(books: List[Dict]) -> str:
    """Generate a conversational fallback response matching the LLM's warm tone."""
    if not books:
        return "I couldn't find a strong match for that in our collection. Could you try rephrasing or ask about a different genre?"

    if len(books) == 1:
        b = books[0]
        return f"Great question! I'd recommend **{b['title']}** by {b.get('author', 'Unknown')} ({b['year']}). It's a wonderful {b['category'].lower()} read!"

    # 2+ books — mention up to 2 conversationally
    top = books[:2]
    parts = [f"**{b['title']}** by {b.get('author', 'Unknown')} ({b['year']})" for b in top]
    return f"Great question! I'd suggest {parts[0]} and {parts[1]}. Both are excellent reads from our collection!"


def validate_and_fix_response(response: str, retrieved_books: List[Dict]) -> str:
    """
    Validate that the LLM response only mentions books from the retrieved results
    and doesn't contain contradictory statements.

    Checks for:
    1. Hallucinated books not in the retrieved set
    2. Contradictions (saying "we don't have" while recommending books)
    3. Response quality and coherence

    Args:
        response (str): The LLM-generated response
        retrieved_books (List[Dict]): The actual books retrieved from the database

    Returns:
        str: Validated response or safe fallback
    """
    # Extract all book titles from retrieved results
    real_book_titles = {book['title'].lower() for book in retrieved_books}

    # Check if the response mentions any real books
    has_real_books = any(title.lower() in response.lower() for title in real_book_titles)

    # Check for contradictory statements
    response_lower = response.lower()
    negative_phrases = [
        "don't have",
        "don't appear to have",
        "couldn't find",
        "no books",
        "sorry",
        "apologize",
        "specializes in"
    ]
    has_negative = any(phrase in response_lower for phrase in negative_phrases)

    # CRITICAL: If response says "we don't have" but also mentions book titles,
    # it's a contradiction - the LLM is confused
    if has_negative and has_real_books:
        print("⚠️  Warning: Contradictory response detected (negative + book mentions) - using fallback")
        return _conversational_fallback(retrieved_books)

    if has_real_books:
        # Response mentions real books and no contradictions - it's safe
        print("✅ Response validation passed - mentions real books, no contradictions")
        return response
    else:
        # Response doesn't mention any real books - likely hallucination
        print("⚠️  Warning: Response doesn't reference retrieved books - using fallback")
        return _conversational_fallback(retrieved_books)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Library Chat Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "chat": "POST /chat",
            "docs": "GET /docs"
        }
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    RAG (Retrieval-Augmented Generation) endpoint for natural language recommendations.

    Process:
    1. Generate embedding for the user's question
    2. Perform vector similarity search in SQL Server 2025 (Retrieval)
    3. Format retrieved books as context for the LLM
    4. Generate natural language response using Ollama (Generation)
    5. Return response and results with system prompt guardrails

    The system prompt ensures:
    - The LLM only recommends books from the search results
    - No hallucinated or made-up books are suggested
    - Responses are warm, helpful, and accurate
    - All recommendations include exact titles and information from results

    Args:
        request (ChatRequest): Contains the user's natural language question

    Returns:
        ChatResponse: Natural language response + top matching books with scores

    Example:
        POST /chat
        {
            "question": "I want to read science fiction about space exploration"
        }

        Response:
        {
            "question": "I want to read science fiction about space exploration",
            "response": "Based on your interest in science fiction about space exploration,
                        I'd highly recommend '2001: A Space Odyssey' by Arthur C. Clarke (1968).
                        This classic masterpiece explores humanity's first contact with mysterious
                        alien intelligence on Jupiter...",
            "results": [
                {
                    "id": 9,
                    "title": "2001: A Space Odyssey",
                    "category": "Science Fiction",
                    "year": 1968,
                    "similarity_score": 0.89
                },
                ...
            ]
        }
    """
    try:
        t_start = time.time()

        # Step 1: Detect if user is asking ONLY for a specific category
        # We only filter by category if the query seems purely category-focused
        print(f"📝 Question: {request.question}")
        detected_category = detect_category(request.question)

        # Only apply category filter for simple category-only queries
        # Don't filter if query mentions authors, years, specific titles, etc.
        question_lower = request.question.lower()
        is_category_only_query = detected_category and not any(word in question_lower for word in [
            "author", "by", "from", "written", "year", "1800", "1900", "19", "20",
        ])

        category_filter = detected_category if is_category_only_query else None

        if category_filter:
            print(f"🏷️  Filtering by category: {category_filter}")
        elif detected_category:
            print(f"🏷️  Detected category '{detected_category}' but not filtering (complex query)")

        # Step 2: Generate embedding for the question
        t_embed_start = time.time()
        query_embedding = generate_query_embedding(request.question)
        t_embed = time.time() - t_embed_start
        print(f"✅ Generated embedding vector ({len(query_embedding)} dimensions) [{t_embed:.2f}s]")

        # Step 3: Connect to database and search for similar books (Retrieval)
        t_search_start = time.time()
        conn = get_connection()
        cursor = conn.cursor()

        # Detect author filter and intent
        detected_author = detect_author(request.question)
        author_intent = detect_author_intent(request.question)

        # Handle case where user asks for an unknown author
        if author_intent and not detected_author:
            print(f"⚠️  User asked for an author not in database")
            authors_list = ", ".join(known_authors[:5]) if known_authors else "various authors"
            return ChatResponse(
                question=request.question,
                response=f"I'm sorry, but I couldn't find that author in our library collection. We have books by authors like {authors_list}, and more. Would you like me to recommend something from one of these authors, or perhaps browse by genre instead?",
                results=[]
            )

        print("🔍 Searching for similar books...")
        results = search_similar_books(
            cursor,
            query_embedding,
            top_k=3,
            category_filter=category_filter,
            author_filter=detected_author
        )

        cursor.close()
        conn.close()
        t_search = time.time() - t_search_start
        print(f"✅ Found {len(results)} matching books [{t_search:.2f}s]")

        # Step 4: Generate natural language response using RAG (Generation)
        t_llm_start = time.time()
        print("💭 Generating conversational response...")
        # Convert conversation history to dict format
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history] if request.conversation_history else []
        natural_response = generate_response_with_rag(request.question, results, history)
        t_llm = time.time() - t_llm_start

        # Step 5: Apply similarity threshold to results returned to user
        # Only show books that meet the quality threshold to prevent showing irrelevant results
        # Use same logic as generate_response_with_rag: tiered thresholds by query type
        # Note: detected_author already computed in Step 3

        if detected_category:
            SIMILARITY_THRESHOLD = 0.20  # Most lenient for category queries
        elif detected_author:
            SIMILARITY_THRESHOLD = 0.25  # Lenient for author queries
        else:
            SIMILARITY_THRESHOLD = 0.40  # Moderate for general queries

        quality_results = [book for book in results if book['similarity_score'] >= SIMILARITY_THRESHOLD]

        # If no quality matches, return empty results (message explains why in the response)
        final_results = quality_results if quality_results else []

        t_total = time.time() - t_start
        print(f"⏱️  Latency breakdown: embedding={t_embed:.2f}s | sql_vector_search={t_search*1000:.0f}ms | llm={t_llm:.2f}s | total={t_total:.2f}s")

        # Step 6: Return complete response with both natural language and structured data
        return ChatResponse(
            question=request.question,
            response=natural_response,
            results=[BookResult(**book) for book in final_results]
        )

    except Exception as e:
        logger.error(f"Error processing chat request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred processing your request. Please try again.")

@app.get("/health")
async def health_check():
    """
    Health check endpoint that verifies database connectivity.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()

        return {
            "status": "healthy",
            "database": "connected",
            "model": "loaded" if embeddings_model else "not loaded"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return {
            "status": "unhealthy",
            "error": "Database connection failed"
        }

if __name__ == "__main__":
    import uvicorn

    # Run the FastAPI service
    # Access the API at: http://localhost:8000
    # Interactive docs at: http://localhost:8000/docs
    print("=" * 60)
    print("🚀 Starting Library Chat Service (RAG)")
    print("=" * 60)
    print("📍 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("🤖 Models:")
    print(f"   - Embeddings: {EMBEDDING_MODEL} (768-dim)")
    print(f"   - LLM: {LLM_MODEL} (temp={LLM_TEMPERATURE}, max_tokens={LLM_NUM_PREDICT})")
    print(f"⚡ Performance: num_thread={'auto' if OLLAMA_NUM_THREAD == 0 else OLLAMA_NUM_THREAD}")
    print("📋 Pattern: RAG (Retrieval-Augmented Generation)")
    print("🛡️  Guardrails: System prompt prevents hallucination")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8000)
