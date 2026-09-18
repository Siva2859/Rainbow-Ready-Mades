"""
Main Ingestion Script for Rainbow Ready Mades.
Loads verified business data, generates domain-aware semantic chunks,
creates vector embeddings, and stores them in persistent ChromaDB.
"""

from pathlib import Path
import sys
import os

# Add relevant directories to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
CHATBOT_DIR = SCRIPT_DIR.parent
REPO_ROOT = CHATBOT_DIR.parent

for p in [str(REPO_ROOT), str(CHATBOT_DIR), str(SCRIPT_DIR)]:
    if p not in sys.path:
        sys.path.append(p)

try:
    from ingestion.loaders import load_all_business_data
    from ingestion.chunking import chunk_documents
    from app.embeddings import default_embedder
except ImportError:
    from loaders import load_all_business_data
    from chunking import chunk_documents
    from app.embeddings import default_embedder

import chromadb

DATA_DIR = REPO_ROOT / "business-data"
CHROMA_DIR = CHATBOT_DIR / "data" / "chroma_db"
COLLECTION_NAME = "rainbow_ready_mades_knowledge"


def run_ingestion(data_dir: Path = DATA_DIR, chroma_dir: Path = CHROMA_DIR) -> int:
    """
    Execute end-to-end ingestion pipeline into ChromaDB.
    """
    print(f"=== Starting Rainbow Ready Mades Business Data Ingestion ===")
    print(f"Source Directory: {data_dir}")
    print(f"ChromaDB Directory: {chroma_dir}")

    # 1. Load verified business data
    raw_docs = load_all_business_data(data_dir)
    print(f"Loaded {len(raw_docs)} verified business source documents.")

    if not raw_docs:
        print("Error: No valid documents found to ingest!")
        return 0

    # 2. Domain-aware semantic chunking
    chunks = chunk_documents(raw_docs)
    print(f"Generated {len(chunks)} domain-aware semantic chunks.")

    # 3. Initialize ChromaDB client and collection
    chroma_dir.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(chroma_dir))

    # Reset collection to avoid stale data
    try:
        client.delete_collection(name=COLLECTION_NAME)
        print(f"Cleared existing '{COLLECTION_NAME}' collection.")
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=default_embedder,
        metadata={"hnsw:space": "cosine"}
    )

    # 4. Prepare batch payload
    ids = [c["chunk_id"] for c in chunks]
    documents = [c["content"] for c in chunks]
    metadatas = []
    for c in chunks:
        # Chroma requires metadata values to be str, int, float, or bool
        cleaned_meta = {}
        for k, v in c["metadata"].items():
            if isinstance(v, (str, int, float, bool)):
                cleaned_meta[k] = v
            else:
                cleaned_meta[k] = str(v)
        metadatas.append(cleaned_meta)

    # 5. Add to ChromaDB
    print(f"Indexing {len(documents)} chunks into ChromaDB...")
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    count = collection.count()
    print(f"Successfully indexed {count} chunks in collection '{COLLECTION_NAME}'.")
    print("=== Ingestion Completed Successfully ===")
    return count


if __name__ == "__main__":
    run_ingestion()
