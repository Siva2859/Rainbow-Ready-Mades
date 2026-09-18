# Development Workflow & Engineering Standards

> **Project:** Rainbow Ready Mades  
> **Hackathon:** X-Factor LevelX Phase 2 — Solve  
> **Team Governance:** Project Coordinator + 3 Developers + Business Researcher/QA  

---

## 1. Git Branching Strategy & Roles

The repository enforces a strict, conflict-free branching topology:

```
main (Integration & Release branch - Owned by Coordinator)
 ├── feature/frontend-ecommerce  (Assigned strictly to Developer 1)
 ├── feature/backend-database    (Assigned strictly to Developer 2)
 └── feature/rag-chatbot         (Assigned strictly to Developer 3)
```

### Branch Ownership Table
| Branch Name | Primary Assignee | Permitted Working Scope |
| :--- | :--- | :--- |
| `main` | **Project Coordinator** | Integration verification, release tagging, final demo builds. |
| `feature/frontend-ecommerce` | **Developer 1** | `frontend/`, UI styling, state management, client API calls. |
| `feature/backend-database` | **Developer 2** | `backend/`, FastAPI routes, SQLAlchemy models, database seeds. |
| `feature/rag-chatbot` | **Developer 3** | `rag-chatbot/`, embeddings, ChromaDB, RAG pipeline, `/api/v1/chat`. |

---

## 2. Standard Developer Daily Routine

Every developer must follow this 12-step cycle to prevent merge conflicts and coordination overhead:

```
[1. Clone Repository] ──► [2. Checkout Assigned Feature Branch]
                                   │
                                   ▼
                       [3. Pull Latest from main]
                       git pull origin main
                                   │
                                   ▼
                       [4. Develop in Local Branch]
                                   │
                                   ▼
                       [5. Test Locally]
                                   │
                                   ▼
                       [6. Commit with Semantic Message]
                                   │
                                   ▼
                       [7. Push Feature Branch]
                       git push origin feature/<name>
                                   │
                                   ▼
                       [8. Create Pull Request (PR) to main]
                                   │
                                   ▼
                       [9. Coordinator Reviews & Validates]
                                   │
                                   ▼
                       [10. PR Merged into main]
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 11. All Developers Pull Latest main to Sync      │
         │     git checkout feature/<name>                  │
         │     git pull origin main                         │
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
                       [12. Continue Next Feature]
```

---

## 3. Subsystem Interface Coordination

To maintain independent velocity without waiting on downstream completion:
1. **Frontend $\leftrightarrow$ Backend:**
   * Developer 1 (Frontend) will program against the agreed contract in [docs/api-contract.md](api-contract.md).
   * Developer 1 can use mock JSON responses or simple browser mock fetchers while Developer 2 builds the corresponding FastAPI endpoints.
2. **Backend $\leftrightarrow$ RAG Chatbot:**
   * Developer 3 will expose the standard `POST /api/v1/chat` interface as detailed in the API contract.
   * Developer 2 will either proxy `/api/v1/chat` to Developer 3's service or mount Developer 3's router directly into the primary FastAPI application.
3. **Business Research $\leftrightarrow$ All Developers:**
   * Non-Laptop Member inputs real shop data into `business-data/`.
   * Developer 2 uses this data to seed PostgreSQL/SQLite tables.
   * Developer 3 uses this data as the RAG embedding corpus.

---

## 4. Code Quality Guidelines

1. **Modular Architecture:** Keep files focused ($\le 250$ lines where feasible). Separate routing, database models, business services, and presentation components.
2. **Semantic Naming:** Use clear, self-describing variable and function identifiers (e.g. `calculate_cart_total()`, `fetch_product_by_id()` instead of `calc()`, `get_data()`).
3. **No Unnecessary Dependencies:** Keep lightweight packages. Do not install heavy frameworks unless strictly required.
4. **Input Validation:** Backend must validate every incoming payload using Pydantic models. Frontend must validate form fields before network transmission.
5. **Clean Error Handling:** Always handle potential failures (e.g. network drops, missing records, invalid credentials) gracefully with informative user-facing alerts.
6. **Meaningful Git Commits:**
   * Good: `feat(catalog): add category filter drawer with mobile touch toggle`
   * Good: `fix(auth): correct token expiration calculation in JWT helper`
   * Bad: `update`, `fixed bug`, `asdf`

---

## 5. Security Standards

* **No Hardcoded Secrets:** Never hardcode API keys, database credentials, passwords, or JWT secrets in source files.
* **Environment Configuration:** All sensitive values must be read from `.env` via environment variables. Ensure `.env` is listed in `.gitignore`.
* **Password Hashing:** Always hash passwords with `bcrypt` before storage. Never store plaintext credentials.
* **Role Verification:** Always verify `role == 'ADMIN'` in backend dependency injection for sensitive administrative endpoints (`POST /products`, `PUT /orders/{id}/status`).
* **Prompt Isolation:** Always wrap customer chat messages in delimited blocks inside LLM prompts to prevent prompt injection attacks.
