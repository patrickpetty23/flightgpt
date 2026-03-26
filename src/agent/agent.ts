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

type AgentToolStreamEvent =
  | {
      event: "on_tool_start";
      name: string;
      input: unknown;
    }
  | {
      event: "on_tool_event";
      name: string;
      data: unknown;
    }
  | {
      event: "on_tool_end";
      name: string;
      output: unknown;
    }
  | {
      event: "on_tool_error";
      name: string;
      error: unknown;
    };

export type FlightGptStreamStep = {
  type: "status" | "tool_start" | "tool_end" | "tool_error";
  label: string;
  tool?: string;
};

function getToolStepLabel(
  toolName: string,
  phase: "start" | "end" | "error",
): string {
  const labels: Record<
    string,
    { start: string; end: string; error: string }
  > = {
    calculator: {
      start: "Calculating the answer...",
      end: "Calculation complete.",
      error: "The calculation step failed.",
    },
    knowledge_base: {
      start: "Checking the aviation knowledge base...",
      end: "Knowledge base search complete.",
      error: "The knowledge base search failed.",
    },
    flight_lookup: {
      start: "Looking up live flight data...",
      end: "Live flight lookup complete.",
      error: "The live flight lookup failed.",
    },
    web_search: {
      start: "Searching the web for current information...",
      end: "Web search complete.",
      error: "The web search failed.",
    },
  };

  return labels[toolName]?.[phase] ?? (
    phase === "start"
      ? "Working on that..."
      : phase === "end"
        ? "Step complete."
        : "A step failed."
  );
}

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

function isAgentToolStreamEvent(value: unknown): value is AgentToolStreamEvent {
  if (!value || typeof value !== "object" || !("event" in value)) {
    return false;
  }

  const event = (value as { event?: unknown }).event;
  return (
    event === "on_tool_start" ||
    event === "on_tool_event" ||
    event === "on_tool_end" ||
    event === "on_tool_error"
  );
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

export async function streamFlightGptAgent(
  input: string,
  history: FlightGptChatMessage[] = [],
  options: {
    signal?: AbortSignal;
    onStep?: (step: FlightGptStreamStep) => void;
  } = {},
): Promise<string> {
  const agent = createFlightGptAgent();
  const messages = [...history, { role: "user" as const, content: input }];

  logger.info({
    event: "agent_stream",
    model: DEFAULT_MODEL,
    recursionLimit: RECURSION_LIMIT,
    historyLength: history.length,
    input,
  });

  const stream = await agent.stream(
    { messages },
    {
      recursionLimit: RECURSION_LIMIT,
      streamMode: ["tools", "values"],
      signal: options.signal,
    },
  );

  let lastResult: AgentResult | undefined;

  for await (const chunk of stream) {
    if (!Array.isArray(chunk) || chunk.length !== 2) {
      continue;
    }

    const [mode, payload] = chunk as [string, unknown];

    if (mode === "values") {
      lastResult = payload as AgentResult;
      continue;
    }

    if (mode !== "tools" || !isAgentToolStreamEvent(payload)) {
      continue;
    }

    if (payload.event === "on_tool_start") {
      options.onStep?.({
        type: "tool_start",
        tool: payload.name,
        label: getToolStepLabel(payload.name, "start"),
      });
      continue;
    }

    if (payload.event === "on_tool_end") {
      options.onStep?.({
        type: "tool_end",
        tool: payload.name,
        label: getToolStepLabel(payload.name, "end"),
      });
      continue;
    }

    if (payload.event === "on_tool_error") {
      options.onStep?.({
        type: "tool_error",
        tool: payload.name,
        label: getToolStepLabel(payload.name, "error"),
      });
    }
  }

  const reply = lastResult
    ? getLatestAssistantReply(lastResult)
    : "No response returned by the agent.";

  logger.info({
    event: "agent_response",
    output: reply,
  });

  return reply;
}
