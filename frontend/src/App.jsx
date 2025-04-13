import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3001/search"; 

function App() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("semantic");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await axios.post(API_URL, { query, type });
      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Search Playground 🔍</h1>

        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Type your query (e.g. prashant, home)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="semantic">Semantic</option>
          <option value="lexical">Lexical</option>
          <option value="fuzzy">Fuzzy</option>
          <option value="phonetic">Phonetic</option>
        </select>

        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>

        <div className="mt-4 space-y-2">
          {results.map((res, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-3 rounded border text-sm space-y-1"
            >
              <p><strong>Score:</strong> {res.score?.toFixed(4)}</p>
              <p className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(res.text, null, 2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
