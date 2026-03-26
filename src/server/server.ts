import path from "node:path";

import express from "express";
import { z } from "zod";

import {
  invokeFlightGptAgent,
  streamFlightGptAgent,
  type FlightGptChatMessage,
} from "../agent/agent";
import { logger } from "../logger";

const PORT = Number(process.env.PORT ?? "3000");

const historyMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message is required."),
  history: z.array(historyMessageSchema).default([]),
});

function getPublicDirectory(): string {
  return path.resolve(process.cwd(), "public");
}

function getIndexFilePath(): string {
  return path.join(getPublicDirectory(), "index.html");
}

function writeSseEvent(
  response: express.Response,
  payload: Record<string, unknown>,
): void {
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(express.static(getPublicDirectory()));

  app.get("/", (_request, response) => {
    response.sendFile(getIndexFilePath());
  });

  app.post("/chat", async (request, response) => {
    try {
      const { message, history } = chatRequestSchema.parse(request.body);
      const reply = await invokeFlightGptAgent(message, history as FlightGptChatMessage[]);
      const updatedHistory: FlightGptChatMessage[] = [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ];

      response.json({
        reply,
        history: updatedHistory,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        response.status(400).json({
          error: "Invalid chat payload.",
          details: error.flatten(),
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Unknown server error.";

      logger.error({
        event: "chat_request_failed",
        error: message,
      });

      response.status(500).json({
        error: message,
      });
    }
  });

  app.post("/chat/stream", async (request, response) => {
    let parsedRequest: z.infer<typeof chatRequestSchema>;

    try {
      parsedRequest = chatRequestSchema.parse(request.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        response.status(400).json({
          error: "Invalid chat payload.",
          details: error.flatten(),
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Unknown server error.";

      response.status(500).json({
        error: message,
      });
      return;
    }

    const { message, history } = parsedRequest;
    const flightHistory = history as FlightGptChatMessage[];
    const abortController = new AbortController();

    response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");

    if (typeof response.flushHeaders === "function") {
      response.flushHeaders();
    }

    request.on("aborted", () => {
      abortController.abort();
    });

    response.on("close", () => {
      if (!response.writableEnded) {
        abortController.abort();
      }
    });

    response.on("error", () => {
      abortController.abort();
    });

    writeSseEvent(response, {
      type: "step",
      stepType: "status",
      label: "FlightGPT is thinking...",
    });

    try {
      const reply = await streamFlightGptAgent(message, flightHistory, {
        signal: abortController.signal,
        onStep: (step) => {
          writeSseEvent(response, {
            type: "step",
            stepType: step.type,
            label: step.label,
            tool: step.tool,
          });
        },
      });

      const updatedHistory: FlightGptChatMessage[] = [
        ...flightHistory,
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ];

      writeSseEvent(response, {
        type: "done",
        reply,
        history: updatedHistory,
      });
      response.end();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown server error.";

      logger.error({
        event: "chat_stream_failed",
        error: message,
      });

      writeSseEvent(response, {
        type: "error",
        error: message,
      });
      response.end();
    }
  });

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  return app;
}

export async function startServer(): Promise<void> {
  const app = createServer();

  await new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      logger.info({
        event: "server_started",
        port: PORT,
      });
      resolve();
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    logger.error({
      event: "server_start_failed",
      error: error instanceof Error ? error.message : "Unknown startup error.",
    });
    process.exit(1);
  });
}
