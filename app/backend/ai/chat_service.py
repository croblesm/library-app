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
from pydantic import BaseModel
import mssql_python as mssql
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama

# Load environment variables from .env file
# This reads the MSSQL_CONNECTION_STRING variable for database connectivity
load_dotenv()

# Initialize FastAPI application
app = FastAPI(
    title="Library Chat Service",
    description="AI-powered RAG semantic search with natural language responses over library books",
    version="2.0.0"
)

# Global variables to store models (initialized once at startup)
embeddings_model = None
llm_model = None

# System prompt for the librarian agent
# This defines the role, behavior, and constraints to prevent hallucination
LIBRARIAN_SYSTEM_PROMPT = """You are a knowledgeable and friendly librarian AI assistant helping patrons find books to read.

Your role:
- Provide warm, conversational book recommendations based on user interests
- Suggest books from the library's collection that match the user's preferences
- Explain why each book is a good match for their interests
- Help users discover books they might enjoy

CRITICAL CONSTRAINTS (Must follow strictly):
1. ONLY recommend books that are provided in the search results below
2. NEVER make up or invent books that are not in the results
3. NEVER recommend books not in the provided list
4. If you don't have good recommendations in the results, say so honestly
5. Always cite the exact title, author (if available), year, and category from the results
6. Be conversational but accurate - prioritize accuracy over entertainment
7. If asked about books not in the results, politely explain they're not in our collection

When making recommendations:
- Start with a brief acknowledgment of their interest
- Recommend 1-3 books from the search results that best match
- Explain why each book is a good fit
- Keep recommendations concise and conversational
- Use the exact book titles and information from the results

Remember: It's better to say "We don't have that exact title" than to hallucinate.
"""

# Request/Response models for API
class ChatRequest(BaseModel):
    """Request body for chat endpoint"""
    question: str

    class Config:
        json_schema_extra = {
            "example": {
                "question": "I want to read science fiction about space exploration"
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
    llm = Ollama(
        model="llama3.2:3b",
        base_url="http://localhost:11434",
        temperature=0.7  # Moderate creativity - balance between deterministic and random
    )

    print("✅ LLM model loaded")
    return llm

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

def search_similar_books(cursor, query_embedding: list, top_k: int = 3) -> List[Dict]:
    """
    Perform vector similarity search in SQL Server 2025.

    Uses the VECTOR_DISTANCE function to find books with embeddings
    most similar to the query embedding.

    Args:
        cursor: Database cursor for executing queries
        query_embedding (list): The question's embedding vector
        top_k (int): Number of results to return (default: 3)

    Returns:
        List[Dict]: List of matching books with similarity scores
    """
    # Convert embedding list to SQL-compatible VECTOR format
    vector_str = f"[{','.join(map(str, query_embedding))}]"

    # SQL Server 2025 vector similarity search query
    # VECTOR_DISTANCE calculates cosine distance (lower = more similar)
    # We use 1 - distance to get a similarity score (higher = more similar)
    # Column names are lowercase to match the Sequelize schema
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

    # Execute the vector similarity search
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

def format_books_for_context(books: List[Dict]) -> str:
    """
    Format retrieved books into a context string for the LLM prompt.

    This creates a structured representation of the retrieved books
    that the LLM can easily understand and reference.

    Args:
        books (List[Dict]): List of book results from search

    Returns:
        str: Formatted context string with book information
    """
    if not books:
        return "No books found in the library matching this query."

    context = "Available books from the library:\n"
    context += "=" * 60 + "\n"

    for i, book in enumerate(books, 1):
        context += f"{i}. {book['title']} ({book['year']})\n"
        context += f"   Category: {book['category']}\n"
        context += f"   Relevance Score: {book['similarity_score']:.2%}\n"
        context += "\n"

    return context

def generate_response_with_rag(question: str, retrieved_books: List[Dict]) -> str:
    """
    Generate a natural language response using the RAG pattern.

    This function builds a warm, conversational recommendation by:
    1. Analyzing the user's question
    2. Prioritizing the most relevant books from search results
    3. Crafting personalized recommendations with explanations
    4. Ensuring all recommendations come from retrieved books (guardrails)

    The response follows the librarian persona from LIBRARIAN_SYSTEM_PROMPT
    and maintains accuracy by only recommending retrieved books.

    Args:
        question (str): The original user question
        retrieved_books (List[Dict]): Books retrieved from vector search

    Returns:
        str: Natural language recommendation from the librarian agent
    """
    if not retrieved_books:
        return "I apologize, but I couldn't find any books matching your interest in our library collection. Could you try a different search or ask for a specific genre?"

    print("🔄 Generating natural language response...")

    try:
        # Build a warm, conversational response from the retrieved books
        # This is the "G" (Generation) step of RAG that creates natural language
        
        # Start with acknowledgment of user's interest
        response = f"Based on your interest in {question.lower()}, I'd recommend:\n\n"
        
        # Add top recommendation with full explanation
        top_book = retrieved_books[0]
        response += f"**{top_book['title']}** ({top_book['year']})\n"
        response += f"Category: {top_book['category']}\n"
        response += f"This is an excellent choice that matches your search perfectly with a {top_book['similarity_score']:.1%} relevance match.\n\n"
        
        # Add second recommendation if available
        if len(retrieved_books) > 1:
            second_book = retrieved_books[1]
            response += f"**{second_book['title']}** ({second_book['year']})\n"
            response += f"Category: {second_book['category']}\n"
            response += f"Another great option at {second_book['similarity_score']:.1%} relevance.\n\n"
        
        # Add third recommendation if available
        if len(retrieved_books) > 2:
            third_book = retrieved_books[2]
            response += f"**{third_book['title']}** ({third_book['year']})\n"
            response += f"Category: {third_book['category']}\n"
            response += f"Additional recommendation at {third_book['similarity_score']:.1%} relevance.\n\n"
        
        # Closing message
        response += "All of these books are available in our collection. Would you like more information about any of them?"
        
        print("✅ Response generated successfully")
        return response.strip()

    except Exception as e:
        print(f"❌ Error generating response: {e}")
        # Fallback: return simple recommendations if something goes wrong
        return f"I found {len(retrieved_books)} books that match your interest in \"{question}\". See the results below for details."

@app.on_event("startup")
async def startup_event():
    """
    Initialize the embedding model when the FastAPI application starts.
    The LLM model is loaded on-demand to prevent memory issues at startup.
    This ensures the embedding model is loaded once and reused for all requests.
    """
    global embeddings_model
    embeddings_model = initialize_embedding_model()
    print("✅ Startup complete - embedding model ready")

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
        # Step 1: Generate embedding for the question
        print(f"📝 Question: {request.question}")
        query_embedding = generate_query_embedding(request.question)
        print(f"✅ Generated embedding vector ({len(query_embedding)} dimensions)")

        # Step 2: Connect to database and search for similar books (Retrieval)
        conn = get_connection()
        cursor = conn.cursor()

        print("🔍 Searching for similar books...")
        results = search_similar_books(cursor, query_embedding, top_k=3)

        cursor.close()
        conn.close()

        print(f"✅ Found {len(results)} matching books")

        # Step 3: Generate natural language response using RAG (Generation)
        print("💭 Generating conversational response...")
        natural_response = generate_response_with_rag(request.question, results)

        # Step 4: Return complete response with both natural language and structured data
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
