const esClient = require("../esClient");

module.exports = async function lexical(query){
    const response = await esClient.search({
        index: 'articles',
        query: {
            multi_match: {
                 query,
                 fields: ['title^3', 'body', 'tags']
            }
        }
    });
    return response.hits.hits.map((hit) => ({
        text: hit._source,
        score: hit._score
    }))
};