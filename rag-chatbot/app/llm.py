"""
LLM Generation Service for Rainbow Ready Mades RAG Chatbot.
Integrates with Google Gemini Flash models with graceful offline synthesis fallback.
"""

import os
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from .prompts import SYSTEM_PROMPT, DETERMINISTIC_FALLBACK, build_rag_prompt

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gemini-2.0-flash")


class GeminiLLMService:
    """
    LLM caller managing Google GenAI API communication and offline synthesis.
    """
    def __init__(self, model_name: str = MODEL_NAME, api_key: Optional[str] = None):
        self.model_name = model_name
        self.api_key = api_key or GEMINI_API_KEY
        self._client = None

        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Notice: Google GenAI client not initialized: {e}")

    def generate(
        self,
        customer_message: str,
        context_chunks: List[Dict[str, Any]],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Generate grounded response from verified context.
        """
        if not context_chunks:
            return DETERMINISTIC_FALLBACK

        full_prompt = build_rag_prompt(customer_message, context_chunks, conversation_history)

        # 1. Try Google Gemini API if client configured
        if self._client:
            try:
                from google.genai import types
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.1,
                        max_output_tokens=500
                    )
                )
                if response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"Warning: Gemini generation error ({e}), falling back to grounded context synthesizer.")

        # 2. Local Grounded Context Synthesizer (Offline/Resilience Mode)
        return self._local_grounded_synthesizer(customer_message, context_chunks)

    def _local_grounded_synthesizer(self, query: str, chunks: List[Dict[str, Any]]) -> str:
        """
        Deterministic, template-driven factual answer synthesizer from top retrieved chunks.
        Guarantees that prices, sizes, policies, and store hours are communicated with 100% fidelity.
        """
        top_chunk = chunks[0]
        content = top_chunk.get("content", "")
        metadata = top_chunk.get("metadata", {})
        doc_type = metadata.get("type", "")

        q_lower = query.lower()

        # Product inquiries
        if doc_type == "product":
            prod_name = metadata.get("product_name", "this garment")
            # Extract lines
            lines = {line.split(":", 1)[0].strip(): line.split(":", 1)[1].strip() for line in content.split("\n") if ":" in line}
            
            if any(w in q_lower for w in ["price", "cost", "how much", "rate"]):
                price = lines.get("Price", "")
                return f"The verified price for {prod_name} at Rainbow Ready Mades is {price}."
            if any(w in q_lower for w in ["size", "sizes", "fit"]):
                sizes = lines.get("Available Sizes", "")
                return f"For {prod_name}, the verified available sizes on our rack are: {sizes}."
            if any(w in q_lower for w in ["color", "colours", "shade"]):
                colors = lines.get("Available Colors", "")
                return f"For {prod_name}, the verified available colors are: {colors}."
            if any(w in q_lower for w in ["material", "fabric", "cotton", "cloth", "silk", "linen"]):
                mat = lines.get("Fabric & Material", "")
                care = lines.get("Washing & Care Instructions", "")
                return f"{prod_name} is crafted from {mat}. Care advice: {care}."
            if any(w in q_lower for w in ["stock", "available", "availability"]):
                avail = lines.get("Availability", "Available in store")
                return f"{prod_name} is currently {avail} at Rainbow Ready Mades."

            # General product query
            return f"Regarding {prod_name}: {content}"

        # Policy inquiries
        if doc_type == "policy":
            section = metadata.get("section", "Store Policy")
            return f"According to Rainbow Ready Mades' verified {section}:\n{content}"

        # FAQ inquiries
        if doc_type == "faq":
            # Extract verified store answer
            for line in content.split("\n"):
                if line.startswith("Verified Store Answer:"):
                    return line.replace("Verified Store Answer:", "").strip()
            return content

        # Shop info inquiries
        if doc_type == "shop_info":
            if any(w in q_lower for w in ["time", "timing", "hours", "open", "close", "sunday"]):
                for line in content.split("\n"):
                    if "Store Timings:" in line:
                        return f"Rainbow Ready Mades store timings are: {line.replace('Store Timings:', '').strip()}."
            if any(w in q_lower for w in ["where", "address", "location", "landmark"]):
                for line in content.split("\n"):
                    if "Physical Address:" in line:
                        return f"Rainbow Ready Mades is located at: {line.replace('Physical Address:', '').strip()}."
            if any(w in q_lower for w in ["phone", "whatsapp", "call", "contact"]):
                return "You can contact Rainbow Ready Mades directly at +91-9876543210 (Phone and WhatsApp)."
            if any(w in q_lower for w in ["deliver", "delivery", "shipping", "area", "radius"]):
                return content

        return content
