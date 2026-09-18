from fastapi.testclient import TestClient


def test_add_item_to_cart_and_calculate_totals(client: TestClient, auth_headers, sample_product):
    """Adding an item correctly calculates unit price and subtotal using DB pricing."""
    resp = client.post("/api/v1/cart/items", headers=auth_headers, json={
        "product_id": sample_product.id,
        "selected_size": "L",
        "selected_color": "Indigo Blue",
        "quantity": 2
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["items"]) == 1
    item = data["items"][0]
    assert item["product_id"] == sample_product.id
    # Verified unit price is discount_price (1099.00)
    assert item["unit_price"] == 1099.0
    assert item["quantity"] == 2
    assert item["total_item_price"] == 2198.0
    assert data["subtotal"] == 2198.0
    assert data["total"] == 2198.0


def test_add_item_insufficient_stock_fails(client: TestClient, auth_headers, sample_product):
    """Attempting to add more items than available in inventory returns 400."""
    resp = client.post("/api/v1/cart/items", headers=auth_headers, json={
        "product_id": sample_product.id,
        "selected_size": "L",
        "selected_color": "Indigo Blue",
        "quantity": 15  # Only 10 in stock
    })
    assert resp.status_code == 400
    assert resp.json()["success"] is False


def test_update_cart_item_quantity(client: TestClient, auth_headers, sample_product):
    """Updating cart item quantity recalculates line total and subtotal."""
    add_resp = client.post("/api/v1/cart/items", headers=auth_headers, json={
        "product_id": sample_product.id,
        "selected_size": "M",
        "selected_color": "Maroon",
        "quantity": 1
    })
    item_id = add_resp.json()["data"]["items"][0]["item_id"]

    update_resp = client.patch(f"/api/v1/cart/items/{item_id}", headers=auth_headers, json={
        "quantity": 3
    })
    assert update_resp.status_code == 200
    data = update_resp.json()["data"]
    assert data["items"][0]["quantity"] == 3
    assert data["subtotal"] == 1099.0 * 3


def test_remove_cart_item(client: TestClient, auth_headers, sample_product):
    """Removing an item leaves the cart empty."""
    add_resp = client.post("/api/v1/cart/items", headers=auth_headers, json={
        "product_id": sample_product.id,
        "selected_size": "XL",
        "selected_color": "Indigo Blue",
        "quantity": 1
    })
    item_id = add_resp.json()["data"]["items"][0]["item_id"]

    del_resp = client.delete(f"/api/v1/cart/items/{item_id}", headers=auth_headers)
    assert del_resp.status_code == 200
    assert len(del_resp.json()["data"]["items"]) == 0
    assert del_resp.json()["data"]["total"] == 0.0
