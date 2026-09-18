"""
Automated Pytest Suite for Rainbow Ready Mades RAG Grounding & Refusal Engine.
Validates zero-hallucination compliance, similarity threshold gating, and API contract.
"""

from pathlib import Path
import sys
import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
CHATBOT_DIR = REPO_ROOT / "rag-chatbot"

for p in [str(CHATBOT_DIR), str(REPO_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from ingestion.loaders import load_all_business_data, load_products, load_shop_info, load_policies, load_faqs
from ingestion.chunking import chunk_documents
from ingestion.ingest import run_ingestion
from app.retriever import ChromaRetriever
from app.rag import RAGPipeline
from app.prompts import DETERMINISTIC_FALLBACK
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def setup_vector_store():
    """Ensure business data is ingested into ChromaDB before test execution."""
    count = run_ingestion()
    assert count > 0, "Ingestion must index at least one verified chunk"
    return count


def test_business_data_loaders():
    """Verify all verified business data files load without syntax or schema errors."""
    data_dir = REPO_ROOT / "business-data"
    products = load_products(data_dir / "products")
    assert len(products) >= 4, "Must have at least 4 verified products loaded"
    for prod in products:
        assert prod["metadata"]["type"] == "product"
        assert "price" in prod["metadata"]
        assert prod["metadata"]["price"] > 0

    shop_info = load_shop_info(data_dir / "shop-info")
    assert len(shop_info) >= 2, "Shop info must contain overview and delivery coverage"

    policies = load_policies(data_dir / "policies")
    assert len(policies) >= 3, "Policies must parse return, exchange, alteration, and delivery clauses"

    faqs = load_faqs(data_dir / "faq")
    assert len(faqs) >= 5, "FAQs must contain verified store Q&A records"


def test_domain_aware_chunking():
    """Verify that garments and Q&A remain atomic chunks and not split prematurely."""
    data_dir = REPO_ROOT / "business-data"
    raw_docs = load_all_business_data(data_dir)
    chunks = chunk_documents(raw_docs)

    assert len(chunks) >= len(raw_docs)
    for c in chunks:
        assert "chunk_id" in c
        assert "content" in c
        assert len(c["content"].strip()) > 0


def test_retrieval_and_threshold_gate(setup_vector_store):
    """Verify that supported questions yield high similarity and meet >= 0.65 threshold."""
    pipeline = RAGPipeline()

    # Supported product query
    res = pipeline.process_query("What is the price of the Anarkali Kurti?")
    assert res["grounded"] is True
    assert res["confidence_score"] >= 0.65
    assert len(res["source_documents"]) > 0
    assert "1099" in res["response"]

    # Supported policy query
    res_pol = pipeline.process_query("What is the exchange window if size does not fit?")
    assert res_pol["grounded"] is True
    assert res_pol["confidence_score"] >= 0.65
    assert "3" in res_pol["response"] or "exchange" in res_pol["response"].lower()


def test_deterministic_fallback_on_unsupported(setup_vector_store):
    """Verify strict refusal for unsupported shop queries (zero extrapolation)."""
    pipeline = RAGPipeline()

    # Unsupported delivery area
    res_dubai = pipeline.process_query("Do you deliver garments to Dubai?")
    assert res_dubai["grounded"] is False
    assert "don't have verified information" in res_dubai["response"]

    # Unsupported product line
    res_laptop = pipeline.process_query("Do you sell Apple laptops or iPhones?")
    assert res_laptop["grounded"] is False
    assert "don't have verified information" in res_laptop["response"]

    # Completely out-of-domain
    res_france = pipeline.process_query("What is the capital of France?")
    assert res_france["grounded"] is False
    assert "don't have verified information" in res_france["response"]


def test_fastapi_chat_endpoint_contract(setup_vector_store):
    """Verify that the FastAPI endpoint adheres strictly to docs/api-contract.md."""
    client = TestClient(app)

    # 1. Health check
    h_res = client.get("/api/v1/health")
    assert h_res.status_code == 200
    assert h_res.json()["status"] == "healthy"

    # 2. Grounded question
    payload = {"message": "What time do you open and close on Sunday?"}
    r = client.post("/api/v1/chat", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert data["data"]["grounded"] is True
    assert "response" in data["data"]
    assert "answer" in data["data"]
    assert "confidence_score" in data["data"]
    assert data["data"]["confidence_score"] >= 0.65

    # 3. Fallback question
    r_unknown = client.post("/api/v1/chat", json={"message": "Do you offer rocket ship rides?"})
    assert r_unknown.status_code == 200
    unknown_data = r_unknown.json()
    assert unknown_data["success"] is True
    assert unknown_data["data"]["grounded"] is False
    assert "don't have verified information" in unknown_data["data"]["response"]
