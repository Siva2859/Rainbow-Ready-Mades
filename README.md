# Rainbow Ready Mades — AI-Powered Local Retail E-Commerce & Grounded Support

> **Status:** Repository Initialized & Foundation Set *(Planned / Target Architecture Phase)*  
> **Hackathon:** X-Factor LevelX Phase 2 — Solve  
> **Track:** Real-Business AI Transformation  

---

## 1. Project Title
**Rainbow Ready Mades** — Modern E-Commerce Platform with Grounded AI Assistance for Local Retail.

---

## 2. Hackathon
Developed specifically for **X-Factor LevelX Phase 2 — Solve**. This project is engineered to solve acute digital transformation bottlenecks for a verified brick-and-mortar enterprise.

---

## 3. Real Business
* **Business Name:** Rainbow Ready Mades
* **Business Nature:** A real, established local clothing and ready-made garments retailer specializing in traditional, casual, and formal apparel for men, women, and children.
* **Core Philosophy:** Authentic, grounded community commerce. **We strictly reject mock data, generic boilerplate e-commerce catalogs, and synthetic business rules.** Every product, price, photograph, size availability, and store policy featured in the final product will be collected and verified directly from the actual shop.

---

## 4. Project Objective
To build and deploy a production-ready, mobile-responsive e-commerce web application coupled with a Retrieval-Augmented Generation (RAG) AI assistant. The platform transitions Rainbow Ready Mades from a local physical shop into a modern digital retail presence while preserving personal customer care through instant, 100% verified AI support.

---

## 5. Business Problem
As a traditional brick-and-mortar clothing boutique, Rainbow Ready Mades faces several operational bottlenecks:
1. **Limited Local Reach:** Customers must physically visit the store during operating hours to browse inventory, check sizes, or view new arrivals.
2. **Repetitive Support Overhead:** Shop staff spend hours daily fielding repetitive phone and messaging inquiries regarding stock status, pricing, alterations, operating hours, delivery radius, and exchange policies.
3. **Lost Sales & Order Friction:** Customers unable to visit during business hours often abandon purchases due to the lack of an online checkout, order tracking, and self-service return mechanisms.
4. **Generic Bot Ineffectiveness:** Standard generic chatbots often hallucinate product availability, quote wrong prices, or fabricate return policies, destroying customer trust.

---

## 6. Proposed Solution
An integrated retail platform engineered specifically for Rainbow Ready Mades:
* **Customer-Facing Web Store:** A fast, mobile-first e-commerce web application showcasing real apparel items, rich photography, category filtering, cart management, seamless checkout, order tracking, and online return requests.
* **Shop Admin Portal:** A streamlined merchant interface for managing inventory, tracking incoming customer orders, updating delivery stages, and processing exchange tickets.
* **Zero-Hallucination RAG AI Assistant:** An intelligent customer assistant embedded in the storefront, grounded strictly in Rainbow Ready Mades' verified business knowledge base (product catalog, size charts, store hours, return/exchange terms). When queried on topics outside verified records, the assistant provides a strict, polite fallback refusal rather than guessing.

---

## 7. Main Features *(Planned / Target MVP)*
1. **Real Product Catalog:** Filtered browsing across categories (e.g., Men's, Women's, Kids', Ethnic, Casual).
2. **Product Detail View:** Real images, fabric/material specifications, available color variants, and size availability.
3. **Faceted Search & Filtering:** Instant keyword search and multi-attribute filters.
4. **Shopping Cart:** Persistent item accumulation, size/color variant selection, dynamic subtotal calculations.
5. **Customer Checkout:** Streamlined order placement with customer address, contact details, and payment selection (Cash on Delivery / UPI / Store Pickup).
6. **Customer Authentication:** Secure account registration, login, session persistence, and order history.
7. **Order History & Real-Time Tracking:** Visual step-by-step progress tracker (Placed $\rightarrow$ Processing $\rightarrow$ Dispatched $\rightarrow$ Delivered).
8. **Self-Service Returns & Exchanges:** Digital return/exchange request filing with reason selection and status tracking.
9. **Admin Management Dashboard:** Administrative views to update products, adjust stock levels, update order stages, and approve returns.
10. **Embedded RAG Chatbot:** Conversational assistant widget available across the storefront.
11. **Strict Knowledge Grounding:** Contextual similarity search ensuring all generated responses are supported by verified business documentation.
12. **Defensive "I Don't Know" Fallback:** Explicit guardrails preventing speculative answers.
13. **Mobile-First Responsive Layout:** Fluid UI engineered for smartphones, tablets, and desktops.
14. **Direct WhatsApp Shop Connect:** Instant escalation option to chat directly with store staff.
15. **Clean Hackathon Architecture:** Decoupled frontend, REST backend, and AI pipeline allowing three developers to work concurrently without conflict.

---

## 8. User Journey *(Target Flow)*
```
[Visitor Lands on Storefront]
         │
         ▼
[Browse / Search Real Products] ──(Have a question?)──► [Ask RAG Chatbot]
         │                                                      │
         ▼                                              (Grounded Answer)
[Select Product, Size & Color]                                  │
         │                                                      │
         ▼                                                      │
[Add to Cart] ◄─────────────────────────────────────────────────┘
         │
         ▼
[Review Cart & Proceed to Checkout]
         │
         ▼
[Register / Login or Guest Profile]
         │
         ▼
[Submit Order & Receive Order ID + Tracking Code]
         │
         ▼
[Track Delivery Status in Real Time]
         │
         ▼
(Optional) [Initiate Return / Exchange Request from Order Details]
```

---

## 9. Admin Journey *(Target Flow)*
```
[Admin Authenticates at /admin/login]
         │
         ▼
[Admin Dashboard Overview: Orders, Inventory, Returns]
         │
    ┌────┴────────────────────────┬────────────────────────┐
    ▼                             ▼                        ▼
[Manage Catalog]          [Process Orders]         [Review Returns]
• Update stock levels     • View incoming orders   • Inspect return requests
• Add new arrivals        • Update shipment stage  • Approve / Reject
• Update pricing          • Mark delivered         • Issue exchange notes
```

---

## 10. RAG Chatbot Purpose
The Rainbow Ready Mades AI Chatbot serves as a digital in-store retail assistant. It bridges the gap between static web browsing and personal shop assistance by instantly answering shopper inquiries about garment fabrics, size guides, care instructions, store location, exchange windows, and delivery policies—freeing store staff from answering repetitive queries while boosting purchasing confidence.

---

## 11. How the Chatbot Works *(Planned Pipeline)*
```
   [Customer Input Query]
             │
             ▼
   [Embedding Generation (text-embedding-004)]
             │
             ▼
   [Vector Similarity Search in Vector DB (ChromaDB)]
             │
             ▼
   [Retrieve Top-K Chunks with Cosine Score >= Threshold]
             │
     ┌───────┴──────────────────────────────┐
     ▼                                      ▼
[Match Found (High Score)]        [No Verified Match (Low Score)]
     │                                      │
     ▼                                      ▼
[Inject Context into Strict Prompt]  [Bypass LLM / Return Refusal]
     │                                      │
     ▼                                      ▼
[LLM (Gemini) Generates Grounded Answer]  ["I don't have information..."]
     │                                      │
     └──────────────────┬───────────────────┘
                        ▼
            [Display Response in Chat UI]
```

---

## 12. What Data the Chatbot Uses
The chatbot's knowledge base is strictly isolated to **verified shop data** collected in `business-data/`:
* **Product Catalog:** Real garment names, categories, prices, fabric compositions, available sizes, care instructions.
* **Store Policies:** Official return period, exchange criteria, non-returnable items, tailoring/alteration terms.
* **Shop Coordinates & Operations:** Physical address, operating hours, landmark directions, holiday schedules, phone numbers, WhatsApp contact.
* **Delivery & Fulfillment:** Delivery zones, turnaround times, shipping charges, pickup options.
* **Frequently Asked Questions (FAQs):** Store-verified answers to common customer questions.

---

## 13. What Happens When Information is Unavailable
**The chatbot will NEVER hallucinate, guess, or extrapolate business policies.**  
If a customer asks an unsupported question (e.g., *"Do you sell laptop bags?"*, *"Can you give me a 50% discount?"*, or *"Who is the Prime Minister of France?"*):
1. The vector retrieval pipeline identifies that no stored chunk meets the required similarity threshold ($\text{score} < 0.65$).
2. The system triggers the designated fallback response:
   > *"I don't have verified information about that for Rainbow Ready Mades. Please contact the shop directly at [Shop Contact Number] or visit us at [Shop Address]."*
3. The chatbot preserves brand trust by strictly refusing to guess.

---

## 14. Overall System Architecture *(Target Architecture)*
The planned architecture cleanly decouples the customer-facing interface, the business transaction engine, and the AI retrieval service:

```
                         CUSTOMER / ADMIN
                                │
                                ▼
                       ┌─────────────────┐
                       │    FRONTEND     │
                       │ Modern Web UI   │
                       └────────┬────────┘
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
                  ▼                           ▼
           ┌──────────────┐           ┌────────────────┐
           │   BACKEND    │           │  CHATBOT API   │
           │   FastAPI    │           │  RAG Pipeline  │
           └──────┬───────┘           └───────┬────────┘
                  │                           │
                  ▼                           ▼
           ┌──────────────┐           ┌────────────────┐
           │  PostgreSQL  │           │  Vector Store  │
           │   Database   │           │   (ChromaDB)   │
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

## 15. Frontend *(Planned)*
* **Role:** Developer 1
* **Target Stack:** Modern Vanilla CSS + HTML / React (Vite)
* **Design Philosophy:** Vibrant, clean, mobile-first responsive layout tailored to a clothing boutique. Modern typography, soft card shadows, smooth transitions, high visual accessibility.
* **Key Modules:** Storefront Home, Catalog Grid, Search/Filter Drawer, Product Details View, Cart Sidebar/Modal, Checkout Screen, Customer Portal (Orders & Tracking), Returns Form, Embedded Floating Chatbot Window, Admin Dashboard.

---

## 16. Backend *(Planned)*
* **Role:** Developer 2
* **Target Stack:** Python (FastAPI) + Pydantic + SQLAlchemy
* **Characteristics:** Asynchronous REST API, strict request/response data validation, centralized error handling, and modular routing (`/auth`, `/products`, `/categories`, `/cart`, `/orders`, `/returns`, `/admin`).

---

## 17. Database *(Planned)*
* **Target Engine:** PostgreSQL (with SQLite support for rapid local development)
* **ORM:** SQLAlchemy ORM with declarative models
* **Key Entities:** `users`, `products`, `categories`, `product_images`, `inventory`, `cart`, `cart_items`, `orders`, `order_items`, `returns`, `return_items`, `faqs`, `business_information`.

---

## 18. RAG Pipeline *(Planned)*
* **Role:** Developer 3
* **Target Stack:** Python, LangChain / LlamaIndex / Native Python RAG, ChromaDB
* **Ingestion:** Pre-processing markdown and structured JSON from `business-data/`, cleaning formatting, applying metadata tagging (`source`, `category`, `last_verified`).
* **Chunking Strategy:** Domain-specific chunking (individual products chunked as complete atomic units; policies chunked by individual clause/topic).

---

## 19. LLM *(Planned)*
* **Target Model:** Google Gemini 1.5 / 2.0 Flash via Google GenAI SDK
* **Prompt Strategy:** System instructions enforcing zero-extrapolation, strict grounding on retrieved context snippets, polite refusal on context absence, and persona alignment with Rainbow Ready Mades store staff.

---

## 20. Vector Database *(Planned)*
* **Target Engine:** ChromaDB (local persistent embedded vector database)
* **Embedding Model:** Google `text-embedding-004` (or `sentence-transformers/all-MiniLM-L6-v2`)
* **Index Strategy:** Cosine similarity with distance threshold filtering to suppress out-of-domain queries.

---

## 21. API Communication *(Target Protocol)*
* **Format:** JSON over HTTPS REST
* **Contract Specification:** Detailed in [docs/api-contract.md](docs/api-contract.md)
* **Standard Status Codes:**
  * `200 OK` / `201 Created` for successful transactions
  * `400 Bad Request` for invalid schemas
  * `401 Unauthorized` / `403 Forbidden` for role violations
  * `404 Not Found` for missing resources
  * `422 Unprocessable Entity` for validation errors
* **Cross-Origin Resource Sharing (CORS):** Managed centrally via FastAPI CORS Middleware for secure frontend consumption.

---

## 22. Authentication *(Planned)*
* **Protocol:** Stateless JSON Web Token (JWT) Bearer Authentication
* **Password Hashing:** Passlib with `bcrypt` / `argon2`
* **User Roles:**
  * `CUSTOMER`: Can view products, manage personal cart, place orders, view own order history, and submit return requests.
  * `ADMIN`: Access to inventory updates, order stage updates, catalog management, and return approvals.

---

## 23. Order Workflow *(Target Lifecycle)*
```
[Cart Filled]
      │
      ▼
[Checkout Submitted] ──► [Order Created (Status: PENDING)]
                               │
                               ▼
                    [Admin Confirms Order (Status: CONFIRMED)]
                               │
                               ▼
                    [Packed & In Transit (Status: DISPATCHED)]
                               │
                               ▼
                    [Delivered to Customer (Status: DELIVERED)]
```

---

## 24. Return / Exchange Workflow *(Target Lifecycle)*
```
[Customer Views Delivered Order]
                │
                ▼
[Clicks "Request Return / Exchange"]
                │
                ▼
[Selects Item, Quantity, Reason & Action (Return vs Exchange)]
                │
                ▼
[Return Record Created (Status: REQUESTED)]
                │
                ▼
[Admin Reviews Return in Dashboard]
        ├── Approved ──► [Status: APPROVED] ──► [Pickup / Exchange Scheduled]
        └── Rejected ──► [Status: REJECTED] ──► [Reason Communicated to Customer]
```

---

## 25. Development Team Roles

| Role | Name / Assignee | Core Responsibilities | Target Feature Branch |
| :--- | :--- | :--- | :--- |
| **Project Coordinator** | User | Requirements coordination, business communication, PR review & merge, system integration, end-to-end testing, final pitch deck & demo lead. | `main` |
| **Developer 1** | Frontend & E-Commerce Developer | Customer UI, responsive layout, catalog browsing, cart, checkout, auth screens, tracking UI, returns form, chatbot UI widget integration. | `feature/frontend-ecommerce` |
| **Developer 2** | Backend & Database Developer | REST API endpoints, database models, migrations, auth/JWT, order processing, return pipeline, admin endpoints, frontend/chatbot API support. | `feature/backend-database` |
| **Developer 3** | RAG & AI Chatbot Developer | Knowledge base ingestion, chunking, embeddings, ChromaDB vector store, RAG retrieval pipeline, Gemini LLM prompting, fallback guardrails, `/api/v1/chat` endpoint. | `feature/rag-chatbot` |
| **Non-Laptop Member** | Business Research & QA | On-site data collection at Rainbow Ready Mades (real products, prices, sizes, materials, photos, policies, FAQs), template population, customer-perspective QA. | Direct coordination with Coordinator |

---

## 26. Git Branching Strategy
The repository maintains a strict four-branch structure:

```
main (Coordinator integration & production-ready releases)
 ├── feature/frontend-ecommerce  (Developer 1)
 ├── feature/backend-database    (Developer 2)
 └── feature/rag-chatbot         (Developer 3)
```

### Golden Rules:
1. **Never commit directly to `main`:** Only the Project Coordinator merges Pull Requests into `main`.
2. **Pull latest `main` before starting work:** `git pull origin main` daily.
3. **Stay in your designated feature branch:** Never modify other components without coordination.
4. **No credentials or secrets in Git:** Strictly keep `.env` excluded.
5. **No force-pushing:** `git push --force` is prohibited.

---

## 27. Local Development Setup *(Planned Instructions)*

### Prerequisites:
* Python 3.10+
* Node.js 18+ & npm
* Git

### Step-by-Step Initialization:
```bash
# 1. Clone the repository
git clone <repository_url>
cd "Rainbow Readymades"

# 2. Check out your assigned branch
# Developer 1: git checkout feature/frontend-ecommerce
# Developer 2: git checkout feature/backend-database
# Developer 3: git checkout feature/rag-chatbot

# 3. Create local environment configuration
cp .env.example .env

# 4. Backend Setup (Developer 2 & Team integration)
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 5. Frontend Setup (Developer 1 & Team integration)
cd ../frontend
npm install
npm run dev

# 6. RAG Chatbot Ingestion (Developer 3)
cd ../rag-chatbot
python ingest.py
```

---

## 28. Environment Variables
Reference [.env.example](.env.example) for the complete list of planned environment configuration parameters.

---

## 29. Testing Strategy
* **Unit Testing:** Backend business logic (order tax/discount calculation, password hashing, cart operations) via `pytest`.
* **API Contract Testing:** Validating FastAPI endpoints against the documented [docs/api-contract.md](docs/api-contract.md) schema.
* **RAG Grounding & Hallucination Testing:** A designated test suite of 20 verified questions (testing accuracy and citation) and 15 unsupported questions (verifying strict "I don't know" fallback).
* **Manual Cross-Device QA:** Verified on mobile devices and desktop by the Non-Laptop QA member.

---

## 30. Deployment Plan *(Target)*
* **Frontend:** Hosted on Vercel / Netlify / Cloudflare Pages.
* **Backend API & Chatbot Service:** Containerized (Docker) and deployed on Render / Railway / Google Cloud Run.
* **Database:** Managed PostgreSQL instance on Supabase / Neon / Render PostgreSQL.

---

## 31. Future Improvements *(Post-Hackathon Roadmap)*
* Multi-language support (Tamil, Hindi, Telugu, English) for localized customer engagement.
* Live WhatsApp Business Cloud API integration for direct messaging order confirmation.
* Automated visual virtual try-on / size recommendation using customer body measurements.
* Barcode / RFID scanner integration for real-time in-store inventory syncing.
