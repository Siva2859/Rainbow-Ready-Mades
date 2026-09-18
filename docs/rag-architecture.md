# RAG & AI Chatbot Architecture: Rainbow Ready Mades

> **Status:** Planned / Target Architecture Specification  
> **Role:** Developer 3  
> **Core Guarantee:** 100% Grounded in Verified Store Knowledge. Zero Extrapolation.  

---

## 1. Grounding Philosophy
The AI Chatbot is designed as a direct digital surrogate for Rainbow Ready Mades store staff. In retail, giving inaccurate information regarding fabric quality, return eligibility, or store hours causes direct customer frustration and loss of trust.

Therefore, this RAG implementation strictly follows a **closed-world assumption**:
* If an answer is **explicitly present** in the retrieved shop context $\rightarrow$ Synthesize a courteous, accurate response.
* If an answer is **absent, ambiguous, or out-of-scope** $\rightarrow$ Trigger the deterministic refusal message:
  > *"I don't have verified information about that for Rainbow Ready Mades. Please contact the shop directly at [Phone] or visit us at [Address]."*

---

## 2. Eleven-Stage RAG Pipeline Specification

```
┌───────────────────────────────┐
│ 1. Data Collection & Intake   │ (Physical verification from Rainbow Ready Mades)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 2. Cleaning & Normalization   │ (Strip typos, format phone/hours, structured JSON)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 3. Semantic Document Assembly │ (Convert products, FAQs, policies into markdown docs)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 4. Domain-Aware Chunking      │ (Products = 1 chunk; Policies = 1 section/chunk)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 5. Dense Vector Embeddings    │ (Google text-embedding-004 / all-MiniLM-L6-v2)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 6. Vector Database Storage    │ (ChromaDB local persistent collection)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 7. Similarity Search & Filter │ (Cosine similarity with >= 0.65 threshold gate)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 8. Context Injection & Prompt │ (Strict system instructions + retrieved context)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 9. Grounded LLM Generation    │ (Gemini 1.5 / 2.0 Flash)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 10. Fallback Guardrails       │ (Intercept low scores or out-of-scope queries)
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│ 11. Automated Evaluation      │ (Grounding & hallucination test suites)
└───────────────────────────────┘
```

---

### Stage 1: Data Collection & Intake
* Conducted directly by the Non-Laptop Business Research member at Rainbow Ready Mades.
* Data encompasses:
  1. Product profiles: garment names, fabric compositions, care instructions, sizes, colorways, prices.
  2. Shop profile: official address, landmarks, operational hours, contact numbers.
  3. Customer policies: exchange window, non-returnable items, alterations, delivery radius.
  4. Frequently Asked Questions: real inquiries collected from shop staff.

### Stage 2: Data Cleaning & Normalization
* Raw records ingested from `business-data/` undergo automated validation:
  * Prices normalized to decimal numeric formats.
  * Sizes normalized to standardized tokens (`S`, `M`, `L`, `XL`, `XXL`, `38`, `40`, `42`).
  * Contact numbers formatted with country codes (`+91`).
  * Relative time references converted into explicit operating hours.

### Stage 3: Semantic Document Assembly
Documents are structured into human-readable, metadata-tagged markdown files:
```markdown
---
id: prod_001
type: product
category: Womens-Ethnic
verified_date: 2026-09-18
---
Product: Pure Cotton Embroidered Anarkali Kurti
Price: ₹1,099 (Regular: ₹1,299)
Sizes Available: M, L, XL, XXL
Colors: Indigo Blue, Maroon
Fabric / Material: 100% Breathable Cotton
Care: Hand wash in cold water. Do not bleach.
Exchange Eligibility: Eligible for size exchange within 3 days.
```

### Stage 4: Domain-Aware Chunking Strategy
Generic token-length chunking often splits garment specs across boundaries. We apply **domain-aware semantic chunking**:
* **Product Catalog:** Each product profile represents one standalone, atomic chunk (approx. 120–200 tokens). This guarantees that price, fabric, and size specifications are never fragmented.
* **Store Policies:** Chunked strictly by policy topic (e.g., `Return Window`, `Alteration Policy`, `Delivery Areas`). Chunk size: 150–250 tokens with 20 token overlap.
* **FAQs:** Each question-and-answer pair constitutes a single independent chunk.

### Stage 5: Dense Vector Embeddings
* Target Embedding Model: Google `text-embedding-004` (768 dimensions) or HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions).
* Both the user query and knowledge chunks are converted into dense vector representations capturing semantic intent.

### Stage 6: Vector Database Storage
* Embedded Vector Store: **ChromaDB** running locally in persistent mode (`rag-chatbot/data/chroma_db/`).
* Each record stores:
  * `id`: Document identifier (e.g. `doc_prod_001`)
  * `embedding`: Dense vector
  * `document`: Clean text snippet
  * `metadata`: `{ "category": "Women's Ethnic", "type": "product", "source": "business-data/products/..." }`

### Stage 7: Similarity Search & Threshold Gating
When a customer message arrives:
1. Generate query embedding: $v_q = \text{Embed}(\text{message})$.
2. Query ChromaDB collection with cosine distance metric:
   $$\text{similarity} = 1 - \text{cosine\_distance}$$
3. Retrieve top $k=3$ most similar chunks.
4. **Hard Score Gate:** If the highest similarity score is $< 0.65$, immediately route to the fallback handler **without executing an LLM call**, saving cost and latency.

### Stage 8 & 9: Context Injection & LLM Generation Prompt

```text
You are the official in-store digital assistant for Rainbow Ready Mades, an authentic local clothing shop.
Your goal is to assist customers accurately, warmly, and concisely.

STRICT GROUNDING INSTRUCTIONS:
1. Answer the user's inquiry using ONLY the provided verified business context snippets below.
2. If the answer cannot be completely and truthfully deduced from the provided context, you MUST state:
   "I don't have verified information about that for Rainbow Ready Mades. Please contact the shop directly at +91-XXXXXXXXXX or visit our store."
3. NEVER guess, speculate, invent garment availability, offer unauthorized discounts, or make assumptions about store policies.
4. If the user asks about products not listed in the context, politely state that Rainbow Ready Mades does not currently have that verified in stock.

VERIFIED BUSINESS CONTEXT:
----------------------------------------
{retrieved_context_chunks}
----------------------------------------

CUSTOMER INQUIRY:
{customer_message}

GROUNDED ASSISTANT ANSWER:
```

### Stage 10: Hallucination & Fallback Guardrails
1. **Pre-LLM Gate:** Score threshold filter ($\ge 0.65$).
2. **System Prompt Constraint:** Direct instruction to refuse if facts are missing.
3. **Post-LLM Guardrail Verification:** Fast string inspection to verify that any quoted price or policy term matches the source context verbatim.

### Stage 11: Testing & Evaluation Framework
Developer 3 and the QA Member will validate the RAG pipeline using a test harness (`tests/test_rag_grounding.py`) against:
* **20 Supported Questions:** Garment fabrics, sizes, store location, exchange windows. (Target: $100\%$ factual accuracy).
* **15 Out-of-Domain Inquiries:** Competitor brands, electronics, weather, general knowledge, unauthorized discount negotiations. (Target: $100\%$ refusal rate).
