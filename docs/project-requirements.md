# Project Requirements: Rainbow Ready Mades

> **Status:** Formal Specification  
> **Hackathon:** X-Factor LevelX Phase 2 — Solve  
> **Guiding Principle:** **WORKING SIMPLE PRODUCT over INCOMPLETE COMPLEX PRODUCT.**

---

## 1. Feature Classification Framework

To guarantee timely delivery for the hackathon presentation, all proposed features are strictly triaged into three priority tiers. Under no circumstances should team members begin developing "Nice-to-Have" features while "Must-Have" features are incomplete.

```
┌─────────────────────────────────────────────────────────┐
│                       MUST HAVE                         │
│   (Mandatory for Hackathon Demo & Core MVP Scoring)     │
├─────────────────────────────────────────────────────────┤
│                      SHOULD HAVE                        │
│   (Added if Core MVP is completed ahead of schedule)   │
├─────────────────────────────────────────────────────────┤
│                      NICE TO HAVE                       │
│    (Strictly Post-Hackathon / Do Not Attempt Yet)       │
└─────────────────────────────────────────────────────────┘
```

---

## 2. MUST HAVE (Hackathon MVP Core)

These 15 capabilities represent the minimum viable product (MVP) required to satisfy hackathon judging criteria:

1. **Real Product Catalog Display:**
   * Grid layout rendering genuine Rainbow Ready Mades apparel.
   * Display product photo, garment title, category tag, and verified retail price.
2. **Product Details View:**
   * High-resolution photo gallery of real garments.
   * Fabric composition, available sizes (S, M, L, XL, XXL, etc.), available colors, and garment description.
3. **Faceted Search & Keyword Filtering:**
   * Instant search input to filter garments by title, category, or color.
4. **Shopping Cart Functionality:**
   * Add to cart with specific size and color variant selection.
   * Quantity adjustment and item removal.
   * Real-time calculation of subtotal and total cost.
5. **Customer Checkout Flow:**
   * Form capturing customer name, delivery address, phone number, and fulfillment mode (Cash on Delivery / In-Store Pickup).
   * Order placement confirmation screen with unique Order ID.
6. **Customer Authentication:**
   * Customer sign-up and login with password hashing.
   * Session preservation via JWT token storage.
7. **Order History:**
   * Authenticated user dashboard displaying previous orders and itemized breakdown.
8. **Real-Time Order Tracking:**
   * Visual multi-stage status tracker: `Placed` $\rightarrow$ `Processing` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered`.
9. **Return & Exchange Request Submission:**
   * Self-service customer form to request a return or size exchange for delivered orders.
   * Reason code selection (e.g., "Size too small", "Color mismatch") and status tracking.
10. **Admin Product Management:**
    * Protected merchant portal to view, add, or toggle availability of products.
11. **Admin Order Management:**
    * Admin portal interface to view incoming orders and transition order status (`Processing`, `Dispatched`, `Delivered`).
12. **RAG AI Chatbot Widget:**
    * Persistent, floating interactive chat interface available across the storefront.
13. **Strictly Grounded Chatbot Responses:**
    * Chatbot answers derived exclusively from verified shop documents (products, store hours, policies).
14. **Deterministic Unknown-Answer Fallback:**
    * If the requested query has no backing document, the bot outputs: *"I don't have verified information about that. Please contact Rainbow Ready Mades directly at [Phone] or visit our store."*
15. **Mobile-First Responsive Layout:**
    * Impeccable rendering and smooth touch interaction across mobile smartphones, tablets, and desktop displays.

---

## 3. SHOULD HAVE (Secondary Polish)

Features to implement once all MUST-HAVE features are verified:

1. **Structured Product Categories:** Dynamic category trees (Men's Ethnic, Women's Sarees, Kids' Festive, Casual Wear).
2. **Real-time Inventory Decrement:** Automatic deduction of stock quantities upon successful order placement.
3. **Customer Profile Settings:** Editable customer delivery addresses and contact preferences.
4. **Public FAQ Section:** Interactive accordion rendering verified questions and answers.
5. **Direct WhatsApp Shop Connect:** Clickable floating button initiating direct WhatsApp chat with the physical store number.
6. **Basic Merchant Metrics:** Summary cards showing total orders, total revenue, and pending returns in the admin area.

---

## 4. NICE TO HAVE (Post-Hackathon Roadmap)

> [!WARNING]
> **Do NOT attempt these during the hackathon.** They introduce third-party payment gateway delays, regulatory compliance overhead, and complex asynchronous webhooks that threaten MVP completion.

1. **Online Payment Gateways:** Razorpay / Stripe integration (use Cash on Delivery or Mock In-Store Pickup for MVP).
2. **Promotional Coupon Engine:** Complex discount codes and cart rules.
3. **Collaborative Filtering Recommendations:** "You may also like" ML recommendation models.
4. **SMS / Email Automated Notifications:** Twilio or SendGrid notification triggers.
5. **Advanced Business Intelligence Dashboards:** Predictive stock forecasting and cohort analytics.

---

## 5. Non-Functional Requirements (NFRs)

| Metric | Requirement | Verification Method |
| :--- | :--- | :--- |
| **Response Latency** | E-commerce API calls $\le 500\text{ms}$; Chatbot response $\le 3.0\text{s}$ | Chrome DevTools Network tab / curl timing |
| **Zero Hallucination Policy** | $0\%$ tolerance for invented pricing, unauthorized discounts, or fabricated policies | 15 adversarial test queries in `tests/` |
| **Grounding Precision** | $\ge 90\%$ citation accuracy for supported shop questions | Verified question test suite |
| **Mobile Responsiveness** | Flawless rendering down to 320px screen width without horizontal scrollbars | Chrome DevTools Mobile Emulation (iPhone / Android) |
| **Accessibility & UX** | High contrast text, legible typography, interactive tap targets $\ge 44\text{px}$ | WCAG accessibility audit / mobile testing |
| **Data Integrity** | $100\%$ verified store products; zero synthetic placeholder content | Non-laptop researcher sign-off |
