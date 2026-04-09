import os
import asyncio
import httpx
import chromadb
from dotenv import load_dotenv

load_dotenv()

AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT").rstrip("/")
AZURE_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_DEPLOYMENT = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")
AZURE_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview")

# same articles as backend/seed.js
articles = [
    {"title": "Croissant Dev Diaries", "body": "Logs of a developer who codes better with croissants."},
    {"title": "Croissant Chronicles", "body": "Exploring the buttery layers of croissants and their impact on productivity."},
    {"title": "The Croissant Effect", "body": "How croissants became a symbol of creativity in the tech world."},
    {"title": "Mastering the Art of Croissants", "body": "A guide to baking the perfect croissant and its parallels to coding."},
    {"title": "Croissants and Coffee", "body": "The perfect pairing for brainstorming your next big idea."},
    {"title": "The Science Behind Croissants", "body": "Understanding the chemistry of croissants and its lessons for developers."},
    {"title": "The Rise of AI", "body": "Artificial Intelligence (AI) is transforming the future."},
    {"title": "Organising JavaScript Projects", "body": "Organise or organize? Either way, this guide helps structure your JS projects."},
    {"title": "Resume vs. Resume", "body": "Learn how to write a winning resume (or resume)."},
    {"title": "The Meaning of Home", "body": "Understanding what makes a house feel like a home."},
    {"title": "House Hunting 101", "body": "Tips and tricks for finding the perfect house in your budget."},
    {"title": "JS vs JavaScript: Myths Busted", "body": "Are JS and JavaScript the same? Let's settle it once and for all."},
    {"title": "The Resume Game", "body": "How to write a resume that lands interviews."},
    {"title": "Artificial Intelligence in 5 Minutes", "body": "A quick overview of how AI is transforming the world."},
    {"title": "Prashant Builds Search Engines", "body": "Prashant builds semantic search engines and loves croissants."},
]


async def get_embeddings(texts):
    url = f"{AZURE_ENDPOINT}/openai/deployments/{AZURE_DEPLOYMENT}/embeddings?api-version={AZURE_API_VERSION}"
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(url, json={"input": texts}, headers={"api-key": AZURE_KEY})
        res.raise_for_status()
        data = res.json()["data"]
        return [item["embedding"] for item in sorted(data, key=lambda x: x["index"])]


async def main():
    client = chromadb.PersistentClient(path=".chroma")
    try:
        client.delete_collection("articles")
    except Exception:
        pass

    collection = client.get_or_create_collection("articles", metadata={"hnsw:space": "cosine"})

    texts = [f"{a['title']}. {a['body']}" for a in articles]
    print(f"generating embeddings for {len(texts)} articles...")
    embeddings = await get_embeddings(texts)

    collection.add(
        documents=texts,
        embeddings=embeddings,
        ids=[f"doc_{i}" for i in range(len(texts))],
        metadatas=[{"title": a["title"]} for a in articles],
    )

    print(f"seeded {collection.count()} documents into chroma")


if __name__ == "__main__":
    asyncio.run(main())
