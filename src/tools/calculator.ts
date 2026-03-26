import { tool } from "@langchain/core/tools";
import { evaluate } from "mathjs";
import { z } from "zod";

import { logger } from "../logger";

const calculatorInputSchema = z.object({
  expression: z
    .string()
    .min(1, "Expression is required.")
    .max(200, "Expression is too long.")
    .describe("A valid math expression to evaluate, such as '2451 * 1.60934'."),
});

export async function runCalculator(expression: string): Promise<string> {
  try {
    const { expression: validatedExpression } = calculatorInputSchema.parse({
      expression,
    });

    const result = evaluate(validatedExpression);
    const formattedResult =
      typeof result === "string" ? result : JSON.stringify(result);

    logger.info({
      tool: "calculator",
      arguments: { expression: validatedExpression },
      result: formattedResult,
    });

    return formattedResult;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown calculator error.";
    const result = `Calculator error: ${message}`;

    logger.info({
      tool: "calculator",
      arguments: { expression },
      result,
    });

    return result;
  }
}

export const calculatorTool = tool(
  async ({ expression }) => runCalculator(expression),
  {
    name: "calculator",
    description:
      "Use this when the user asks for math, unit conversions, distances, durations, or any calculation that can be answered with a numeric expression.",
    schema: calculatorInputSchema,
  },
);
