# API Contract: Rainbow Ready Mades

> **Status:** Planned / Target Contract Specification  
> **Base URL:** `/api/v1`  
> **Content-Type:** `application/json`  
> **Auth Header:** `Authorization: Bearer <jwt_token>` (for protected endpoints)  

---

## 1. Global Response & Error Standards

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product with ID 42 was not found",
    "details": null
  },
  "timestamp": "2026-09-18T12:00:00Z"
}
```

### Standard Status Codes
* `200 OK`: Successful retrieval or synchronous update
* `201 Created`: Resource successfully created
* `400 Bad Request`: Payload validation error or invalid request parameters
* `401 Unauthorized`: Missing or expired Bearer token
* `403 Forbidden`: Authenticated user does not possess required role (`ADMIN`)
* `404 Not Found`: Target resource does not exist
* `500 Internal Server Error`: Unhandled server error

---

## 2. Authentication Endpoints

### 2.1 Customer Registration
* **Endpoint:** `POST /api/v1/auth/register`
* **Access:** Public
* **Request Body:**
```json
{
  "full_name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "SecurePassword123!",
  "phone": "+919876543210"
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_01a",
    "full_name": "Priya Sharma",
    "email": "priya@example.com",
    "role": "CUSTOMER"
  }
}
```

### 2.2 User Login
* **Endpoint:** `POST /api/v1/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "priya@example.com",
  "password": "SecurePassword123!"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": "usr_01a",
      "full_name": "Priya Sharma",
      "email": "priya@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

---

## 3. Products & Catalog Endpoints

### 3.1 List Products
* **Endpoint:** `GET /api/v1/products`
* **Access:** Public
* **Query Parameters:**
  * `category` (optional, string): e.g. `womens-ethnic`
  * `search` (optional, string): e.g. `cotton kurti`
  * `min_price`, `max_price` (optional, float)
  * `in_stock` (optional, boolean, default `true`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_001",
      "title": "Pure Cotton Embroidered Anarkali Kurti",
      "category": "Women's Ethnic",
      "price": 1299.00,
      "discount_price": 1099.00,
      "sizes": ["M", "L", "XL", "XXL"],
      "colors": ["Indigo Blue", "Maroon"],
      "material": "100% Breathable Cotton",
      "primary_image_url": "/assets/products/prod_001_main.jpg",
      "in_stock": true,
      "stock_count": 14
    }
  ]
}
```

### 3.2 Get Product Details
* **Endpoint:** `GET /api/v1/products/{id}`
* **Access:** Public
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "title": "Pure Cotton Embroidered Anarkali Kurti",
    "category": "Women's Ethnic",
    "price": 1299.00,
    "discount_price": 1099.00,
    "sizes": ["M", "L", "XL", "XXL"],
    "colors": ["Indigo Blue", "Maroon"],
    "material": "100% Breathable Cotton",
    "description": "Authentic hand-embroidered kurti designed for daily and festive wear. Pre-shrunk cotton fabric.",
    "care_instructions": "Hand wash in cold water. Do not bleach.",
    "images": [
      "/assets/products/prod_001_main.jpg",
      "/assets/products/prod_001_side.jpg"
    ],
    "stock_count": 14,
    "verified_at": "2026-09-18"
  }
}
```

### 3.3 Create Product (Admin Only)
* **Endpoint:** `POST /api/v1/products`
* **Access:** Admin (`role: ADMIN`)
* **Request Body:**
```json
{
  "title": "Men's Formal Linen Shirt",
  "category_id": "cat_mens_formal",
  "price": 899.00,
  "sizes": ["38", "40", "42", "44"],
  "colors": ["White", "Sky Blue"],
  "material": "Pure Linen",
  "stock_count": 20,
  "description": "Premium linen formal shirt tailored for summer comfort."
}
```

---

## 4. Shopping Cart Endpoints

### 4.1 Get Current Cart
* **Endpoint:** `GET /api/v1/cart`
* **Access:** Authenticated Customer
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "cart_id": "cart_992",
    "items": [
      {
        "item_id": "ci_101",
        "product_id": "prod_001",
        "title": "Pure Cotton Embroidered Anarkali Kurti",
        "selected_size": "L",
        "selected_color": "Indigo Blue",
        "unit_price": 1099.00,
        "quantity": 1,
        "total_item_price": 1099.00,
        "image_url": "/assets/products/prod_001_main.jpg"
      }
    ],
    "subtotal": 1099.00,
    "delivery_fee": 0.00,
    "total": 1099.00
  }
}
```

### 4.2 Add Item to Cart
* **Endpoint:** `POST /api/v1/cart/items`
* **Access:** Authenticated Customer
* **Request Body:**
```json
{
  "product_id": "prod_001",
  "selected_size": "L",
  "selected_color": "Indigo Blue",
  "quantity": 1
}
```

### 4.3 Update Cart Item Quantity
* **Endpoint:** `PUT /api/v1/cart/items/{item_id}`
* **Access:** Authenticated Customer
* **Request Body:**
```json
{
  "quantity": 2
}
```

### 4.4 Delete Item from Cart
* **Endpoint:** `DELETE /api/v1/cart/items/{item_id}`
* **Access:** Authenticated Customer

---

## 5. Orders & Tracking Endpoints

### 5.1 Place Order (Checkout)
* **Endpoint:** `POST /api/v1/orders`
* **Access:** Authenticated Customer
* **Request Body:**
```json
{
  "delivery_address": {
    "street": "12 Gandhi Road, Near Clock Tower",
    "city": "Shop Local City",
    "postal_code": "600001",
    "phone": "+919876543210"
  },
  "payment_method": "CASH_ON_DELIVERY",
  "order_notes": "Please call before delivery"
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "order_id": "ord_8841",
    "tracking_code": "RRM-TRK-8841",
    "status": "PLACED",
    "total_amount": 1099.00,
    "payment_method": "CASH_ON_DELIVERY",
    "created_at": "2026-09-18T12:30:00Z"
  }
}
```

### 5.2 List Customer Orders
* **Endpoint:** `GET /api/v1/orders`
* **Access:** Authenticated Customer

### 5.3 Get Order Details & Live Status
* **Endpoint:** `GET /api/v1/orders/{id}`
* **Access:** Authenticated Customer / Admin
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "order_id": "ord_8841",
    "tracking_code": "RRM-TRK-8841",
    "status": "DISPATCHED",
    "timeline": [
      { "status": "PLACED", "timestamp": "2026-09-18T12:30:00Z", "completed": true },
      { "status": "PROCESSING", "timestamp": "2026-09-18T13:15:00Z", "completed": true },
      { "status": "DISPATCHED", "timestamp": "2026-09-18T15:00:00Z", "completed": true },
      { "status": "DELIVERED", "timestamp": null, "completed": false }
    ],
    "items": [
      {
        "product_id": "prod_001",
        "title": "Pure Cotton Embroidered Anarkali Kurti",
        "size": "L",
        "color": "Indigo Blue",
        "quantity": 1,
        "price": 1099.00
      }
    ],
    "total_amount": 1099.00
  }
}
```

---

## 6. Returns & Exchanges Endpoints

### 6.1 Submit Return / Exchange Request
* **Endpoint:** `POST /api/v1/returns`
* **Access:** Authenticated Customer
* **Request Body:**
```json
{
  "order_id": "ord_8841",
  "request_type": "EXCHANGE",
  "reason_code": "SIZE_FIT_ISSUE",
  "customer_note": "Size L is slightly loose, requesting size M in exchange.",
  "item_id": "ci_101",
  "desired_size": "M"
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "return_id": "ret_502",
    "order_id": "ord_8841",
    "status": "SUBMITTED",
    "message": "Your exchange request has been logged. Rainbow Ready Mades staff will review within 24 hours."
  }
}
```

### 6.2 Get Return Status
* **Endpoint:** `GET /api/v1/returns/{id}`
* **Access:** Authenticated Customer / Admin

---

## 7. Grounded RAG Chatbot Endpoint

### 7.1 Ask AI Assistant
* **Endpoint:** `POST /api/v1/chat`
* **Access:** Public (Optional session ID)
* **Request Body:**
```json
{
  "message": "What is the return policy if a shirt doesn't fit?",
  "session_id": "chat_sess_902"
}
```
* **Success Response (Grounded Answer) (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "response": "At Rainbow Ready Mades, you can exchange garments within 3 days of delivery or in-store purchase provided tags are intact and the garment is unworn. Direct refunds are not provided, but exchanges for a different size or store credit are supported.",
    "grounded": true,
    "source_documents": [
      "business-data/policies/return_exchange_policy.md"
    ],
    "confidence_score": 0.88
  }
}
```

* **Success Response (Fallback / Unknown Answer) (`200 OK`):**
*When query is unsupported (e.g. "Do you sell laptops?"):*
```json
{
  "success": true,
  "data": {
    "response": "I don't have verified information about that for Rainbow Ready Mades. Please contact the shop directly at +91-XXXXXXXXXX or visit our store.",
    "grounded": false,
    "source_documents": [],
    "confidence_score": 0.12
  }
}
```
