from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from app.models.user import User
from app.core.security import get_password_hash


def test_place_order_success_and_decrements_stock(
    client: TestClient,
    auth_headers: dict,
    sample_product,
    db_session: Session
):
    """Submitting order creates order records, decrements stock, and empties cart."""
    # 1. Add 2 items to cart
    client.post("/api/v1/cart/items", headers=auth_headers, json={
        "product_id": sample_product.id,
        "selected_size": "L",
        "selected_color": "Indigo Blue",
        "quantity": 2
    })

    # Initial inventory check
    inv_before = db_session.query(Inventory).filter(
        Inventory.product_id == sample_product.id,
        Inventory.size == "L",
        Inventory.color == "Indigo Blue"
    ).first()
    assert inv_before.stock_quantity == 10

    # 2. Place Order
    order_resp = client.post("/api/v1/orders", headers=auth_headers, json={
        "delivery_address": {
            "street": "12 Gandhi Road",
            "city": "Shop Local City",
            "postal_code": "600001",
            "phone": "+919876543210"
        },
        "payment_method": "CASH_ON_DELIVERY",
        "order_notes": "Call before delivery"
    })
    assert order_resp.status_code == 201
    order_data = order_resp.json()["data"]
    assert order_data["status"] == "PENDING"
    assert order_data["total_amount"] == 1099.0 * 2
    assert order_data["tracking_code"].startswith("RRM-TRK-")

    # 3. Verify Cart is now empty
    cart_resp = client.get("/api/v1/cart", headers=auth_headers)
    assert len(cart_resp.json()["data"]["items"]) == 0

    # 4. Verify Stock decremented from 10 to 8
    db_session.expire_all()
    inv_after = db_session.query(Inventory).filter(
        Inventory.product_id == sample_product.id,
        Inventory.size == "L",
        Inventory.color == "Indigo Blue"
    ).first()
    assert inv_after.stock_quantity == 8


def test_place_order_empty_cart_fails(client: TestClient, auth_headers):
    """Checking out with an empty cart returns 400."""
    resp = client.post("/api/v1/orders", headers=auth_headers, json={
        "delivery_address": "123 Main St",
        "payment_method": "CASH_ON_DELIVERY"
    })
    assert resp.status_code == 400
    assert resp.json()["success"] is False


def test_unauthorized_order_access(
    client: TestClient,
    auth_headers: dict,
    sample_product,
    db_session: Session
):
    """User B cannot access User A's private order (Privacy Isolation)."""
    # Place order as User A
    client.post("/api/v1/cart/items", headers=auth_headers, json={
        "product_id": sample_product.id,
        "selected_size": "M",
        "selected_color": "Maroon",
        "quantity": 1
    })
    order_resp = client.post("/api/v1/orders", headers=auth_headers, json={
        "delivery_address": "User A Address",
        "payment_method": "CASH_ON_DELIVERY"
    })
    order_id = order_resp.json()["data"]["order_id"]

    # Register and login as User B
    client.post("/api/v1/auth/register", json={
        "full_name": "User B",
        "email": "userb@example.com",
        "password": "Password123!"
    })
    login_b = client.post("/api/v1/auth/login", json={
        "email": "userb@example.com",
        "password": "Password123!"
    })
    token_b = login_b.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B attempts to access User A's order -> 403 Forbidden
    access_resp = client.get(f"/api/v1/orders/{order_id}", headers=headers_b)
    assert access_resp.status_code == 403
    assert access_resp.json()["success"] is False


def test_track_order_timeline(client: TestClient, auth_headers, sample_product):
    """Tracking endpoint returns visual timeline stages."""
    client.post("/api/v1/cart/items", headers=auth_headers, json={
        "product_id": sample_product.id,
        "selected_size": "M",
        "selected_color": "Indigo Blue",
        "quantity": 1
    })
    order_resp = client.post("/api/v1/orders", headers=auth_headers, json={
        "delivery_address": "Test Street",
        "payment_method": "CASH_ON_DELIVERY"
    })
    tracking_code = order_resp.json()["data"]["tracking_code"]

    track_resp = client.get(f"/api/v1/orders/track/{tracking_code}")
    assert track_resp.status_code == 200
    track_data = track_resp.json()["data"]
    assert track_data["tracking_code"] == tracking_code
    assert len(track_data["timeline"]) >= 4
    assert track_data["timeline"][0]["status"] == "PENDING"
    assert track_data["timeline"][0]["completed"] is True
