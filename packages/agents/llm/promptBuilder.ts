export function buildMongoPrompt(prompt: string, schema: Record<string, any>): string {
  const collections = Object.entries(schema)
    .map(([collection, { fields }]) => {
      const fieldList = Object.entries(fields)
        .map(([field, info]) => {
          let refInfo = "";
          if (info.type === "ObjectId" && info.ref) {
            refInfo = ` (refers to ${info.ref})`;
          }
          return `${field}${refInfo}`;
        })
        .join(", ");
      return `- ${collection}: ${fieldList}`;
    })
    .join("\n");

  return `
You are an AI assistant that converts natural language into MongoDB structured query plans.

Available collections and their fields (with references):
${collections}

Important notes:
- Fields with type "ObjectId" and a "ref" property indicate references to other collections.
- To join referenced collections, use MongoDB aggregation stage "$lookup".
- Use "$lookup" only when the user query implies a relationship (e.g., "users who posted gigs").
- If no join is needed, use "find" operations.
- Always validate field and collection names exist in the schema.
- Do not hallucinate collections or fields.
- Output only valid JSON representing a query plan.

The query plan format:
{
  "operation": "find" | "aggregate" | "insert" | "update" | "delete",
  "collection": "string",
  "filter": { ... },
  "projection": { ... },
  "options": { ... },
  "aggregatePipeline": [ ... ],
  "insertDoc": [ ... ],
  "updateDoc": { ... }
}

User prompt: ${prompt}

Respond ONLY with the query plan JSON, no explanations.
`.trim();
}
