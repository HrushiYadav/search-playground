# search-playground

side-by-side comparison of 4 search paradigms — lexical, fuzzy, phonetic, and semantic — to demonstrate why different search types return different results for the same query.

built this after writing [deep dive on phonetic vs semantic search](https://hrushiyadav.com/blog/phonetic-vs-semantic-search) to make the concepts interactive.

## how it works

type a query and see results from all 4 search types at once:

- **lexical** — exact term matching using elasticsearch
- **fuzzy** — typo-tolerant matching using elasticsearch fuzziness
- **phonetic** — sounds-like matching using elasticsearch phonetic analyzer
- **semantic** — meaning-based matching using azure openai embeddings + chromadb

## tech stack

| layer | tech |
|-------|------|
| frontend | react 19, vite, tailwind css |
| backend | express 5, elasticsearch 8, soundex-code |
| semantic api | python, fastapi, chromadb, azure openai |

## architecture

```
frontend (react :5173)
  ↓ POST /search-all
backend (express :3001)
  ├── lexical   → elasticsearch (exact match)
  ├── fuzzy     → elasticsearch (fuzziness: AUTO)
  ├── phonetic  → elasticsearch (phonetic analyzer)
  └── semantic  → semantic-api (fastapi :8000) → chromadb
```

## setup

### prerequisites

- node.js 18+
- python 3.10+
- docker
- azure openai with `text-embedding-3-small` deployment

### 1. start elasticsearch

```bash
docker compose up -d
```

this starts elasticsearch 8.12 with the phonetic analysis plugin.

### 2. backend

```bash
cd backend
cp .env.example .env  # edit if needed
npm install
node seed.js          # creates index + seeds 15 articles
npm start             # runs on :3001
```

### 3. semantic api

```bash
cd semantic-api
cp .env.example .env  # add your azure openai credentials
pip install -r requirements.txt
python reseed.py      # generates embeddings + seeds chromadb
uvicorn main:app --port 8000
```

### 4. frontend

```bash
cd frontend
npm install
npm run dev  # runs on :5173
```

## project structure

```
docker-compose.yml              # elasticsearch with phonetic plugin
backend/
  server.js                     # express api with /search and /search-all
  esClient.js                   # elasticsearch connection
  createIndex.js                # index schema with phonetic + synonym analyzers
  seed.js                       # seed 15 curated articles
  searchHandlers/
    lexical.js                  # elasticsearch multi_match query
    fuzzy.js                    # elasticsearch fuzzy query
    phonetic.js                 # elasticsearch phonetic analyzer query
    semantic.js                 # proxies to python semantic api
semantic-api/
  main.py                       # fastapi server with azure openai embeddings
  reseed.py                     # seed chromadb with same articles as elasticsearch
frontend/
  src/App.jsx                   # 4-column parallel search comparison ui
```

## example queries

- `prashant` — phonetic matches "croissant", semantic finds related meaning, lexical finds nothing
- `home` — all 4 return different ranked results
- `croisant` — fuzzy catches the typo, phonetic matches the sound
- `ai` — synonyms expand to "artificial intelligence" across all types

## license

MIT
