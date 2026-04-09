import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
import httpx
import chromadb

load_dotenv()

AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT").rstrip("/")
AZURE_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")
AZURE_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")

client = chromadb.PersistentClient(path=".chroma")
collection = client.get_or_create_collection("articles", metadata={"hnsw:space": "cosine"})
print("Chroma collection count:", collection.count())

app = FastAPI()


async def get_embedding(text: str) -> list[float]:
    url = f"{AZURE_ENDPOINT}/openai/deployments/{AZURE_DEPLOYMENT}/embeddings?api-version={AZURE_API_VERSION}"
    async with httpx.AsyncClient() as http:
        res = await http.post(url, json={"input": text}, headers={"api-key": AZURE_KEY})
        res.raise_for_status()
        return res.json()["data"][0]["embedding"]


async def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    url = f"{AZURE_ENDPOINT}/openai/deployments/{AZURE_DEPLOYMENT}/embeddings?api-version={AZURE_API_VERSION}"
    async with httpx.AsyncClient() as http:
        res = await http.post(url, json={"input": texts}, headers={"api-key": AZURE_KEY})
        res.raise_for_status()
        data = res.json()["data"]
        return [item["embedding"] for item in sorted(data, key=lambda x: x["index"])]


@app.post("/semantic-search")
async def semantic_search(req: Request):
    body = await req.json()
    query = body["query"]

    embedding = await get_embedding(query)

    result = collection.query(
        query_embeddings=[embedding],
        n_results=5,
        include=["documents", "distances", "metadatas"]
    )

    docs = result.get("documents", [[]])[0]
    distances = result.get("distances", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]

    return [
        {
            "text": {"title": meta.get("title", ""), "body": doc},
            "score": round(1 - dist, 4)
        }
        for doc, dist, meta in zip(docs, distances, metadatas)
    ]
