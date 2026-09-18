"""
End-to-End RAG Pipeline Coordinator for Rainbow Ready Mades.
Handles session memory, threshold gating, context assembly, and fallback guardrails.
"""

from typing import Dict, Any, Optional, List
import re
from collections import defaultdict

from .retriever import ChromaRetriever
from .llm import GeminiLLMService
from .prompts import DETERMINISTIC_FALLBACK

# Patterns that are unambiguously out-of-domain for a local clothing boutique
OUT_OF_DOMAIN_PATTERNS = [
    r"\b(capital of|prime minister|president of|weather in|temperature in)\b",
    r"\b(write me a (code|python|java|c\+\+|javascript|script|program|essay|poem))\b",
    r"\b(who won|cricket match|football match|world cup|olympics)\b",
    r"\b(tell me a joke|sing a song|solve this equation|quadratic)\b",
    r"\b(laptop|smartphone|electronics|hardware|computer|car|plane|flight)\b",
    r"\b(dubai|paris|london|new york|america|europe|tokyo)\b"
]

# Simple in-memory session history store: session_id -> list of {"role": "...", "content": "..."}
_SESSION_MEMORY: Dict[str, List[Dict[str, str]]] = defaultdict(list)
MAX_TURNS_PER_SESSION = 6


def is_explicitly_out_of_domain(text: str) -> bool:
    """Fast guardrail regex check for questions completely foreign to apparel/shop."""
    text_lower = text.lower()
    for pattern in OUT_OF_DOMAIN_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False


class RAGPipeline:
    """
    Main RAG workflow orchestrator.
    """
    def __init__(self, retriever: Optional[ChromaRetriever] = None, llm_service: Optional[GeminiLLMService] = None):
        self.retriever = retriever or ChromaRetriever()
        self.llm = llm_service or GeminiLLMService()

    def process_query(self, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute full RAG pipeline with pre-LLM and post-LLM guardrails.
        """
        cleaned_msg = message.strip()
        if not cleaned_msg:
            return {
                "response": DETERMINISTIC_FALLBACK,
                "answer": DETERMINISTIC_FALLBACK,
                "grounded": False,
                "source_documents": [],
                "confidence_score": 0.0
            }

        # 1. Out-of-Domain Fast Interceptor Gate
        if is_explicitly_out_of_domain(cleaned_msg):
            return {
                "response": DETERMINISTIC_FALLBACK,
                "answer": DETERMINISTIC_FALLBACK,
                "grounded": False,
                "source_documents": [],
                "confidence_score": 0.1
            }

        # Retrieve conversation history for context resolution if session_id is provided
        history = _SESSION_MEMORY[session_id] if session_id else []

        # If question is ambiguous (e.g. "What sizes are available?" or "How much is it?"),
        # augment query with last discussed topic if available
        retrieval_query = cleaned_msg
        if history and len(cleaned_msg.split()) <= 6:
            last_user_msg = next((turn["content"] for turn in reversed(history) if turn["role"] == "user"), "")
            if last_user_msg:
                retrieval_query = f"{last_user_msg} {cleaned_msg}"

        # 2. Vector Retrieval & Cosine Similarity Score Check
        retrieval_res = self.retriever.retrieve(retrieval_query)
        chunks = retrieval_res["chunks"]
        max_score = retrieval_res["max_score"]
        is_grounded = retrieval_res["is_grounded"]
        source_docs = retrieval_res["source_documents"]

        # 3. Hard Score Gate: If score < 0.65, immediately return fallback
        if not is_grounded or not chunks:
            return {
                "response": DETERMINISTIC_FALLBACK,
                "answer": DETERMINISTIC_FALLBACK,
                "grounded": False,
                "source_documents": [],
                "confidence_score": max_score
            }

        # 4. Synthesize Grounded Answer via LLM
        answer = self.llm.generate(
            customer_message=cleaned_msg,
            context_chunks=chunks,
            conversation_history=history
        )

        # 5. Check if LLM itself determined context was insufficient
        if "don't have verified information" in answer or "do not have verified information" in answer:
            return {
                "response": DETERMINISTIC_FALLBACK,
                "answer": DETERMINISTIC_FALLBACK,
                "grounded": False,
                "source_documents": [],
                "confidence_score": max_score
            }

        # 6. Update Session Memory
        if session_id:
            _SESSION_MEMORY[session_id].append({"role": "user", "content": cleaned_msg})
            _SESSION_MEMORY[session_id].append({"role": "assistant", "content": answer})
            if len(_SESSION_MEMORY[session_id]) > MAX_TURNS_PER_SESSION:
                _SESSION_MEMORY[session_id] = _SESSION_MEMORY[session_id][-MAX_TURNS_PER_SESSION:]

        return {
            "response": answer,
            "answer": answer,
            "grounded": True,
            "source_documents": source_docs,
            "confidence_score": max_score
        }


# Shared singleton pipeline instance
default_rag_pipeline = RAGPipeline()
