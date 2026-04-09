const client = require("./esClient");

async function createIndex() {
  const exists = await client.indices.exists({ index: "articles" });

  if (exists) {
    await client.indices.delete({ index: "articles" });
    console.log("Deleted old index");
  }

  await client.indices.create({
    index: "articles",
    body: {
      mappings: {
        properties: {
          title: { type: "text" },
          body: { type: "text" },
          tags: { type: "text" }
        }
      }
    }
  });

  console.log("Created articles index");
}

module.exports = createIndex;
