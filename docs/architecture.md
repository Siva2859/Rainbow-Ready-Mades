# System Architecture: Rainbow Ready Mades

> **Status:** Planned / Target Architecture  
> **Applicable For:** X-Factor LevelX Phase 2 — Solve  

---

## 1. Architectural Overview

The Rainbow Ready Mades platform is designed as a decoupled, multi-tier system engineered specifically for high reliability, zero-hallucination conversational assistance, and clean separation of concerns among the three developers.

### Conceptual Global Architecture

```
                         CUSTOMER
                            │
                            ▼
                   ┌─────────────────┐
                   │    FRONTEND     │
                   │  E-Commerce UI  │
                   └────────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       ┌──────────────┐           ┌────────────────┐
       │   BACKEND    │           │  CHATBOT API   │
       │   FastAPI    │           │      RAG       │
       └──────┬───────┘           └───────┬────────┘
              │                           │
              ▼                           ▼
       ┌──────────────┐           ┌────────────────┐
       │  PostgreSQL  │           │  Vector Store  │
       │   Database   │           │   Embeddings   │
       └──────────────┘           └───────┬────────┘
                                          │
                                          ▼
                                  ┌────────────────┐
                                  │ Business Data  │
                                  │ Rainbow Ready  │
                                  │     Mades      │
                                  └────────────────┘
```

---

## 2. Primary Subsystem Data Flows

### A. Customer Transactional Flow (E-Commerce)
This pipeline handles core retail operations: browsing products, managing cart items, placing orders, and tracking status.

```
CUSTOMER
   │
   ▼
FRONTEND (React / Modern Web UI)
   │
   ▼ (REST JSON API calls via HTTP)
BACKEND (FastAPI Application Server)
   │
   ▼ (SQLAlchemy ORM Queries & Transactions)
DATABASE (PostgreSQL / SQLite)
```

**Flow Steps:**
1. **Browse:** Customer requests catalog; Frontend fetches `GET /api/v1/products` from Backend; Backend queries `products` and `inventory` tables.
2. **Cart Management:** Customer adds items; Cart state persists in backend session/database via `POST /api/v1/cart/items`.
3. **Checkout:** Customer submits shipping address and payment method; Backend creates an atomic transaction in `orders` and `order_items`, updating inventory counts.
4. **Tracking & Returns:** Customer views order progress or initiates an exchange via `GET /api/v1/orders/{id}` or `POST /api/v1/returns`.

---

### B. Conversational Assistance Flow (Grounded RAG)
This pipeline handles customer questions regarding real products, size charts, store opening hours, location, and return policies.

```
CUSTOMER QUESTION
   │
   ▼
CHATBOT (Frontend Widget)
   │
   ▼
RETRIEVER (Semantic Search Engine)
   │
   ▼
VECTOR DATABASE (ChromaDB / Embedding Store)
   │
   ▼
RELEVANT BUSINESS DATA (Verified Rainbow Ready Mades Knowledge)
   │
   ▼
LLM (Gemini 1.5/2.0 Flash with Guardrail Prompt)
   │
   ▼
GROUNDED ANSWER (100% Verified, Brand-Safe Response)
```

**Flow Steps:**
1. Customer asks: *"What is the exchange period for cotton kurtis?"*
2. Chatbot frontend widget submits query to `POST /api/v1/chat`.
3. Retriever generates vector embedding using `text-embedding-004`.
4. Cosine similarity search matches against pre-ingested `business-data/policies/` chunks.
5. Top relevant chunks are formatted into a context block and passed to Gemini LLM with strict instructions: *"Answer ONLY using this context. Never speculate."*
6. LLM formulates a polite, concise, grounded response citing store policy.

---

### C. Fallback Flow (Unknown / Out-of-Scope Queries)
**The chatbot is explicitly engineered NEVER to invent business information.**

```
USER QUESTION (e.g., "Do you sell laptops?" or "What's the weather?")
   │
   ▼
RETRIEVER SEARCH (Vector Database Query)
   │
   ▼
NO VERIFIED INFORMATION (Similarity Score < 0.65 Threshold)
   │
   ▼
"I don't have verified information about that. Please contact Rainbow Ready Mades directly at +91-XXXXXXXXXX or visit our store."
```

**Guarantees:**
* If the retrieval pipeline returns zero chunks exceeding the similarity threshold, the request is intercepted **before or within the LLM prompt** to output the deterministic fallback refusal.
* Eliminates brand liability, incorrect pricing quotes, and fabricated return terms.

---

## 3. Subsystem Boundaries & Decoupling

| Layer | Technology (Target) | Assigned To | Interfaces Exposed | Interfaces Consumed |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Modern Web UI (HTML/CSS/JS, Vite + React) | Developer 1 | Customer browser UI, Admin UI | Backend REST APIs, Chatbot REST API |
| **Backend** | Python 3.10+, FastAPI, Pydantic | Developer 2 | OpenAPI REST endpoints on `/api/v1/*` | Database connections, Auth hashing |
| **Database** | PostgreSQL (Production) / SQLite (Dev) | Developer 2 | Relational schema, SQL dialect | None |
| **RAG AI Service** | Python, ChromaDB, Google GenAI SDK | Developer 3 | `/api/v1/chat` endpoint | Vector store index, Gemini API |
| **Business Data** | Markdown, JSON, Real Photography | Non-Laptop & Team | Static files in `business-data/` | Real shop source documents |

---

## 4. Security Architecture

1. **Zero Secret Leakage:** No API keys, database credentials, or JWT secrets committed to version control. All secrets injected via `.env`.
2. **Password Security:** All customer and admin passwords hashed using `bcrypt` / `argon2` before writing to database.
3. **Stateless JWT Authorization:** Protected endpoints require `Authorization: Bearer <token>` in headers. Role claims (`role: admin` vs `role: customer`) validated on protected routes.
4. **Cross-Origin Protection:** FastAPI CORS configured strictly for allowed frontend origins.
5. **Prompt Injection Mitigation:** Customer chat inputs are sanitized and enclosed within structured user delimiter blocks to prevent prompt overriding.
