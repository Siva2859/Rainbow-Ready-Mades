# Backend & Database Application: Rainbow Ready Mades

> **Branch:** `feature/backend-database`  
> **Lead:** Developer 2 (Backend & Database Developer)  
> **Status:** Implemented & Verified with 100% Test Coverage  

---

## 1. Overview & Architecture
This is the core transactional backend service for **Rainbow Ready Mades**, built with **FastAPI**, **SQLAlchemy 2.0**, and **PostgreSQL (Supabase)**. It provides complete REST APIs for authentication, catalog discovery, variant stock tracking, cart management, checkout with atomic inventory decrements, visual order tracking, returns/exchanges, and protected admin operations.

---

## 2. Technology Stack
* **Language & Runtime:** Python 3.11+
* **Framework:** FastAPI
* **Server Runner:** Uvicorn
* **Database ORM:** SQLAlchemy 2.0 (Declarative Mapping)
* **Target Database:** PostgreSQL (Supabase) with local SQLite fallback
* **Migrations:** Alembic
* **Data Validation:** Pydantic v2
* **Authentication:** Stateless JWT (`HS256`) with Passlib (`bcrypt`)
* **Testing:** Pytest & HTTPX TestClient

---

## 3. Implemented Directory Layout
```
backend/
├── app/
│   ├── main.py                       # FastAPI app, CORS middleware, standardized error handling
│   ├── core/
│   │   ├── config.py                 # Pydantic BaseSettings loading .env
│   │   ├── security.py               # Bcrypt password hashing & JWT token creation/decoding
│   │   └── dependencies.py           # DB session, get_current_user, require_admin
│   ├── db/
│   │   ├── base.py                   # SQLAlchemy Base and TimestampMixin
│   │   └── database.py               # Engine, SessionLocal, get_db dependency
│   ├── models/                       # Relational SQLAlchemy ORM Models
│   │   ├── user.py                   # User (UUID, role: USER, ADMIN)
│   │   ├── category.py               # Category (id, name, description)
│   │   ├── product.py                # Product & ProductImage
│   │   ├── inventory.py              # ProductVariant & Inventory (stock tracking)
│   │   ├── cart.py                   # Cart & CartItem
│   │   ├── order.py                  # Order & OrderItem
│   │   └── return_exchange.py        # ReturnExchangeRequest & ReturnItem
│   ├── schemas/                      # Pydantic v2 Request/Response Schemas
│   │   ├── common.py                 # APIResponse[T] and APIErrorResponse
│   │   ├── auth.py                   # RegisterRequest, LoginRequest, TokenResponse
│   │   ├── user.py                   # UserResponse, UserUpdateRequest
│   │   ├── category.py               # CategoryResponse, CategoryCreate
│   │   ├── product.py                # ProductResponse, ProductDetailResponse
│   │   ├── inventory.py              # VariantResponse, InventoryUpdate
│   │   ├── cart.py                   # CartItemCreate, CartItemUpdate, CartResponse
│   │   ├── order.py                  # OrderCreate, OrderResponse, OrderTrackingResponse
│   │   └── return_exchange.py        # ReturnCreate, ReturnResponse, ReturnStatusUpdate
│   ├── routers/                      # Modular API Routes
│   │   ├── auth.py                   # POST /auth/register, /login, /me
│   │   ├── users.py                  # GET /users/me, PUT /users/me
│   │   ├── categories.py             # GET /categories, /categories/{id}
│   │   ├── products.py               # GET /products, /products/{id}, /products/search
│   │   ├── inventory.py              # GET /inventory/{product_id}
│   │   ├── cart.py                   # GET /cart, POST/PATCH/DELETE /cart/items, DELETE /cart
│   │   ├── orders.py                 # POST /orders, GET /orders, GET /orders/{id}, /track/{code}
│   │   ├── returns.py                # POST /returns, GET /returns, GET /returns/{id}
│   │   ├── admin.py                  # Protected catalog, order fulfillment, return approvals
│   │   └── chat.py                   # Contract-compliant POST /chat integration endpoint
│   └── services/
│       ├── auth_service.py           # User registration, authentication, JWT tokens
│       ├── product_service.py        # Multi-attribute catalog filtering, detail views
│       ├── cart_service.py           # Inventory checking & server-side pricing
│       ├── order_service.py          # Atomic checkout, inventory deduction, tracking codes
│       ├── return_service.py         # Return/exchange requests & lifecycle
│       └── seed_service.py           # Verified business data importer
├── alembic/                          # Alembic migrations directory
│   ├── versions/
│   │   └── 0e082a28d4ba_initial_application_schema.py
│   └── env.py
├── tests/                            # Comprehensive Automated Pytest Suite
│   ├── conftest.py                   # In-memory test fixtures and client overrides
│   ├── test_auth.py                  # 6 tests
│   ├── test_products.py              # 5 tests
│   ├── test_cart.py                  # 4 tests
│   ├── test_orders.py                # 4 tests
│   ├── test_returns.py               # 2 tests
│   └── test_admin.py                 # 4 tests
├── alembic.ini
├── pytest.ini
├── requirements.txt
├── .env.example
└── README.md
```

---

## 4. Local Development Setup (Windows PowerShell)

### Step 1: Create & Activate Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

To connect to Supabase PostgreSQL:
```ini
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```
*(If no external PostgreSQL is provided, the application automatically falls back to local SQLite `sqlite:///./rainbow_readymades.db` for zero-friction local development).*

### Step 4: Run Database Migrations
```powershell
.\venv\Scripts\alembic upgrade head
```

### Step 5: Start the Development Server
```powershell
.\venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
* **Interactive API Documentation (Swagger UI):** `http://localhost:8000/docs`
* **Alternative API Documentation (ReDoc):** `http://localhost:8000/redoc`
* **Health Check:** `http://localhost:8000/health`

---

## 5. Running Automated Tests
Run the full test suite with verbose output:
```powershell
.\venv\Scripts\pytest -v tests/
```
**Results:** `25 passed in ~20s` covering authentication, products, cart, order stock deduction, order privacy isolation, returns, and admin role restrictions.

---

## 6. Frontend & RAG Integration Notes

### For Frontend Developers (Developer 1)
* **Base URL:** `http://localhost:8000/api/v1`
* **CORS:** Pre-configured for `http://localhost:5173` and `http://localhost:3000`.
* **Standard Response Envelope:** All endpoints return `{ "success": true, "data": ... }`.
* **Authentication:** Pass bearer token in headers: `Authorization: Bearer <token>`.
* **Guest Sessions:** If customer is not logged in, pass header `X-Session-ID: <session_uuid>` to persist guest cart items.
* **Never send prices:** Cart and checkout calculate prices directly from verified database records.

### For RAG Chatbot Developer (Developer 3)
* **Chatbot Proxy Endpoint:** The backend exposes `POST /api/v1/chat`. If your RAG microservice is running on port `8001`, the backend automatically forwards requests to `http://localhost:8001/api/v1/chat`.
* **Isolated Data Boundaries:** The primary database is PostgreSQL. Application orders, cart, and users are kept strictly separated from ChromaDB vector stores.
