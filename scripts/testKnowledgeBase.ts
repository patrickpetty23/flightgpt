import { runKnowledgeBaseQuery } from "../src/tools/knowledgeBase";

async function main(): Promise<void> {
  const query = process.argv[2] ?? "What is a squawk code?";
  const result = await runKnowledgeBaseQuery(query);

  console.log("[knowledge_base] query:", query);
  console.log("[knowledge_base] result:", result);
}

main().catch((error) => {
  console.error("[knowledge_base] test failed:", error);
  process.exit(1);
});
