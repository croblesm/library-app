# Making the Library App AI-Ready with SQL Server 2025

This demo shows how to transform an existing SQL Server–backed Library application into an AI-powered search system using SQL Server 2025's new VECTOR data type and vector similarity search capabilities.

## 🎯 Overview

The Library app was built with Node.js and Sequelize, but for this AI enhancement, we work outside the ORM layer. Instead, we:

1. Add a `VECTOR(1536)` column to store book embeddings (based on title + category)
2. Create a Python script to generate and backfill embeddings using a local model
3. Build a FastAPI chat service that performs semantic search using SQL Server 2025's vector functions
4. Use GitHub Copilot to help understand the schema and generate the necessary SQL

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **SQL Server 2025** with VECTOR data type support
- ✅ **VS Code** with MSSQL extension installed
- ✅ **GitHub Copilot** subscription and extension installed
- ✅ **Python 3.8+** installed
- ✅ **Library app** running (Node.js backend + SQL Server database)
- ✅ A local embedding model container or API access (optional)

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the root of your project (or update `app/backend/.env`) with your SQL Server connection string:

```env
MSSQL_CONNECTION_STRING=Server=localhost;Database=Library;UID=sa;PWD=your-password;TrustServerCertificate=yes;
```

**Important:** The `mssql-python` driver uses `UID` and `PWD` (not `User Id` and `Password`).

Replace the values with your actual SQL Server credentials.

**Connection string formats:**
- **Local SQL Server:** `Server=localhost;Database=Library;UID=sa;PWD=your-password;TrustServerCertificate=yes;`
- **Azure SQL:** `Server=your-server.database.windows.net;Database=Library;UID=your-user;PWD=your-password;Encrypt=yes;`

### 2. Run a Local Embedding Model with Ollama

This demo uses Ollama for simple, local embedding model management.

#### Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com/download](https://ollama.com/download)

#### Start Ollama Server

```bash
ollama serve
```

Keep this terminal running. Open a new terminal for the next steps.

#### Pull the Embedding Model

```bash
# Pull the nomic-embed-text model (768-dimensional embeddings)
ollama pull nomic-embed-text
```

#### Verify the Model is Ready

```bash
ollama list
```

You should see `nomic-embed-text` in the list.

### 3. Install Python Dependencies

Install the required Python packages:

```bash
pip install mssql-python python-dotenv langchain langchain-community fastapi uvicorn
```

**Package descriptions:**
- `mssql-python` - Official Microsoft SQL Server driver for Python
- `python-dotenv` - Load environment variables from `.env` file
- `langchain` - Framework for building LLM applications
- `langchain-community` - Community integrations including Ollama embeddings
- `fastapi` - Modern web framework for building APIs
- `uvicorn` - ASGI server for running FastAPI

### 4. Prepare the Database Schema

The demo assumes your Books table already has the following schema changes applied. If not, run these SQL statements:

```sql
-- Add VECTOR column to store embeddings (768-dimensional for nomic-embed-text)
ALTER TABLE books
ADD description_embedding VECTOR(768) NULL;

-- Create index for optimal vector search performance
CREATE INDEX IX_books_description_embedding
ON books(description_embedding);
```

You can use GitHub Copilot in the MSSQL extension to help generate these statements. Simply ask:

> "Add a VECTOR(768) column called description_embedding to the books table and create an index on it"

### 5. Run the Embedding Backfill Script

Generate embeddings for all existing books in the database:

```bash
cd app/backend/ai
python backfill_embeddings.py
```

**What this script does:**
1. Loads the SQL connection string from `.env`
2. Connects to SQL Server using the `mssql-python` driver
3. Connects to Ollama embedding service (must be running: `ollama serve`)
4. Queries all books from the books table (lowercase column names match Sequelize schema)
5. Generates embeddings from book title + category (since there's no description column)
6. Generates 768-dimensional embeddings using Ollama's nomic-embed-text model
7. Updates the `description_embedding VECTOR` column for each book

**Expected output:**
```
============================================================
📚 Library AI Embeddings Backfill Script
============================================================
✅ Successfully connected to SQL Server
🔄 Initializing Ollama embedding model...
✅ Embedding model loaded successfully
🔄 Fetching books from database...
✅ Found 24 books to process

🔄 Processing 24 books...
  Processing Book ID 1: Prelude to Foundation...
  Processing Book ID 2: Forward the Foundation...
  Processing Book ID 3: Foundation...
  ...

============================================================
✅ Backfill complete!
   Processed: 24 books
   Failed: 0 books
============================================================
```

### 6. Verify Embeddings Were Created

Run this SQL query to verify the embeddings:

```sql
SELECT TOP 5
    id,
    title,
    CASE
        WHEN description_embedding IS NOT NULL THEN 'Embedding exists'
        ELSE 'No embedding'
    END AS EmbeddingStatus
FROM books;
```

### 7. Start the Chat Service

Launch the FastAPI chat service:

```bash
cd app/backend/ai
python chat_service.py
```

The service will start on `http://localhost:8000`

**What this service does:**
1. Exposes a FastAPI POST `/chat` endpoint
2. Generates embeddings for user questions using Ollama's nomic-embed-text model
3. Performs vector similarity search using SQL Server 2025's `VECTOR_DISTANCE` function
4. Returns the top 3 most relevant books as JSON

**Expected output:**
```
============================================================
🚀 Starting Library Chat Service
============================================================
📍 API: http://localhost:8000
📚 Docs: http://localhost:8000/docs
============================================================
🔄 Initializing embedding model...
✅ Embedding model loaded
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 8. Test the Chat Endpoint

#### Option A: Using curl

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "I want to read science fiction about space exploration"
  }'
```

#### Option B: Using the Interactive API Docs

Visit `http://localhost:8000/docs` in your browser to access the Swagger UI and test the endpoint interactively.

#### Option C: Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/chat",
    json={"question": "I want to read science fiction about space exploration"}
)

print(response.json())
```

**Expected response:**

```json
{
  "question": "I want to read science fiction about space exploration",
  "results": [
    {
      "id": 9,
      "title": "2001: A Space Odyssey",
      "category": "Science Fiction",
      "year": 1968,
      "similarity_score": 0.89
    },
    {
      "id": 10,
      "title": "2010: Odyssey Two",
      "category": "Science Fiction",
      "year": 1982,
      "similarity_score": 0.85
    },
    {
      "id": 20,
      "title": "From the Earth to the Moon",
      "category": "Adventure",
      "year": 1865,
      "similarity_score": 0.78
    }
  ]
}
```

## 📁 Project Structure

```
library-app/
├── app/
│   └── backend/
│       └── ai/
│           ├── backfill_embeddings.py    # Script to generate and populate embeddings
│           └── chat_service.py            # FastAPI service for semantic search
├── library-ai-ready-demo.html     # Interactive step-by-step guide
├── README-ai-ready-demo.md        # This file
└── app/backend/.env               # Environment variables (connection string)
```

## 🧠 How It Works

### Embedding Generation

The `backfill_embeddings.py` script uses Ollama with the `nomic-embed-text` model to generate 768-dimensional embeddings.

**Why Ollama?**
- Simple installation and model management
- Runs entirely locally (no API keys needed)
- Fast and lightweight
- Easy to switch between different embedding models

**Alternative Embedding Models:**

1. **Ollama (default)** - Recommended for simplicity
   - `nomic-embed-text` (768-dim, balanced, fast)
   - `mxbai-embed-large` (1024-dim, higher accuracy)
   - Install: `ollama pull <model-name>`

2. **HuggingFace** - Alternative local option
   - `sentence-transformers/all-MiniLM-L6-v2` (384-dim)
   - `sentence-transformers/all-mpnet-base-v2` (768-dim)
   - No additional setup, downloads on first run

3. **OpenAI API** - Best quality, requires API key
   - `text-embedding-ada-002` (1536-dim)
   - Set `OPENAI_API_KEY` in your `.env` file

**Note:** If you change the embedding dimension, update the VECTOR column size to match (see Customization section below).

### Vector Similarity Search

The `chat_service.py` uses SQL Server 2025's `VECTOR_DISTANCE` function to perform semantic search:

```sql
SELECT TOP 3
    id,
    title,
    category,
    year,
    1 - VECTOR_DISTANCE('cosine', description_embedding, @QueryVector) AS SimilarityScore
FROM books
WHERE description_embedding IS NOT NULL
ORDER BY VECTOR_DISTANCE('cosine', description_embedding, @QueryVector) ASC;
```

**How it works:**
- `VECTOR_DISTANCE` calculates cosine distance between vectors
- Lower distance = more similar content
- We convert distance to similarity score: `1 - distance`
- `ORDER BY` ensures we get the most similar books first

## 🛠️ Customization

### Change the Embedding Model

#### Option 1: Use a Different Ollama Model

1. **Pull a different Ollama model:**
   ```bash
   ollama pull mxbai-embed-large  # 1024-dimensional embeddings
   ```

2. **Update both Python scripts:**
   ```python
   embeddings = OllamaEmbeddings(
       model="mxbai-embed-large",  # Change model name
       base_url="http://localhost:11434"
   )
   ```

3. **Update the VECTOR column size to match the model dimension:**
   ```sql
   ALTER TABLE books
   DROP COLUMN description_embedding;

   ALTER TABLE books
   ADD description_embedding VECTOR(1024) NULL;  -- mxbai-embed-large uses 1024
   ```

4. **Re-run the backfill script** to regenerate embeddings

#### Option 2: Use HuggingFace Model

1. **Update both Python scripts:**
   ```python
   # Replace the import
   from langchain_community.embeddings import HuggingFaceEmbeddings

   # Replace the embeddings initialization
   embeddings = HuggingFaceEmbeddings(
       model_name="sentence-transformers/all-mpnet-base-v2",  # 768-dim
       model_kwargs={'device': 'cpu'},
       encode_kwargs={'normalize_embeddings': True}
   )
   ```

2. **Install sentence-transformers:**
   ```bash
   pip install sentence-transformers
   ```

3. **Update the VECTOR column size** if dimension differs from 768

4. **Re-run the backfill script**

### Change the Number of Results

Edit `chat_service.py` and modify the `top_k` parameter in the `/chat` endpoint:

```python
results = search_similar_books(cursor, query_embedding, top_k=5)  # Change from 3 to 5
```

## 🎬 Interactive Demo Guide

For a complete step-by-step walkthrough with copy-paste prompts and code samples, open the interactive HTML guide:

```bash
# Open in your default browser
open library-ai-ready-demo.html

# Or on Linux
xdg-open library-ai-ready-demo.html

# Or on Windows
start library-ai-ready-demo.html
```

The HTML guide includes:
- Scenario introduction and context
- Step-by-step instructions with voiceover narration
- Copy buttons for all code snippets
- GitHub Copilot prompts to help generate SQL statements
- Testing examples and expected outputs
- Dark/light theme toggle

## 🐛 Troubleshooting

### Connection String Issues

If you get connection errors, verify your connection string format:

```env
# Local SQL Server with SQL Authentication
MSSQL_CONNECTION_STRING=Server=localhost;Database=Library;UID=sa;PWD=your-password;TrustServerCertificate=yes;

# Azure SQL Database
MSSQL_CONNECTION_STRING=Server=your-server.database.windows.net;Database=Library;UID=your-user;PWD=your-password;Encrypt=yes;

# Local SQL Server with Windows Authentication (not supported by mssql-python)
# Use SQL Authentication instead
```

**Note:** The `mssql-python` driver uses `UID` and `PWD` (not `User Id` and `Password`).

### Model Download Issues

If the HuggingFace model fails to download, you may need to:

1. Check your internet connection
2. Set a custom cache directory:
   ```python
   os.environ['TRANSFORMERS_CACHE'] = '/path/to/cache'
   ```
3. Pre-download the model:
   ```bash
   python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
   ```

### Vector Dimension Mismatch

If you get errors about vector dimensions not matching:

1. Check your model's output dimension
2. Ensure your VECTOR column size matches
3. Re-create the column if needed (see "Change the Embedding Model" section)

## 📚 Additional Resources

- [SQL Server 2025 VECTOR Documentation](https://learn.microsoft.com/sql/)
- [mssql-python Driver Documentation](https://github.com/microsoft/mssql-python)
- [LangChain Documentation](https://python.langchain.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Sentence Transformers Models](https://www.sbert.net/docs/pretrained_models.html)

## 🎯 What We Accomplished

In this demo, we successfully:

- ✅ Set up Ollama for simple, local embedding model management
- ✅ Added a `VECTOR(768)` column to the books table (lowercase naming matches Sequelize schema)
- ✅ Created a vector index for optimal search performance
- ✅ Built a Python script to generate and backfill embeddings using the `mssql-python` driver
- ✅ Used Ollama's `nomic-embed-text` model for 768-dimensional embeddings
- ✅ Used title + category for embeddings (since books table has no description column)
- ✅ Created a FastAPI chat service that performs vector similarity search
- ✅ Used GitHub Copilot to understand the schema and generate SQL statements
- ✅ Leveraged SQL Server 2025's native vector search capabilities

## 🚀 Next Steps

Want to explore further? Try these enhancements:

- 🔧 Integrate the chat service into the Library app's frontend UI
- 🔧 Experiment with different embedding models for better accuracy
- 🔧 Add hybrid search combining vector similarity with traditional keyword search
- 🔧 Implement caching to improve response times
- 🔧 Use Azure OpenAI for production-grade embeddings (text-embedding-ada-002)
- 🔧 Add metadata filtering to combine semantic search with traditional filters
- 🔧 Implement authentication and rate limiting for the API
- 🔧 Add monitoring and logging for production deployment

## 🙏 Feedback

Questions? Suggestions? We'd love to hear from you!

This demo showcases how SQL Server 2025, the new MSSQL extension for VS Code, and GitHub Copilot work together to make existing applications AI-ready.

Happy building! 🚀
