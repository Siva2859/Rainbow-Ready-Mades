import httpx
import logging
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.schemas.common import APIResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, examples=["What is the return policy if a shirt doesn't fit?"])
    session_id: Optional[str] = Field(None, examples=["chat_sess_902"])


class ChatDataResponse(BaseModel):
    response: str
    grounded: bool
    source_documents: List[str] = []
    confidence_score: float


@router.post("", response_model=APIResponse[ChatDataResponse])
async def chat_with_assistant(chat_in: ChatRequest):
    """
    Chatbot integration endpoint matching docs/api-contract.md.
    Forwards to Developer 3's RAG service if running, or returns standard grounded fallback.
    """
    # Attempt to proxy to Developer 3's RAG service on port 8001 if active
    rag_service_url = "http://localhost:8001/api/v1/chat"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(rag_service_url, json=chat_in.model_dump())
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        # RAG microservice is not yet running on port 8001; return contract-compliant baseline
        pass

    # Baseline contract response
    fallback_text = (
        "I am the Rainbow Ready Mades digital assistant. "
        "Verified store data is currently being ingested by the RAG service. "
        "For immediate inquiries, please contact Rainbow Ready Mades directly at +91-9876543210 or visit our store."
    )
    return APIResponse(
        success=True,
        data=ChatDataResponse(
            response=fallback_text,
            grounded=False,
            source_documents=[],
            confidence_score=0.0
        )
    )
