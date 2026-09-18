"""
Domain-aware semantic chunking strategy for Rainbow Ready Mades business data.
Ensures product specifications, policies, and FAQs are preserved in complete,
context-rich chunks without accidental boundary splitting.
"""

from typing import List, Dict, Any


def chunk_document(doc: Dict[str, Any], max_chunk_words: int = 250, overlap_words: int = 30) -> List[Dict[str, Any]]:
    """
    Split a single loaded business document using domain-aware semantics:
    - Products: Kept strictly ATOMIC as 1 single chunk so prices, fabrics, and sizes are never separated.
    - FAQs: Kept strictly ATOMIC as 1 chunk per Q&A pair.
    - Shop info: Kept atomic by topic.
    - Policies: If a policy section exceeds max_chunk_words, apply sliding window with overlap.
    """
    doc_type = doc.get("metadata", {}).get("type", "general")
    content = doc["content"]
    metadata = doc["metadata"]
    doc_id = doc["id"]

    # Products, FAQs, and shop-info topics are intentionally atomic
    if doc_type in ["product", "faq", "shop_info"]:
        return [{
            "chunk_id": f"{doc_id}_c0",
            "content": content,
            "metadata": {**metadata, "chunk_index": 0, "total_chunks": 1}
        }]

    # Policies: Check word count
    words = content.split()
    if len(words) <= max_chunk_words:
        return [{
            "chunk_id": f"{doc_id}_c0",
            "content": content,
            "metadata": {**metadata, "chunk_index": 0, "total_chunks": 1}
        }]

    # Large policy clause: Split with overlap
    chunks = []
    start = 0
    chunk_idx = 0
    while start < len(words):
        end = min(start + max_chunk_words, len(words))
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)

        chunks.append({
            "chunk_id": f"{doc_id}_c{chunk_idx}",
            "content": chunk_text,
            "metadata": {**metadata, "chunk_index": chunk_idx}
        })

        if end == len(words):
            break
        start += (max_chunk_words - overlap_words)
        chunk_idx += 1

    for chunk in chunks:
        chunk["metadata"]["total_chunks"] = len(chunks)

    return chunks


def chunk_documents(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Process an entire list of loaded business documents into domain-aware chunks.
    """
    all_chunks = []
    for doc in documents:
        chunks = chunk_document(doc)
        all_chunks.extend(chunks)
    return all_chunks
