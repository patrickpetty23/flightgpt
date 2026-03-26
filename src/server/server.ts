import path from "node:path";

import express from "express";
import { z } from "zod";

import { invokeFlightGptAgent, type FlightGptChatMessage } from "../agent/agent";
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
