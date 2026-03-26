import { runWebSearch } from "../src/tools/webSearch";

async function main(): Promise<void> {
  const query = process.argv[2] ?? "JFK airport delays today";
  const result = await runWebSearch(query);

  console.log("[web_search] query:", query);
  console.log("[web_search] result:", result);
}

main().catch((error) => {
  console.error("[web_search] test failed:", error);
  process.exit(1);
});
