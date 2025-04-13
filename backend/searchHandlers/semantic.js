const axios = require('axios');
const { resolve } = require('path');

module.exports = async function semanticSearch(query){
    try{
        const response = await axios.post("http://127.0.0.1:8000/semantic-search",{
            query,
        });
        const results = response.data;
        
        return results;
    }
    catch(ex){
        console.error("semantic search failed", ex.message);
        return [];
    }
}