require('dotenv').config();
const client = require('./esClient');
const createIndex = require('./createIndex');
const articles = require('./articles');

async function seed() {
    await createIndex();

    for (let i = 0; i < articles.length; i++) {
        await client.index({
            index: 'articles',
            id: i + 1,
            document: articles[i]
        });
    }

    await client.indices.refresh({ index: 'articles' });
    console.log(`Seeded ${articles.length} articles`);
}

seed().catch(console.error);
