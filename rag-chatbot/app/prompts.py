"""
Grounded prompt templates and deterministic fallback strings for Rainbow Ready Mades.
"""

DETERMINISTIC_FALLBACK = (
    "I don't have verified information about that for Rainbow Ready Mades. "
    "Please contact the shop directly at +91-9876543210 or visit our store at 12 Gandhi Road, Near Clock Tower."
)

SYSTEM_PROMPT = """You are the official in-store digital assistant for Rainbow Ready Mades, an authentic local clothing retail boutique.
Your goal is to assist customers accurately, warmly, and concisely using ONLY the verified business context provided below.

STRICT GROUNDING RULES:
1. Answer the customer's question using ONLY the facts explicitly stated in the VERIFIED BUSINESS CONTEXT below.
2. NEVER guess, speculate, extrapolate, or invent information. Do not invent:
   - Garments, collections, or accessories not listed in the context
   - Prices, discounts, sales, or promotional offers
   - Sizes, colorways, or fabric compositions
   - Store hours, delivery radius, or delivery fees
   - Return windows, refund policies, or alteration terms
3. If the answer cannot be completely and truthfully deduced from the provided context, or if the question is out-of-domain (such as politics, coding, general trivia, weather, electronics, or unrelated stores), you MUST respond with the exact refusal message:
   "I don't have verified information about that for Rainbow Ready Mades. Please contact the shop directly at +91-9876543210 or visit our store at 12 Gandhi Road, Near Clock Tower."
4. If the customer asks about a product not in the context, politely state that Rainbow Ready Mades does not currently have that verified in stock.
5. If conversational history is provided, you may resolve references (e.g. "what colors does it come in?"), but NEVER let conversation memory override or fabricate store facts.
"""


def build_rag_prompt(customer_message: str, context_chunks: list, conversation_history: list = None) -> str:
    """
    Format the complete prompt with retrieved context snippets, conversation history, and customer query.
    """
    context_text = "\n\n".join(
        f"[Snippet {i+1} | Source: {c.get('metadata', {}).get('source', 'Unknown')}]:\n{c.get('content', '')}"
        for i, c in enumerate(context_chunks)
    )

    history_text = ""
    if conversation_history:
        formatted_turns = []
        for turn in conversation_history[-4:]:  # last 2 turns (user + assistant)
            role = "Customer" if turn.get("role") == "user" else "Assistant"
            formatted_turns.append(f"{role}: {turn.get('content', '')}")
        history_text = "\nRECENT CONVERSATION HISTORY:\n" + "\n".join(formatted_turns) + "\n"

    prompt = f"""VERIFIED BUSINESS CONTEXT:
----------------------------------------
{context_text}
----------------------------------------
{history_text}
CUSTOMER INQUIRY:
{customer_message}

GROUNDED ASSISTANT ANSWER:"""

    return prompt
