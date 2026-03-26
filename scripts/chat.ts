import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { invokeFlightGptAgent, type FlightGptChatMessage } from "../src/agent/agent";

async function main(): Promise<void> {
  const rl = readline.createInterface({ input, output });
  const history: FlightGptChatMessage[] = [];

  console.log("FlightGPT terminal chat");
  console.log("Type 'exit' to quit.\n");

  try {
    while (true) {
      const prompt = await rl.question("You: ");
      const message = prompt.trim();

      if (!message) {
        continue;
      }

      if (message.toLowerCase() === "exit") {
        break;
      }

      const reply = await invokeFlightGptAgent(message, history);

      console.log(`FlightGPT: ${reply}\n`);

      history.push({ role: "user", content: message });
      history.push({ role: "assistant", content: reply });
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("FlightGPT chat failed:", error);
  process.exit(1);
});
