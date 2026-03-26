import { invokeFlightGptAgent } from "../src/agent/agent";

async function main(): Promise<void> {
  const prompts = [
    "How far is 2186 miles in kilometers?",
    "What is a squawk code?",
    "Are there any delays at JFK today?",
  ];

  const history: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const prompt of prompts) {
    const reply = await invokeFlightGptAgent(prompt, history);

    console.log(`\n[user] ${prompt}`);
    console.log(`[assistant] ${reply}`);

    history.push({ role: "user", content: prompt });
    history.push({ role: "assistant", content: reply });
  }
}

main().catch((error) => {
  console.error("[agent] test failed:", error);
  process.exit(1);
});
