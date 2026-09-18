from fastapi.testclient import TestClient


def test_create_exchange_request(client: TestClient, auth_headers, sample_product):
    """Customer can file an exchange request for an existing order."""
    # Place order
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

    # File exchange
    ret_resp = client.post("/api/v1/returns", headers=auth_headers, json={
        "order_id": order_id,
        "request_type": "EXCHANGE",
        "reason": "SIZE_FIT_ISSUE",
        "customer_note": "Need size L instead",
        "desired_size": "L"
    })
    assert ret_resp.status_code == 201
    ret_data = ret_resp.json()["data"]
    assert ret_data["order_id"] == order_id
    assert ret_data["status"] == "REQUESTED"
    assert ret_data["request_type"] == "EXCHANGE"


def test_duplicate_return_prevented(client: TestClient, auth_headers, sample_product):
    """Submitting a second return for the same order returns 409 Conflict."""
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

    # First request
    client.post("/api/v1/returns", headers=auth_headers, json={
        "order_id": order_id,
        "request_type": "RETURN",
        "reason": "DEFECT"
    })

    # Second request
    dup_resp = client.post("/api/v1/returns", headers=auth_headers, json={
        "order_id": order_id,
        "request_type": "RETURN",
        "reason": "DEFECT"
    })
    assert dup_resp.status_code == 409
    assert dup_resp.json()["success"] is False
