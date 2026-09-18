# RAG & AI Chatbot Service: Rainbow Ready Mades

> **Branch:** `feature/rag-chatbot`  
> **Lead:** Developer 3 (RAG & AI Chatbot Developer)  
> **Status:** Planned / Architecture Foundation Set  

---

## 1. Overview & Objectives
Developer 3 is responsible for the intelligence layer of Rainbow Ready Mades. The assistant must answer shopper questions with 100% fidelity to verified store policies, garment specifications, opening hours, and location. It must strictly decline to answer unsupported questions using the deterministic fallback response.

---

## 2. Planned Technology Stack
* **Language & Runtime:** Python 3.10+
* **LLM:** Google Gemini 1.5 / 2.0 Flash (via `google-genai` / `langchain-google-genai`)
* **Embedding Model:** Google `text-embedding-004` or HuggingFace `sentence-transformers/all-MiniLM-L6-v2`
* **Vector Store:** ChromaDB (local persistent embedded storage)
* **Framework:** LangChain / LlamaIndex or clean native Python retriever
* **Serving Interface:** FastAPI router (`/api/v1/chat`)

---

## 3. Directory Structure (Recommended for Developer 3)
```
rag-chatbot/
├── data/
│   └── chroma_db/               # Local persistent ChromaDB files (git-ignored)
├── src/
│   ├── __init__.py
│   ├── ingest.py                # Reads business-data/, chunks, embeds, writes to ChromaDB
│   ├── retriever.py             # Cosine similarity search with >= 0.65 threshold gate
│   ├── generator.py             # Prompt builder and Gemini LLM caller
│   ├── guardrails.py            # Hallucination checks & deterministic fallback handler
│   └── router.py                # FastAPI router exposing POST /api/v1/chat
├── tests/
│   ├── test_grounding.py        # Verified questions evaluation suite
│   └── test_fallback.py         # Out-of-scope adversarial evaluation suite
├── requirements.txt
└── README.md
```

---

## 4. Key Rules for Developer 3
1. **Never use synthetic/fake business data:** Ingest solely from `business-data/`.
2. **Deterministic Fallback String:**
   When similarity score is below `0.65` or query is irrelevant, output:
   ```text
   I don't have verified information about that for Rainbow Ready Mades. Please contact the shop directly at +91-XXXXXXXXXX or visit our store.
   ```
3. **Response Structure for `POST /api/v1/chat`:**
   ```json
   {
     "success": true,
     "data": {
       "response": "...",
       "grounded": true,
       "source_documents": ["business-data/policies/return_exchange_policy.md"],
       "confidence_score": 0.89
     }
   }
   ```

---

## 5. Developer 3 First Steps
1. Checkout the assigned branch:
   ```bash
   git checkout feature/rag-chatbot
   git pull origin main
   ```
2. Create and activate a virtual environment:
   ```bash
   cd rag-chatbot
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   ```
3. Create `requirements.txt`:
   ```text
   google-genai>=0.1.1
   chromadb>=0.4.24
   sentence-transformers>=2.5.1
   pydantic>=2.6.4
   fastapi>=0.110.0
   pytest>=8.1.0
   ```
4. Build `src/ingest.py` to parse markdown and JSON files from `business-data/` into chunked ChromaDB collections.
5. Build `src/retriever.py` with cosine distance calculations and the `0.65` similarity threshold gate.
6. Test retrieval against the templates before integrating the LLM generation step.
