const client = require("./esClient");

async function createIndex() {
  const exists = await client.indices.exists({ index: "articles" });

  if (exists) {
    await client.indices.delete({ index: "articles" });
    console.log("🗑️ Deleted old index");
  }

  await client.indices.create({
    index: "articles",
    body: {
      settings: {
        analysis: {
          filter: {
            synonym_filter: {
              type: "synonym",
              synonyms: [
                "prashant, croissant",
                "js, javascript",
                "ai, artificial intelligence",
                "dev, developer",
                "resume, resumé",
                "house, home"
              ]
            },
            phonetic_filter: {
              type: "phonetic",
              encoder: "metaphone",
              replace: false
            }
          },
          analyzer: {
            custom_search_analyzer: {
              tokenizer: "standard",
              filter: ["lowercase", "synonym_filter", "phonetic_filter"]
            }
          }
        }
      },
      mappings: {
        properties: {
          title: { type: "text", analyzer: "custom_search_analyzer" },
          body: { type: "text", analyzer: "custom_search_analyzer" },
          tags: { type: "text", analyzer: "custom_search_analyzer" }
        }
      }
    }
  });

  console.log("✅ Created articles index with custom analyzer");
}

createIndex().catch(console.error);

module.exports = createIndex;
