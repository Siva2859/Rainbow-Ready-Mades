"""
FastAPI Server for Rainbow Ready Mades Grounded RAG Chatbot Service.
Exposes POST /api/v1/chat and POST /chat conforming strictly to docs/api-contract.md.
"""

from typing import Optional, List
from pathlib import Path
import sys

# Ensure parent paths are available
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(CURRENT_DIR.parent) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR.parent))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .rag import default_rag_pipeline, RAGPipeline
from .retriever import ChromaRetriever

app = FastAPI(
    title="Rainbow Ready Mades - Grounded RAG AI Assistant API",
    description="Grounded conversational AI customer assistant powered exclusively by verified store business data.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., description="Customer message or question about garments or store policies", min_length=1)
    session_id: Optional[str] = Field(None, description="Optional customer conversation session ID")


class ChatData(BaseModel):
    response: str = Field(..., description="Grounded answer or approved deterministic fallback string")
    answer: str = Field(..., description="Alias for response for frontend compatibility")
    grounded: bool = Field(..., description="True if response is grounded in verified store records; False if fallback")
    source_documents: List[str] = Field(default_factory=list, description="List of source business data paths used")
    confidence_score: float = Field(..., description="Highest cosine similarity score achieved during retrieval")


class ChatResponse(BaseModel):
    success: bool = True
    data: ChatData


class HealthResponse(BaseModel):
    status: str
    service: str
    indexed_chunks: int
    collection_name: str


@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Health check endpoint returning system status and ChromaDB indexing state.
    """
    try:
        retriever = default_rag_pipeline.retriever
        count = retriever.collection.count()
        return HealthResponse(
            status="healthy",
            service="rag-chatbot",
            indexed_chunks=count,
            collection_name=retriever.collection_name
        )
    except Exception as e:
        return HealthResponse(
            status=f"degraded: {e}",
            service="rag-chatbot",
            indexed_chunks=0,
            collection_name="unknown"
        )


@app.post("/api/v1/chat", response_model=ChatResponse, tags=["Chat"])
@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat_endpoint(payload: ChatRequest):
    """
    Customer conversational assistant endpoint.
    Retrieves verified business context and synthesizes grounded response.
    """
    try:
        result = default_rag_pipeline.process_query(
            message=payload.message,
            session_id=payload.session_id
        )
        return ChatResponse(
            success=True,
            data=ChatData(
                response=result["response"],
                answer=result["answer"],
                grounded=result["grounded"],
                source_documents=result["source_documents"],
                confidence_score=result["confidence_score"]
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing RAG pipeline: {str(e)}"
        )


@app.post("/api/v1/ingest", tags=["Admin"])
def trigger_ingestion():
    """
    Administrative endpoint to re-run ingestion from business-data directory.
    """
    try:
        from ingestion.ingest import run_ingestion
        count = run_ingestion()
        return {"success": True, "message": f"Successfully re-ingested {count} business data chunks."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
