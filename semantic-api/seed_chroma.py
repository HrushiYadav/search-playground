import httpx
from chroma_store import get_or_create_collection, add_documents

docs = [
    "He returned to his house in the evening.",
    "She was happy to be home after work.",
    "Croissant is a buttery French pastry.",
    "Prashant builds semantic search engines.",
    "Artificial Intelligence is transforming the future.",
    "House and home are often used interchangeably.",
    "I had a croissant and coffee this morning.",
    "Prashant's croissant startup just raised funding."
]

LLM_API = "http://localhost:1234/v1/embeddings"
LLM_MODEL = "text-embedding-nomic-embed-text-v1"


async def generate_embeddings(docs):
    async with httpx.AsyncClient() as client:
        response = await client.post(LLM_API, json={
            "input": docs,
            "model": LLM_MODEL
        })
        data = response.json()
        return [item["embedding"] for item in data["data"]]

async def main():
    collection = get_or_create_collection("articles")
    embeddings = await generate_embeddings(docs)

    # payload = [
    #     {"text": doc, "embedding": emb}
    #     for doc, emb in zip(docs, embeddings)
    # ]
    payload = []
    for i, (doc, emb) in enumerate(zip(docs, embeddings)):
        payload.append({
            "text": doc,
            "embedding": emb,
            "id": f"doc_{i}"
        })
    collection.add(
        documents=[p["text"] for p in payload],
        embeddings=[p["embedding"] for p in payload],
        ids=[p["id"] for p in payload]
    )
    # add_documents(collection, payload)
    # print(f"✅ Added {len(payload)} documents to Chroma!")
    print(f"seeded {collection.count()}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())


