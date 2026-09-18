"""
ChromaDB vector retriever with Cosine Distance calculation and >= 0.65 threshold gate.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import os
import chromadb
from dotenv import load_dotenv

from .embeddings import DualEmbeddingFunction, default_embedder

load_dotenv()

DEFAULT_DB_DIR = Path(__file__).resolve().parents[1] / "data" / "chroma_db"
COLLECTION_NAME = "rainbow_ready_mades_knowledge"
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_SCORE_THRESHOLD", "0.65"))
TOP_K = int(os.getenv("TOP_K_RETRIEVAL", "4"))


class ChromaRetriever:
    """
    Retriever managing ChromaDB interactions and similarity threshold filtering.
    """
    def __init__(
        self,
        persist_directory: Optional[Path] = None,
        collection_name: str = COLLECTION_NAME,
        threshold: float = SIMILARITY_THRESHOLD,
        top_k: int = TOP_K,
        embedding_fn: Optional[Any] = None
    ):
        self.persist_directory = Path(persist_directory or DEFAULT_DB_DIR)
        self.collection_name = collection_name
        self.threshold = threshold
        self.top_k = top_k
        self.embedding_fn = embedding_fn or default_embedder

        # Initialize persistent client
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=str(self.persist_directory))

    @property
    def collection(self):
        """Always return the active ChromaDB collection instance."""
        return self.client.get_or_create_collection(
            name=self.collection_name,
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

    def retrieve(self, query: str, top_k: Optional[int] = None) -> Dict[str, Any]:
        """
        Query ChromaDB and filter with cosine similarity threshold.
        Cosine distance d in [0, 2]; Cosine similarity = 1 - d.
        """
        k = top_k or self.top_k
        coll = self.collection
        count = coll.count()
        if count == 0:
            return {
                "chunks": [],
                "max_score": 0.0,
                "is_grounded": False,
                "source_documents": []
            }

        k = min(k, count)
        results = coll.query(
            query_texts=[query],
            n_results=k,
            include=["documents", "metadatas", "distances"]
        )

        documents = results["documents"][0] if results.get("documents") else []
        metadatas = results["metadatas"][0] if results.get("metadatas") else []
        distances = results["distances"][0] if results.get("distances") else []
        ids = results["ids"][0] if results.get("ids") else []

        chunks = []
        source_docs = set()
        max_score = 0.0

        for doc_text, meta, dist, chunk_id in zip(documents, metadatas, distances, ids):
            similarity = max(0.0, min(1.0, 1.0 - float(dist)))
            if similarity > max_score:
                max_score = similarity

            source = meta.get("source", "")
            if source:
                source_docs.add(source)

            chunks.append({
                "chunk_id": chunk_id,
                "content": doc_text,
                "metadata": meta,
                "similarity_score": round(similarity, 4),
                "distance": round(float(dist), 4)
            })

        chunks.sort(key=lambda x: x["similarity_score"], reverse=True)
        is_grounded = max_score >= self.threshold

        return {
            "chunks": chunks,
            "max_score": round(max_score, 4),
            "is_grounded": is_grounded,
            "source_documents": sorted(list(source_docs))
        }
