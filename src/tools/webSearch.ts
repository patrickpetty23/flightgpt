import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { logger } from "../logger";

const MAX_RESULTS = 3;

const webSearchInputSchema = z.object({
  query: z
    .string()
    .min(1, "Query is required.")
    .max(300, "Query is too long.")
    .describe("The web search query to run for current aviation information."),
});

const tavilyResultSchema = z.object({
  title: z.string().default("Untitled"),
  content: z.string().default(""),
  url: z.string().url(),
});

const tavilyResponseSchema = z.object({
  results: z.array(tavilyResultSchema).default([]),
});

function formatSearchResults(
  results: Array<z.infer<typeof tavilyResultSchema>>,
): string {
  if (results.length === 0) {
    return "No web search results found.";
  }

  return results
    .map((result, index) => {
      const snippet = result.content.trim() || "No summary available.";

      return [
        `${index + 1}. ${result.title}`,
        `Content: ${snippet}`,
        `URL: ${result.url}`,
      ].join("\n");
    })
    .join("\n\n");
}

export async function runWebSearch(query: string): Promise<string> {
  try {
    const { query: validatedQuery } = webSearchInputSchema.parse({ query });
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      const result =
        "Web search unavailable: TAVILY_API_KEY is not set in the environment.";

      logger.info({
        tool: "web_search",
        arguments: { query: validatedQuery, maxResults: MAX_RESULTS },
        result,
      });

      return result;
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: validatedQuery,
        max_results: MAX_RESULTS,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily request failed with status ${response.status}.`);
    }

    const rawPayload = (await response.json()) as unknown;
    const payload = tavilyResponseSchema.parse(rawPayload);
    const result = formatSearchResults(payload.results);

    logger.info({
      tool: "web_search",
      arguments: { query: validatedQuery, maxResults: MAX_RESULTS },
      result,
    });

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown web search error.";
    const result = `Web search error: ${message}`;

    logger.info({
      tool: "web_search",
      arguments: { query, maxResults: MAX_RESULTS },
      result,
    });

    return result;
  }
}

export const webSearchTool = tool(
  async ({ query }) => runWebSearch(query),
  {
    name: "web_search",
    description:
      "Use this when the user needs current or niche aviation information that may not exist in the local knowledge base, such as delays, airline news, or recent aircraft details.",
    schema: webSearchInputSchema,
  },
);
