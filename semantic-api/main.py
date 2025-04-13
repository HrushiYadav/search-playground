from fastapi import FastAPI, Request
import httpx
import chromadb

client = chromadb.PersistentClient(path=".chroma")

collection = client.get_or_create_collection("articles", metadata={"hnsw:space": "cosine"})
print("Chroma Collection count:", collection.count())

LLM_API = "http://localhost:1234/v1/embeddings"
LLM_MODEL = "text-embedding-nomic-embed-text-v1"

app = FastAPI()

@app.post("/semantic-search")
async def semantic_search(req: Request):
    body = await req.json()
    query = body["query"]

    async with httpx.AsyncClient() as client:
        res = await client.post(LLM_API, json={
            "input": query,
            "model": LLM_MODEL
        })
        data = res.json()

        if "data" not in data or not data["data"]:
            raise ValueError(f"Invalid embedding response: {data}")

        embedding = data["data"][0]["embedding"]

    result = collection.query(
        query_embeddings=[embedding],
        n_results=5,
        include=["documents", "distances"]
    )

    docs = result.get("documents", [[]])[0]
    distances = result.get("distances", [[]])[0]

    return [
        {"text": doc, "score": 1 - score}
        for doc, score in zip(docs, distances)
    ]


