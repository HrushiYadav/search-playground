import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001/search-all";

const SEARCH_TYPES = [
  { key: "lexical", label: "Lexical", desc: "exact term matching" },
  { key: "fuzzy", label: "Fuzzy", desc: "typo-tolerant matching" },
  { key: "phonetic", label: "Phonetic", desc: "sounds-like matching" },
  { key: "semantic", label: "Semantic", desc: "meaning-based matching" },
];

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(API_URL, { query: query.trim() });
      setResults(res.data);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-1 text-zinc-100">
          search playground
        </h1>
        <p className="text-zinc-500 text-sm mb-6">
          compare lexical, fuzzy, phonetic, and semantic search side by side
        </p>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            placeholder='try "prashant", "home", "ai", "croisant"...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
          >
            {loading ? "searching..." : "search"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {SEARCH_TYPES.map(({ key, label, desc }) => (
              <SearchColumn
                key={key}
                label={label}
                desc={desc}
                data={results[key]}
              />
            ))}
          </div>
        )}

        {!results && !loading && (
          <div className="text-center text-zinc-600 mt-20">
            <p className="text-lg">type a query to compare all 4 search types</p>
            <p className="text-sm mt-2">
              see why "prashant" matches "croissant" in phonetic but not lexical
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchColumn({ label, desc, data }) {
  const results = data?.results || [];
  const error = data?.error;
  const count = results.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-100">{label}</h2>
          <span className="text-xs text-zinc-500">{count} results</span>
        </div>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>

      <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        {!error && count === 0 && (
          <p className="text-zinc-600 text-sm text-center py-4">no matches</p>
        )}

        {results.map((item, idx) => (
          <div
            key={idx}
            className="bg-zinc-800/50 rounded px-3 py-2 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-orange-400">
                {item.score?.toFixed(4)}
              </span>
              <span className="text-xs text-zinc-600">#{idx + 1}</span>
            </div>
            {typeof item.text === "object" ? (
              <>
                <p className="text-sm font-medium text-zinc-200">
                  {item.text.title}
                </p>
                <p className="text-xs text-zinc-400">{item.text.body}</p>
              </>
            ) : (
              <p className="text-sm text-zinc-300">{String(item.text)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
