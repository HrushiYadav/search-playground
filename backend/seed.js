const client = require('./esClient');
const createIndex = require('./createIndex');

async function seed() {
    await createIndex();
    const extraArticles = [
        {
            title: 'Croissant Dev Diaries',
            body: 'Logs of a developer who codes better with croissants.',
            tags: ['croissant', 'js', 'prashant', 'soundex']
        },
        {
            title: 'Croissant Chronicles',
            body: 'Exploring the buttery layers of croissants and their impact on productivity.',
            tags: ['croissant', 'productivity', 'food']
        },
        {
            title: 'The Croissant Effect',
            body: 'How croissants became a symbol of creativity in the tech world.',
            tags: ['croissant', 'creativity', 'tech']
        },
        {
            title: 'Mastering the Art of Croissants',
            body: 'A guide to baking the perfect croissant and its parallels to coding.',
            tags: ['croissant', 'baking', 'coding']
        },
        {
            title: 'Croissants and Coffee',
            body: 'The perfect pairing for brainstorming your next big idea.',
            tags: ['croissant', 'coffee', 'brainstorming']
        },
        {
            title: 'The Science Behind Croissants',
            body: 'Understanding the chemistry of croissants and its lessons for developers.',
            tags: ['croissant', 'science', 'developers']
        },
        {
            title: 'The Rise of AI',
            body: 'Artificial Intelligence (AI) is transforming the future.',
            tags: ['ai', 'artificial intelligence']
        },
        {
            title: 'Organising JavaScript Projects',
            body: 'Organise or organize? Either way, this guide helps structure your JS projects.',
            tags: ['organise', 'organize', 'js', 'project']
        },
        {
            title: 'Resume vs. Resumé',
            body: 'Learn how to write a winning resume (or resumé).',
            tags: ['resume', 'resumé', 'career']
        },{
            title: 'The Meaning of Home',
            body: 'Understanding what makes a house feel like a home.',
            tags: ['home', 'lifestyle', 'family']
          },
          {
            title: 'House Hunting 101',
            body: 'Tips and tricks for finding the perfect house in your budget.',
            tags: ['house', 'real estate', 'home']
          },
          {
            title: 'JS vs JavaScript: Myths Busted',
            body: 'Are JS and JavaScript the same? Let’s settle it once and for all.',
            tags: ['js', 'javascript', 'frontend']
          },
          {
            title: 'The Resume Game',
            body: 'How to write a resume that lands interviews, even if it’s spelled resumé.',
            tags: ['resume', 'career', 'job hunt']
          },
          {
            title: 'Artificial Intelligence in 5 Minutes',
            body: 'A quick overview of how AI is transforming the world.',
            tags: ['ai', 'artificial intelligence', 'tech']
          }
    ];
    const titles = [...Array(50)].map((_,i) => `Articles ${i+1}`);
    const topics = [
        'search engines', 'frontend development', 'AI tools',
        'developer culture', 'productivity', 'mental wellness',
        'financial literacy', 'cooking habits', 'remote work'
    ];

    const articles = Array.from({length: 50}, (_,i) => ({
        title: titles[i],
        body:  `This is article ${i + 1} about ${topics[i % topics.length]}.`,
        tags: ['tech', 'lifestyles', 'productivity']
    }));

    const all = [...articles, ...extraArticles];

    for(let i = 0; i < all.length; i++){
        await client.index({
            index: 'articles',
            id: i+1,
            document: all[i]
        });
    }

    await client.indices.refresh({ index: 'articles'});
    console.log(`Seeded ${all.length} articles`);
}

seed().catch(console.error);