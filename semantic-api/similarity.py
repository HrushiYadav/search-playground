
import httpx
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

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

query = "home"

async def embed(texts):
    async with httpx.AsyncClient() as client:
        res = await client.post(LLM_API, json={
            "input": texts,
            "model": LLM_MODEL
        })
        data = res.json()
        return [d["embedding"] for d in data["data"]]

async def main():
    all_texts = [query] + docs
    embeddings = await embed(all_texts)

    query_embedding = np.array(embeddings[0]).reshape(1, -1)
    doc_embeddings = np.array(embeddings[1:])

    similarities = cosine_similarity(query_embedding, doc_embeddings)[0]
    sorted_docs = sorted(zip(docs, similarities), key=lambda x: -x[1])

    print(f"🔍 Semantic similarities for query: '{query}'\n")
    for i, (text, score) in enumerate(sorted_docs):
        print(f"{i+1}. Score: {score:.4f} | \"{text}\"")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
