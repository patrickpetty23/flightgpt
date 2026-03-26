import { ChatAnthropic } from "@langchain/anthropic";
import { createAgent } from "langchain";

import { logger } from "../logger";
import { calculatorTool } from "../tools/calculator";
import { flightLookupTool } from "../tools/flightLookup";
import { knowledgeBaseTool } from "../tools/knowledgeBase";
import { webSearchTool } from "../tools/webSearch";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
const RECURSION_LIMIT = 10;

export type FlightGptChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AgentResult = {
  messages?: Array<{
    content?: unknown;
  }>;
};

function stringifyContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }

        return JSON.stringify(part);
      })
      .join("\n")
      .trim();
  }

  if (content == null) {
    return "";
  }

  return JSON.stringify(content);
}

function getLatestAssistantReply(result: AgentResult): string {
  const lastMessage = result.messages?.[result.messages.length - 1];
  const reply = stringifyContent(lastMessage?.content).trim();

  return reply || "No response returned by the agent.";
}

export function createFlightGptAgent() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment before running the agent.",
    );
  }

  const llm = new ChatAnthropic({
    apiKey,
    model: DEFAULT_MODEL,
    temperature: 0,
  });

  return createAgent({
    model: llm,
    tools: [calculatorTool, knowledgeBaseTool, flightLookupTool, webSearchTool],
    systemPrompt:
      "You are FlightGPT, an aviation assistant. Use calculator for math and unit conversions. Use knowledge_base for aviation definitions, aircraft facts, airport codes, route reference information, and aviation math reference facts from the local docs. Use flight_lookup for live aircraft over supported places or by callsign. Use web_search only for current or changing real-world information such as delays, airport status, airline news, or details not covered by local docs or flight lookup.",
  });
}

export async function invokeFlightGptAgent(
  input: string,
  history: FlightGptChatMessage[] = [],
): Promise<string> {
  const agent = createFlightGptAgent();
  const messages = [...history, { role: "user" as const, content: input }];

  logger.info({
    event: "agent_invoke",
    model: DEFAULT_MODEL,
    recursionLimit: RECURSION_LIMIT,
    historyLength: history.length,
    input,
  });

  const result = (await agent.invoke(
    { messages },
    { recursionLimit: RECURSION_LIMIT },
  )) as AgentResult;

  const reply = getLatestAssistantReply(result);

  logger.info({
    event: "agent_response",
    output: reply,
  });

  return reply;
}
