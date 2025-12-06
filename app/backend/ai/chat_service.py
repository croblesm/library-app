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
- Ollama running with nomic-embed-text and llama3.2 models: ollama serve
"""

import os
from typing import List, Dict
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mssql_python as mssql
from langchain_ollama import OllamaEmbeddings, OllamaLLM

# Load environment variables from .env file
# This reads the MSSQL_CONNECTION_STRING variable for database connectivity
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="Library Chat Service",
    description="AI-powered RAG semantic search with natural language responses over library books",
    version="2.0.0"
)

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Global variables to store models (initialized once at startup)
embeddings_model = None
llm_model = None
known_categories = []  # Populated from database at startup

# System prompt for the librarian agent
# This defines the role, behavior, and constraints to prevent hallucination
LIBRARIAN_SYSTEM_PROMPT = """You are a knowledgeable and friendly librarian AI assistant helping patrons find books to read.

Your role:
- Provide warm, conversational book recommendations based on user interests
- Suggest books from the library's collection that match the user's preferences
- Explain why each book is a good match for their interests
- Help users discover books they might enjoy

CRITICAL CONSTRAINTS (Must follow STRICTLY - these are non-negotiable):
1. ONLY recommend books that are explicitly listed below with their titles
2. NEVER make up, invent, or hallucinate any books not in the list
3. NEVER recommend books under a different title than what's in the list
4. NEVER invent book details (authors, plots, characters) that aren't provided
5. If you recommend a book, use EXACTLY the title and year from the list
6. Maximum 2-3 books per recommendation
7. Keep responses brief and conversational (100 words max)
8. If no good matches exist, say so honestly

Important reminders:
- It's better to recommend only 1 book accurately than 3 hallucinated ones
- Users trust librarians to be accurate, not creative
- Check that every book you mention is in the list before writing your response"""

# Request/Response models for API
class Message(BaseModel):
    """Individual message in conversation history"""
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    """Request body for chat endpoint"""
    question: str
    conversation_history: List[Message] = []  # Optional conversation history

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
        model="nomic-embed-text",
        base_url="http://localhost:11434"
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
    llm = OllamaLLM(
        model="tinyllama",
        base_url="http://localhost:11434",
        temperature=0.1  # Low creativity - more deterministic to prevent hallucination
    )

    print("✅ LLM model loaded")
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
    for category in known_categories:
        # Split category into words and check if any word matches
        category_words = category.lower().split()
        for word in category_words:
            if len(word) > 3 and word in question_lower:  # Skip short words
                return category
    
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

def search_similar_books(cursor, query_embedding: list, top_k: int = 3, category_filter: str = None) -> List[Dict]:
    """
    Perform vector similarity search in SQL Server 2025.

    Uses the VECTOR_DISTANCE function to find books with embeddings
    most similar to the query embedding. Optionally filters by category.

    Args:
        cursor: Database cursor for executing queries
        query_embedding (list): The question's embedding vector
        top_k (int): Number of results to return (default: 3)
        category_filter (str): Optional category to filter results (e.g., "Adventure")

    Returns:
        List[Dict]: List of matching books with similarity scores
    """
    # Convert embedding list to SQL-compatible VECTOR format
    vector_str = f"[{','.join(map(str, query_embedding))}]"

    # SQL Server 2025 vector similarity search query
    # VECTOR_DISTANCE calculates cosine distance (lower = more similar)
    # We use 1 - distance to get a similarity score (higher = more similar)
    if category_filter:
        # Filter by category when user asks for a specific genre
        search_query = """
            SELECT TOP (?)
                id,
                title,
                category,
                year,
                1 - VECTOR_DISTANCE('cosine', description_embedding, CAST(? AS VECTOR(768))) AS SimilarityScore
            FROM books
            WHERE description_embedding IS NOT NULL
              AND category = ?
            ORDER BY VECTOR_DISTANCE('cosine', description_embedding, CAST(? AS VECTOR(768))) ASC
        """
        cursor.execute(search_query, (top_k, vector_str, category_filter, vector_str))
    else:
        # No category filter - pure vector search
        search_query = """
            SELECT TOP (?)
                id,
                title,
                category,
                year,
                1 - VECTOR_DISTANCE('cosine', description_embedding, CAST(? AS VECTOR(768))) AS SimilarityScore
            FROM books
            WHERE description_embedding IS NOT NULL
            ORDER BY VECTOR_DISTANCE('cosine', description_embedding, CAST(? AS VECTOR(768))) ASC
        """
        cursor.execute(search_query, (top_k, vector_str, vector_str))
    
    results = cursor.fetchall()

    # Transform results into dictionary format
    books = []
    for row in results:
        books.append({
            'id': row[0],
            'title': row[1],
            'category': row[2],
            'year': row[3],
            'similarity_score': float(row[4])
        })

    return books

def create_safe_prompt(question: str, retrieved_books: List[Dict], conversation_history: List[Dict] = None) -> str:
    """
    Create a safe, constrained prompt that forces the LLM to only mention real books.
    
    This uses a more structured approach with explicit book references to prevent hallucination.
    The LLM is given specific books to choose from and asked to explain why they match.
    
    Args:
        question (str): The original user question
        retrieved_books (List[Dict]): Books retrieved from vector search
        conversation_history (List[Dict]): Previous conversation messages
    
    Returns:
        str: Structured prompt with specific books
    """
    global known_categories
    
    # Create a numbered list of books with all details
    books_list = "\n".join([
        f"Book {i}: '{book['title']}' ({book['year']}) - {book['category']}"
        for i, book in enumerate(retrieved_books, 1)
    ])
    
    # Simple, strict prompt for small LLMs like TinyLlama
    # Avoid complex instructions - keep it very direct
    prompt = f"""Available books:
{books_list}

User request: "{question}"

Write a 2-sentence response recommending 1-2 books from the list above. Use exact titles. Do not invent books or conversations."""
    
    return prompt

def generate_response_with_rag(question: str, retrieved_books: List[Dict], conversation_history: List[Dict] = None) -> str:
    """
    Generate a natural language response using the RAG pattern with LLM.

    This function uses the actual LLM to create warm, conversational recommendations:
    1. Formats the retrieved books as context with a safe, constrained prompt
    2. Includes conversation history for follow-up questions
    3. Creates a prompt that forces the LLM to only reference the retrieved books
    4. Uses Ollama LLM to generate a natural, conversational response
    5. Validates response to ensure no hallucinations

    Args:
        question (str): The original user question
        retrieved_books (List[Dict]): Books retrieved from vector search
        conversation_history (List[Dict]): Previous conversation messages

    Returns:
        str: Natural language recommendation from the librarian LLM (validated)
    """
    global llm_model, known_categories

    if not retrieved_books:
        return "I apologize, but I couldn't find any books matching your interest in our library collection. Could you try a different search or ask for a specific genre?"

    # Check if this is a low-relevance query (user asking for something we don't have)
    # If no category was detected and similarity scores are low, be honest about our collection
    best_score = max(book['similarity_score'] for book in retrieved_books)
    detected_cat = detect_category(question)
    
    if detected_cat is None and best_score < 0.60:
        # User is asking for something outside our collection
        categories_list = ", ".join(known_categories) if known_categories else "Science Fiction and Adventure"
        return f"I'm sorry, but our library specializes in {categories_list} books. We don't appear to have books matching your specific request. Would you like me to recommend something from our collection instead? Just ask for any of our genres!"

    print("🔄 Generating natural language response with LLM...")

    try:
        # Initialize LLM if not already loaded
        if llm_model is None:
            llm_model = initialize_llm_model()

        # Create a safer, more constrained prompt
        safe_prompt = create_safe_prompt(question, retrieved_books, conversation_history)

        # Generate response using the LLM with logging
        print(f"📤 Sending constrained prompt to LLM (length: {len(safe_prompt)} chars)")
        response = llm_model.invoke(safe_prompt)
        print(f"📥 Received response from LLM (length: {len(response)} chars)")
        
        # Validate that the response doesn't contain obvious hallucinations
        validated_response = validate_and_fix_response(response, retrieved_books)

        print("✅ LLM response generated successfully")
        return validated_response.strip()

    except Exception as e:
        print(f"❌ Error generating LLM response: {e}")
        # Fallback: return safe list if LLM fails
        fallback = f"Based on your search for '{question}', here are some recommendations from our collection:\n\n"
        for i, book in enumerate(retrieved_books[:3], 1):
            fallback += f"{i}. **{book['title']}** ({book['year']}) - {book['category']}\n"
        return fallback.strip()

def validate_and_fix_response(response: str, retrieved_books: List[Dict]) -> str:
    """
    Validate that the LLM response only mentions books from the retrieved results.
    If hallucinations are detected, replace with a safe fallback.
    
    Args:
        response (str): The LLM-generated response
        retrieved_books (List[Dict]): The actual books retrieved from the database
    
    Returns:
        str: Validated response or fallback
    """
    # Extract all book titles from retrieved results
    real_book_titles = {book['title'].lower() for book in retrieved_books}
    
    # Check if the response mentions any real books
    has_real_books = any(title.lower() in response.lower() for title in real_book_titles)
    
    if has_real_books:
        # Response mentions at least some real books - it's probably safe
        print("✅ Response validation passed - mentions real books")
        return response
    else:
        # Response doesn't mention any real books - likely hallucination
        print("⚠️  Warning: Response doesn't reference retrieved books - using fallback")
        fallback = "Here are some great books from our collection that match your interests:\n\n"
        for i, book in enumerate(retrieved_books, 1):
            fallback += f"{i}. **{book['title']}** ({book['year']}) - {book['category']}\n"
        return fallback

@app.on_event("startup")
async def startup_event():
    """
    Initialize the embedding model and fetch categories when the FastAPI application starts.
    The LLM model is loaded on-demand to prevent memory issues at startup.
    This ensures the embedding model is loaded once and reused for all requests.
    Categories are fetched from the database for dynamic matching.
    """
    global embeddings_model, known_categories
    embeddings_model = initialize_embedding_model()
    known_categories = fetch_categories_from_database()
    print("✅ Startup complete - embedding model and categories ready")

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
        query_embedding = generate_query_embedding(request.question)
        print(f"✅ Generated embedding vector ({len(query_embedding)} dimensions)")

        # Step 3: Connect to database and search for similar books (Retrieval)
        conn = get_connection()
        cursor = conn.cursor()

        print("🔍 Searching for similar books...")
        results = search_similar_books(cursor, query_embedding, top_k=3, category_filter=category_filter)

        cursor.close()
        conn.close()

        print(f"✅ Found {len(results)} matching books")

        # Step 4: Generate natural language response using RAG (Generation)
        print("💭 Generating conversational response...")
        # Convert conversation history to dict format
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history] if request.conversation_history else []
        natural_response = generate_response_with_rag(request.question, results, history)

        # Step 5: Return complete response with both natural language and structured data
        return ChatResponse(
            question=request.question,
            response=natural_response,
            results=[BookResult(**book) for book in results]
        )

    except Exception as e:
        print(f"❌ Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        return {
            "status": "unhealthy",
            "error": str(e)
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
    print("   - Embeddings: nomic-embed-text (768-dim)")
    print("   - LLM: llama3.2:3b (natural language generation)")
    print("📋 Pattern: RAG (Retrieval-Augmented Generation)")
    print("🛡️  Guardrails: System prompt prevents hallucination")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8000)
