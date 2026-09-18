# Backend & Database Application: Rainbow Ready Mades

> **Branch:** `feature/backend-database`  
> **Lead:** Developer 2 (Backend & Database Developer)  
> **Status:** Planned / Architecture Foundation Set  

---

## 1. Overview & Objectives
Developer 2 is responsible for engineering the core transactional engine, REST APIs, database models, business logic, authentication, and administrative controls for Rainbow Ready Mades.

---

## 2. Planned Technology Stack
* **Language & Runtime:** Python 3.10+
* **Web Framework:** FastAPI (Asynchronous, High-Performance, OpenAPI native)
* **Data Validation:** Pydantic v2
* **ORM & Database Toolkit:** SQLAlchemy 2.0 (Declarative Mapping)
* **Database Engine:** PostgreSQL (Target) / SQLite (Local prototyping)
* **Migrations:** Alembic
* **Authentication & Crypto:** Passlib (`bcrypt`), PyJWT (`HS256`)
* **Server Runner:** Uvicorn

---

## 3. Directory Structure (Recommended for Developer 2)
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app entry point & middleware
│   ├── config.py                # Pydantic Settings reading .env
│   ├── database.py              # SQLAlchemy engine & SessionLocal
│   ├── models/                  # SQLAlchemy ORM database models
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   ├── order.py
│   │   └── return_req.py
│   ├── schemas/                 # Pydantic request/response validation schemas
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── cart.py
│   ├── routers/                 # Modular API endpoints
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── orders.py
│   │   ├── returns.py
│   │   └── admin.py
│   ├── services/                # Business logic (order total, auth token)
│   └── seed/                    # Database seeder using business-data/
│       └── seed_data.py
├── requirements.txt
└── README.md
```

---

## 4. API Implementation Checklist
Follow the specifications in [docs/api-contract.md](../docs/api-contract.md):
* [ ] `POST /api/v1/auth/register` & `POST /api/v1/auth/login`
* [ ] `GET /api/v1/products` (with query filtering for category, price, search)
* [ ] `GET /api/v1/products/{id}`
* [ ] `POST /api/v1/products` (Admin protected)
* [ ] `GET /api/v1/cart`, `POST /api/v1/cart/items`, `DELETE /api/v1/cart/items/{id}`
* [ ] `POST /api/v1/orders` (Generates atomic order record and unique tracking number)
* [ ] `GET /api/v1/orders` & `GET /api/v1/orders/{id}`
* [ ] `POST /api/v1/returns` & `GET /api/v1/returns/{id}`
* [ ] Proxy or mount route for `POST /api/v1/chat` from Developer 3

---

## 5. Developer 2 First Steps
1. Checkout the assigned branch:
   ```bash
   git checkout feature/backend-database
   git pull origin main
   ```
2. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   ```
3. Create `requirements.txt` with core dependencies:
   ```text
   fastapi>=0.110.0
   uvicorn[standard]>=0.28.0
   sqlalchemy>=2.0.28
   pydantic>=2.6.4
   pydantic-settings>=2.2.1
   passlib[bcrypt]>=1.7.4
   pyjwt>=2.8.0
   python-multipart>=0.0.9
   psycopg2-binary>=2.9.9
   pytest>=8.1.0
   ```
4. Define SQLAlchemy models matching [docs/database-schema.md](../docs/database-schema.md).
5. Build the seed script in `backend/app/seed/seed_data.py` to ingest the verified products from `business-data/products/`.
6. Implement `GET /api/v1/products` and run Uvicorn to unblock Developer 1.
