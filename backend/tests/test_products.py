from fastapi.testclient import TestClient


def test_list_products(client: TestClient, sample_product):
    """Catalog listing returns active products with calculated sizes, colors, and stock."""
    resp = client.get("/api/v1/products")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1
    item = data["data"][0]
    assert item["id"] == sample_product.id
    assert item["price"] == 1299.0
    assert item["discount_price"] == 1099.0
    assert "M" in item["sizes"]
    assert "Indigo Blue" in item["colors"]
    assert item["in_stock"] is True


def test_filter_products_by_category(client: TestClient, sample_product):
    """Filtering by category returns matching items."""
    resp = client.get("/api/v1/products?category=womens-ethnic")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) >= 1

    resp_empty = client.get("/api/v1/products?category=non-existent-category")
    assert resp_empty.status_code == 200
    assert len(resp_empty.json()["data"]) == 0


def test_search_products(client: TestClient, sample_product):
    """Keyword search returns matching items."""
    resp = client.get("/api/v1/products/search?q=Anarkali")
    assert resp.status_code == 200
    assert len(resp.json()["data"]) == 1
    assert resp.json()["data"][0]["id"] == sample_product.id

    resp_nomatch = client.get("/api/v1/products/search?q=ElectronicTablet")
    assert resp_nomatch.status_code == 200
    assert len(resp_nomatch.json()["data"]) == 0


def test_get_product_detail(client: TestClient, sample_product):
    """Detail view returns specifications, care instructions, and image URLs."""
    resp = client.get(f"/api/v1/products/{sample_product.id}")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["id"] == sample_product.id
    assert data["material"] == "100% Breathable Cotton"
    assert len(data["images"]) >= 1


def test_get_nonexistent_product_returns_404(client: TestClient):
    """Querying an unknown product ID returns 404."""
    resp = client.get("/api/v1/products/prod_nonexistent_999")
    assert resp.status_code == 404
    assert resp.json()["success"] is False
