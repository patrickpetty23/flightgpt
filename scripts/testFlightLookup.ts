import { runFlightLookup } from "../src/tools/flightLookup";

async function main(): Promise<void> {
  const rawArg = process.argv[2] ?? "Utah";
  const input = rawArg.toUpperCase() === rawArg && /\d/.test(rawArg)
    ? { callsign: rawArg }
    : { location: rawArg };

  const result = await runFlightLookup(input);

  console.log("[flight_lookup] input:", input);
  console.log("[flight_lookup] result:", result);
}

main().catch((error) => {
  console.error("[flight_lookup] test failed:", error);
  process.exit(1);
});
