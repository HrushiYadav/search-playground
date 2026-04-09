# search-playground

side-by-side comparison of 4 search paradigms — lexical, fuzzy, phonetic, and semantic — to demonstrate why different search types return different results for the same query.

built this after writing [deep dive on phonetic vs semantic search](https://hrushiyadav.com/blog/phonetic-vs-semantic-search) to make the concepts interactive.

## how it works

type a query and see results from all 4 search types at once:

- **lexical** — exact term matching using elasticsearch
- **fuzzy** — typo-tolerant matching using elasticsearch fuzziness
- **phonetic** — sounds-like matching using soundex algorithm
- **semantic** — meaning-based matching using chromadb vector search

## tech stack

| layer | tech |
|-------|------|
| frontend | react 19, vite, tailwind css |
| backend | express 5, elasticsearch 8, soundex-code |
| semantic api | python, fastapi, chromadb |

## architecture

```
frontend (react)  →  backend (express :3001)  →  elasticsearch
                                               →  soundex
                  →  semantic-api (fastapi)    →  chromadb
```

## setup

### prerequisites

- node.js 18+
- python 3.10+
- elasticsearch 8.x running locally
- docker (optional, for elasticsearch)

### elasticsearch

```bash
# start elasticsearch with docker
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.17.1
```

### backend

```bash
cd backend
npm install
node seed.js        # seed elasticsearch with sample data
node createIndex.js # create search index
npm start           # runs on :3001
```

### semantic api

```bash
cd semantic-api
pip install -r requirements.txt
python seed_chroma.py  # seed chromadb
python main.py         # runs fastapi server
```

### frontend

```bash
cd frontend
npm install
npm run dev  # runs on :5173
```

## project structure

```
backend/
  server.js              # express api with /search endpoint
  searchHandlers/
    lexical.js           # elasticsearch match query
    fuzzy.js             # elasticsearch fuzzy query
    phonetic.js          # soundex-based matching
    semantic.js          # proxies to python semantic api
  seed.js                # seed data into elasticsearch
semantic-api/
  main.py                # fastapi server
  chroma_store.py        # chromadb vector store
  seed_chroma.py         # seed embeddings
frontend/
  src/App.jsx            # search ui with side-by-side results
```

## license

MIT
