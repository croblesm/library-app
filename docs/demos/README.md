# Demo Walkthroughs

Interactive HTML guides for presenting the Library App demos. Open any HTML file in a browser to follow along with copy-paste prompts, voiceover scripts, and step-by-step instructions.

## Demos

### Demo 1: Schema Designer + GitHub Copilot (~15 min)

**File:** [schema-designer-demo.html](schema-designer-demo.html)

Goes from hardcoded frontend data to a fully connected stack using the Schema Designer, GitHub Copilot, and Data API Builder -- all inside VS Code.

**What it covers:**
- Visual table design with Schema Designer
- GitHub Copilot generating table structures from JSON
- Many-to-many relationships and test data generation
- Data API Builder for instant REST APIs
- Wiring a React frontend to the live endpoint

### Demo 2: Making the App AI-Ready with SQL Server 2025 (~15 min)

**File:** [library-ai-ready-demo.html](library-ai-ready-demo.html)

Shows spec-driven development (PRD + custom instructions) and adds AI-powered semantic search using SQL Server 2025's VECTOR data type.

**What it covers:**
- Spec-driven development: PRD (`docs/PRD.md`) and GitHub Copilot custom instructions (`.github/copilot-instructions.md`)
- How custom instructions enforce SQL Server syntax, lowercase naming, and Sequelize conventions
- Adding VECTOR(768) columns and indexes with GitHub Copilot
- Embedding generation with Ollama (nomic-embed-text)
- Semantic search with SQL Server 2025's VECTOR_DISTANCE function
- FastAPI chat service for natural language book search

### Supporting Files

| File | Description |
|------|-------------|
| [github-copilot-demo.html](github-copilot-demo.html) | Standalone GitHub Copilot + MSSQL chat prompts (explore, create, reverse engineer) |
| [library-demo-flow.html](library-demo-flow.html) | End-to-end demo orchestration (Fabric provisioning + Schema Designer + AI) |

## How to Use

1. Open the HTML file in any browser (or use VS Code's Simple Browser)
2. Use the **Theme** toggle for dark/light mode
3. Click **Copy** buttons to copy prompts directly to your clipboard
4. Follow the voiceover scripts for presentation narration

## Key Project Files Referenced in Demos

| File | Referenced In | Purpose |
|------|---------------|---------|
| `docs/PRD.md` | Demo 2, Steps 1 | Product requirements -- defines data model, tech stack, conventions |
| `.github/copilot-instructions.md` | Demo 2, Step 2 | GitHub Copilot custom instructions -- enforces SQL Server, naming conventions |
| `AGENTS.md` | Demo 2, Step 3 | Cross-platform AI agent instructions (Codex, Cline, Windsurf, etc.) |
| `app/frontend/library-frontend/src/ModernApp.jsx` | Demo 1, Steps 3, 10 | React frontend with MAGAZINES_DATA array |
| `app/backend/ai/backfill_embeddings.py` | Demo 2, Step 8 | Python script to generate and store book embeddings |
| `app/backend/ai/chat_service.py` | Demo 2, Step 10 | FastAPI semantic search service |

## Resources

- [MSSQL Extension Demos](https://aka.ms/vscode-mssql-demos)
- [GitHub Copilot + MSSQL Extension Demos](https://aka.ms/vscode-mssql-copilot-demos)
- [Schema Designer + GitHub Copilot Docs](https://aka.ms/vscode-mssql-schema-designer-copilot-docs)
- [Data API Builder (DAB) Docs](https://aka.ms/vscode-mssql-dab-docs)
- [Data API Builder + GitHub Copilot Docs](https://aka.ms/vscode-mssql-dab-copilot-docs)
