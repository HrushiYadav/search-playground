const { soundex } = require('soundex-code');
const articles = require('../articles');

const SYNONYMS = {
    'prashant': ['croissant'],
    'croissant': ['prashant'],
    'js': ['javascript'],
    'javascript': ['js'],
    'ai': ['artificial', 'intelligence'],
    'artificial': ['ai'],
    'intelligence': ['ai'],
    'dev': ['developer'],
    'developer': ['dev'],
    'resume': ['resumé'],
    'house': ['home'],
    'home': ['house'],
};

function expandQuery(query) {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const expanded = new Set(tokens);
    for (const token of tokens) {
        if (SYNONYMS[token]) {
            SYNONYMS[token].forEach(s => expanded.add(s));
        }
    }
    return [...expanded];
}

module.exports = async function phonetic(query) {
    const expandedTokens = expandQuery(query);
    const querySoundexCodes = expandedTokens.map(t => soundex(t)).filter(Boolean);

    const scored = articles.map(article => {
        const allText = `${article.title} ${article.body} ${(article.tags || []).join(' ')}`;
        const tokens = allText.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        const tokenSoundexCodes = [...new Set(tokens.map(t => soundex(t)).filter(Boolean))];

        let score = 0;

        // soundex matching across all text
        for (const qs of querySoundexCodes) {
            if (tokenSoundexCodes.includes(qs)) {
                score += 1;
            }
        }

        // direct token matching (after synonym expansion)
        for (const qt of expandedTokens) {
            if (tokens.includes(qt)) {
                score += 2;
            }
        }

        // title boost
        const titleTokens = article.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        for (const qt of expandedTokens) {
            if (titleTokens.includes(qt)) {
                score += 3;
            }
        }

        return { text: article, score };
    });

    return scored
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
};
