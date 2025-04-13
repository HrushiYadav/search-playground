import chromadb
from typing import List

client = chromadb.Client()

def get_or_create_collection(name):
    return client.get_or_create_collection(name)

def add_documents(collection, docs):
    texts = [doc["text"] for doc in docs]
    embeddings = [doc["embedding"] for doc in docs]
    ids = [f"doc_{i}" for i in range(len(docs))]
    metadatas = [
        {k: v for k, v in doc.items() if k!= "embedding" and isinstance(v,(str, int, float, bool))}
        for doc in docs
    ]
    collection.add(documents = texts , embeddings= embeddings, ids = ids, metadatas = metadatas)



def query_collection(collection, embedding, k=5):
    print("🧪 Embedding shape:", len(embedding))

    try:
        result = collection.query(
            query_embeddings=[embedding],
            n_results=k,
            include=["documents", "distances"]
        )
    except Exception as e:
        print("❌ Chroma query failed:", str(e))
        return []

    docs = result.get("documents", [[]])[0]
    distances = result.get("distances", [[]])[0]

    print("📊 Chroma returned:", len(docs), "documents")
    print("📦 Raw docs:", docs)
    print("📈 Raw distances:", distances)

    return [
        {"text": doc, "score": round(1 - score, 4)}
        for doc, score in zip(docs, distances)
    ]
