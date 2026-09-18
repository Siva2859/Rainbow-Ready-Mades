# Frontend Application: Rainbow Ready Mades

> **Branch:** `feature/frontend-ecommerce`  
> **Lead:** Developer 1 (Frontend & E-Commerce Developer)  
> **Status:** Planned / Architecture Foundation Set  

---

## 1. Overview & Objectives
Developer 1 is responsible for crafting the entire customer-facing and admin web experience for Rainbow Ready Mades. The design must be fast, mobile-first, aesthetically pleasing, and visually representative of a modern boutique clothing retailer.

---

## 2. Planned Technology Stack
* **Build Tool:** Vite
* **Framework:** React 18+ (or Vanilla Modern HTML5 / CSS3 / ES Modules)
* **Styling:** Modular Vanilla CSS / Modern CSS Variables (Curated warm, elegant retail palette, responsive flexbox/grid, glassmorphism card surfaces)
* **Icons:** Lucide Icons / Heroicons (SVG)
* **State Management:** React Context API or lightweight Zustand (for Cart and Auth session)
* **HTTP Client:** Native `fetch` with centralized API service wrapper

---

## 3. Key Pages & Components to Implement

### Customer Pages:
1. **Home / Hero Landing:** Showcase store banner, featured collections, store hours notice, and value propositions.
2. **Product Catalog (`/products`):** Grid of real clothing products with category chips, price sorting, and instant keyword filter.
3. **Product Details (`/products/:id`):** Real photo gallery, fabric details, size selector pills, color options, stock badges, and "Add to Cart" button.
4. **Shopping Cart Drawer / Page (`/cart`):** Itemized list of selected garments, size/color variant tokens, quantity modifiers, delivery charge estimator, and checkout CTA.
5. **Checkout Flow (`/checkout`):** Shipping address capture, phone number validation, payment selection (Cash on Delivery / In-Store Pickup), order confirmation.
6. **Customer Auth (`/login`, `/register`):** Clean forms with client-side validation and JWT token persistence in `localStorage`.
7. **Order History & Tracking (`/orders`, `/track/:tracking_id`):** 4-stage visual order timeline (`Placed` $\rightarrow$ `Processing` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered`).
8. **Returns & Exchanges (`/returns/new`):** Customer request form linking to delivered orders with reason selection and desired size exchange.
9. **Floating Chatbot Widget:** Embedded bottom-right conversational widget communicating with `POST /api/v1/chat`.

### Admin Pages:
1. **Admin Dashboard (`/admin`):** Catalog overview, stock toggles, order status transitions (`Placed` $\rightarrow$ `Dispatched`), return approval list.

---

## 4. Working with Mock Data During Early Development
While Developer 2 is setting up the FastAPI backend:
1. Create a `src/services/mockData.js` file using data structured exactly like [docs/api-contract.md](../docs/api-contract.md).
2. Build UI views against the mock data first.
3. Once Developer 2 deploys endpoints, swap the mock calls with real `fetch()` calls to `VITE_API_BASE_URL`.

---

## 5. Developer 1 First Steps
1. Checkout the assigned branch:
   ```bash
   git checkout feature/frontend-ecommerce
   git pull origin main
   ```
2. Initialize the project scaffolding (e.g. `npm create vite@latest . -- --template react`).
3. Set up the global CSS design system in `src/index.css` (color tokens, font families, reset rules, responsive breakpoints).
4. Build the core layout shell: Navbar (logo, navigation links, search bar, cart count badge) and Footer (store address, hours, contact).
5. Build the product card component and catalog grid view.
