from fastapi.testclient import TestClient


def test_customer_cannot_access_admin_endpoints(client: TestClient, auth_headers):
    """A regular customer attempting admin actions receives 403 Forbidden."""
    resp = client.post("/api/v1/admin/products", headers=auth_headers, json={
        "title": "Hacked Product",
        "category_id": "womens-ethnic",
        "description": "Invalid attempt",
        "price": 100.0,
        "material": "Cotton"
    })
    assert resp.status_code == 403
    assert resp.json()["success"] is False


def test_admin_can_create_product(client: TestClient, admin_headers):
    """Admin can create new garments in the catalog."""
    resp = client.post("/api/v1/admin/products", headers=admin_headers, json={
        "title": "Men's Classic Linen Kurta",
        "category_id": "mens-formal",
        "description": "Premium linen kurta tailored for festive and ceremonial occasions.",
        "price": 1499.0,
        "discount_price": 1299.0,
        "material": "100% Pure Linen",
        "sizes": ["38", "40", "42"],
        "colors": ["White", "Beige"],
        "initial_stock": 15
    })
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["title"] == "Men's Classic Linen Kurta"
    assert data["in_stock"] is True
    assert "38" in data["sizes"]


def test_admin_update_order_status(client: TestClient, auth_headers, admin_headers, sample_product):
    """Admin can transition order status along the fulfillment pipeline."""
    # Place order as customer
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
    order_id = order_resp.json()["data"]["order_id"]

    # Admin updates to CONFIRMED
    update_resp = client.patch(f"/api/v1/admin/orders/{order_id}/status", headers=admin_headers, json={
        "status": "CONFIRMED",
        "notes": "Verified inventory in shop"
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["status"] == "CONFIRMED"


def test_admin_update_return_status(client: TestClient, auth_headers, admin_headers, sample_product):
    """Admin can review and approve a return/exchange ticket."""
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
    order_id = order_resp.json()["data"]["order_id"]

    ret_resp = client.post("/api/v1/returns", headers=auth_headers, json={
        "order_id": order_id,
        "request_type": "EXCHANGE",
        "reason": "SIZE_FIT_ISSUE"
    })
    return_id = ret_resp.json()["data"]["return_id"]

    admin_patch = client.patch(f"/api/v1/admin/returns/{return_id}/status", headers=admin_headers, json={
        "status": "APPROVED",
        "admin_notes": "Exchange package dispatched with courier"
    })
    assert admin_patch.status_code == 200
    assert admin_patch.json()["data"]["status"] == "APPROVED"
