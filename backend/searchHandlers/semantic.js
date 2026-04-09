const axios = require('axios');

const SEMANTIC_API_URL = process.env.SEMANTIC_API_URL || 'http://127.0.0.1:8000';

module.exports = async function semanticSearch(query) {
    try {
        const response = await axios.post(`${SEMANTIC_API_URL}/semantic-search`, {
            query,
        });
        return response.data;
    } catch (ex) {
        console.error("semantic search failed", ex.message);
        return [];
    }
};
