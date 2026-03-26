import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { logger } from "../logger";
import { ensureDocsEmbedded } from "../rag/embedDocs";
import { similaritySearch } from "../rag/vectorStore";

const knowledgeBaseInputSchema = z.object({
  query: z
    .string()
    .min(1, "Query is required.")
    .max(300, "Query is too long.")
    .describe(
      "A natural language question about aviation terminology, aircraft, airport codes, or route information.",
    ),
});

function formatKnowledgeResults(
  results: Awaited<ReturnType<typeof similaritySearch>>,
): string {
  if (results.length === 0) {
    return "No knowledge base results found.";
  }

  return results
    .map(
      (result) =>
        `[Source: ${result.source}]\n${result.content.trim()}`,
    )
    .join("\n\n");
}

export async function runKnowledgeBaseQuery(query: string): Promise<string> {
  try {
    const { query: validatedQuery } = knowledgeBaseInputSchema.parse({ query });

    await ensureDocsEmbedded();
    const results = await similaritySearch(validatedQuery, 3);
    const formatted = formatKnowledgeResults(results);

    logger.info({
      tool: "knowledge_base",
      arguments: { query: validatedQuery },
      result: formatted,
    });

    return formatted;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown knowledge base error.";
    const result = `Knowledge base error: ${message}`;

    logger.info({
      tool: "knowledge_base",
      arguments: { query },
      result,
    });

    return result;
  }
}

export const knowledgeBaseTool = tool(
  async ({ query }) => runKnowledgeBaseQuery(query),
  {
    name: "knowledge_base",
    description:
      "Use this for aviation facts and reference knowledge that should come from the local docs, such as aircraft types, squawk codes, airport codes, terminology, and common routes.",
    schema: knowledgeBaseInputSchema,
  },
);
