import httpx
import chromadb

LLM_API = "http://localhost:1234/v1/embeddings"
LLM_MODEL = "text-embedding-nomic-embed-text-v1"

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

async def embed(texts):
    async with httpx.AsyncClient() as client:
        res = await client.post(LLM_API, json={
            "input": texts,
            "model": LLM_MODEL
        })
        data = res.json()
        return [d["embedding"] for d in data["data"]]

async def main():
    
    client = chromadb.PersistentClient(path=".chroma")
    try:
        client.delete_collection("articles")
    except:
        pass

    collection = client.get_or_create_collection("articles", metadata={"hnsw:space": "cosine"})

    embeddings = await embed(docs)
    collection.add(
        documents=docs,
        embeddings=embeddings,
        ids=[f"doc_{i}" for i in range(len(docs))]
    )

    print(f"✅ Seeded {collection.count()} documents using COSINE metric!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
