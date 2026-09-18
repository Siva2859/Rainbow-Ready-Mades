# Verified Business Data: Rainbow Ready Mades

> **Lead:** Non-Laptop Member (Business Research & QA)  
> **Status:** Schema & Intake Templates Ready  

---

## 1. Zero-Fake-Data Mandatory Protocol

This repository is built for **Rainbow Ready Mades**, a real local clothing business.  
Under no circumstances should team members add placeholder synthetic products, fictional pricing, or invented return policies.

Every piece of data stored in this directory must be:
1. **Directly Collected:** Photographed or written on-site at Rainbow Ready Mades or confirmed directly with the shop owner/staff.
2. **Accurate & Current:** Real prices in Indian Rupees (₹), genuine stock estimates, actual sizes available on the rack.
3. **Verified & Attributed:** Accompanied by a verification date and staff contact verification source.

---

## 2. Directory Structure & Subsystem Roles

```
business-data/
├── README.md                  # This intake and governance protocol
├── products/                  # Real garment specs & catalog records
│   ├── README.md
│   └── product_template.json  # Schema template for each real garment
├── shop-info/                 # Physical location, hours, WhatsApp, delivery radius
│   ├── README.md
│   └── shop_info_template.json
├── policies/                  # Verbatim return, exchange, and alteration rules
│   ├── README.md
│   └── policies_template.md
└── faq/                       # Real customer inquiries and store-verified answers
    ├── README.md
    └── faq_template.json
```

---

## 3. How Other Developers Consume This Data
* **Developer 2 (Backend):** Uses the JSON files in `products/`, `shop-info/`, and `faq/` to populate the initial PostgreSQL database seed script (`backend/app/seed/seed_data.py`).
* **Developer 3 (RAG Chatbot):** Uses the files in all four directories as the factual corpus for generating embeddings and ChromaDB vector indices (`rag-chatbot/src/ingest.py`).
* **Developer 1 (Frontend):** Uses the real product photos stored in `assets/products/` for catalog cards and detail views.
