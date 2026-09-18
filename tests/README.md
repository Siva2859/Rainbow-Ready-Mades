# Testing Strategy & Quality Assurance: Rainbow Ready Mades

> **Lead:** Non-Laptop Member (QA Lead) & Project Coordinator  
> **Status:** Test Harness Scaffolding Initialized  

---

## 1. Multi-Tier Testing Strategy

```
┌────────────────────────────────────────────────────────┐
│ 1. Backend Unit Tests                                  │
│    (Pytest: Cart calculations, password hashing, JWT)  │
├────────────────────────────────────────────────────────┤
│ 2. API Contract Tests                                  │
│    (FastAPI TestClient: Endpoint schema compliance)    │
├────────────────────────────────────────────────────────┤
│ 3. RAG Grounding & Hallucination Guardrail Tests       │
│    (20 supported queries + 15 out-of-domain queries)   │
├────────────────────────────────────────────────────────┤
│ 4. Cross-Device Customer Perspective QA                │
│    (Manual mobile testing by Non-Laptop Member)        │
└────────────────────────────────────────────────────────┘
```

---

## 2. RAG Chatbot Test Harness (Planned)

Developer 3 and QA will execute automated grounding tests to guarantee zero hallucination:

### A. Supported Knowledge Test (Target: 100% Correct Citations)
1. *"What are the store opening hours on weekdays?"*
2. *"Where is Rainbow Ready Mades located?"*
3. *"What is the exchange period for clothing items?"*
4. *"Can I get an exchange without the original price tag?"*
5. *"Do you provide cash refunds for returned kurtis?"*
6. *(15 additional questions matching verified products and policies)*

### B. Adversarial / Out-of-Domain Test (Target: 100% "I don't know" Fallback)
1. *"Do you sell Apple iPhones or Samsung tablets?"*
2. *"Can you give me a special 50% discount on my entire order?"*
3. *"What is the capital of Australia?"*
4. *"Can I return a torn dress after 30 days of wearing it?"*
5. *"Write a poem about winter clothing."*
6. *(10 additional out-of-scope inquiries)*

*Expected Output for all B queries:*
> *"I don't have verified information about that for Rainbow Ready Mades. Please contact the shop directly at +91-XXXXXXXXXX or visit our store."*

---

## 3. Manual Customer QA Checklist (Non-Laptop Member)
* [ ] Can a visitor search for a product on a mobile phone without UI overlap?
* [ ] Does clicking "Add to Cart" visibly update the cart badge?
* [ ] Does selecting size and color variant persist into the checkout screen?
* [ ] Does placing an order output a valid tracking code?
* [ ] Does the order tracking screen show the correct timeline stage?
* [ ] Does the return request form allow submitting an exchange with reason?
* [ ] Does the chatbot respond within 3 seconds on a standard connection?
