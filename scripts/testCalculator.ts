import { runCalculator } from "../src/tools/calculator";

async function main(): Promise<void> {
  const expression = process.argv[2] ?? "2186 * 1.60934";
  const result = await runCalculator(expression);

  console.log("[calculator] expression:", expression);
  console.log("[calculator] result:", result);
}

main().catch((error) => {
  console.error("[calculator] test failed:", error);
  process.exit(1);
});
