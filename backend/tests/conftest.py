import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from decimal import Decimal

from app.main import app
from app.db.base import Base
from app.db.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.inventory import ProductVariant, Inventory

# Use an in-memory SQLite database specifically for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Creates fresh database tables for each test function."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Provides a TestClient overriding the get_db dependency with test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def regular_user(db_session: Session) -> User:
    """Creates a standard test customer."""
    user = User(
        email="customer@example.com",
        full_name="Priya Customer",
        hashed_password=get_password_hash("SecretPassword123!"),
        phone_number="+919876543210",
        role="USER",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def admin_user(db_session: Session) -> User:
    """Creates a store admin user."""
    admin = User(
        email="admin@example.com",
        full_name="Store Admin",
        hashed_password=get_password_hash("AdminPass123!"),
        phone_number="+919876543211",
        role="ADMIN",
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(client: TestClient, regular_user: User) -> dict:
    """Generates Authorization header for the regular customer."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "customer@example.com",
        "password": "SecretPassword123!"
    })
    token = resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client: TestClient, admin_user: User) -> dict:
    """Generates Authorization header for the store admin."""
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "AdminPass123!"
    })
    token = resp.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_product(db_session: Session) -> Product:
    """Creates a sample category, product, variant, and inventory in test DB."""
    category = Category(
        id="womens-ethnic",
        name="Women's Ethnic",
        description="Authentic traditional wear"
    )
    db_session.add(category)
    db_session.flush()

    product = Product(
        id="prod_test_001",
        category_id=category.id,
        title="Pure Cotton Anarkali Kurti",
        description="Handcrafted pure cotton kurti with delicate border embroidery.",
        price=Decimal("1299.00"),
        discount_price=Decimal("1099.00"),
        material="100% Breathable Cotton",
        care_instructions="Cold hand wash.",
        is_featured=True,
        is_active=True
    )
    db_session.add(product)
    db_session.flush()

    img = ProductImage(
        product_id=product.id,
        image_url="/assets/products/kurti_main.jpg",
        is_primary=True,
        display_order=0
    )
    db_session.add(img)

    for size in ["M", "L", "XL"]:
        for color in ["Indigo Blue", "Maroon"]:
            var = ProductVariant(
                product_id=product.id,
                size=size,
                color=color
            )
            db_session.add(var)
            db_session.flush()

            inv = Inventory(
                product_id=product.id,
                variant_id=var.id,
                size=size,
                color=color,
                stock_quantity=10
            )
            db_session.add(inv)

    db_session.commit()
    db_session.refresh(product)
    return product
