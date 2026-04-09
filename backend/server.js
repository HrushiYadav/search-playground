require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const performLexicalSearch = require('./searchHandlers/lexical');
const performFuzzySearch = require('./searchHandlers/fuzzy');
const performPhoenticSearch = require('./searchHandlers/phonetic');
const performSemanticSearch = require('./searchHandlers/semantic');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/search', async (req, res) => {
    const { query, type } = req.body;

    if (!query || !type) {
        return res.status(400).json({ error: 'Query and type are required' });
    }

    try {
        let results;
        switch (type) {
            case 'lexical':
                results = await performLexicalSearch(query);
                break;
            case 'fuzzy':
                results = await performFuzzySearch(query);
                break;
            case 'phonetic':
                results = await performPhoenticSearch(query);
                break;
            case 'semantic':
                results = await performSemanticSearch(query);
                break;
            default:
                return res.status(400).json({ error: 'Invalid search type' });
        }

        res.json({ results });
    } catch (ex) {
        console.error(ex);
        res.status(500).json({ error: 'Search Failed' });
    }
});

app.post('/search-all', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    const run = async (fn, name) => {
        try {
            return { results: await fn(query), error: null };
        } catch (ex) {
            console.error(`${name} search failed:`, ex.message);
            return { results: [], error: ex.message };
        }
    };

    const [lexical, fuzzy, phonetic, semantic] = await Promise.all([
        run(performLexicalSearch, 'lexical'),
        run(performFuzzySearch, 'fuzzy'),
        run(performPhoenticSearch, 'phonetic'),
        run(performSemanticSearch, 'semantic'),
    ]);

    res.json({ lexical, fuzzy, phonetic, semantic });
});

app.listen(3001, () => {
    console.log('Backend is running on http://localhost:3001');
});
