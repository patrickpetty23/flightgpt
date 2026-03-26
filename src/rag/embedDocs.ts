import { readFile } from "node:fs/promises";
import path from "node:path";

import { logger } from "../logger";
import {
  embedTexts,
  getVectorStoreCount,
  overwriteVectorStore,
  type VectorStoreRecord,
} from "./vectorStore";

const DOC_FILENAMES = [
  "aircraft-types.md",
  "aviation-terminology.md",
  "airports-reference.md",
  "opensky-api-reference.md",
  "common-routes.md",
];

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 150;

type ChunkSeed = Omit<VectorStoreRecord, "embedding">;

function getDocsDirectory(): string {
  return path.resolve(process.cwd(), "docs");
}

function splitIntoChunks(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();

  if (normalized.length <= CHUNK_SIZE) {
    return [normalized];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + CHUNK_SIZE, normalized.length);

    if (end < normalized.length) {
      const newlineBreak = normalized.lastIndexOf("\n\n", end);
      const singleNewlineBreak = normalized.lastIndexOf("\n", end);
      const chosenBreak = Math.max(newlineBreak, singleNewlineBreak);

      if (chosenBreak > start + Math.floor(CHUNK_SIZE * 0.5)) {
        end = chosenBreak;
      }
    }

    const chunk = normalized.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}

async function loadChunkSeeds(): Promise<ChunkSeed[]> {
  const seeds: ChunkSeed[] = [];

  for (const filename of DOC_FILENAMES) {
    const fullPath = path.join(getDocsDirectory(), filename);
    const content = await readFile(fullPath, "utf8");
    const chunks = splitIntoChunks(content);

    chunks.forEach((chunk, chunkIndex) => {
      seeds.push({
        id: `${filename}#${chunkIndex}`,
        source: filename,
        chunkIndex,
        content: chunk,
      });
    });
  }

  return seeds;
}

export async function ensureDocsEmbedded(): Promise<void> {
  const currentCount = await getVectorStoreCount();

  if (currentCount > 0) {
    logger.info({
      event: "vector_store_reused",
      recordCount: currentCount,
    });
    return;
  }

  const seeds = await loadChunkSeeds();
  const embeddings = await embedTexts(seeds.map((seed) => seed.content));
  const records: VectorStoreRecord[] = seeds.map((seed, index) => ({
    ...seed,
    embedding: embeddings[index] ?? [],
  }));

  await overwriteVectorStore(records);

  logger.info({
    event: "docs_embedded",
    documentCount: DOC_FILENAMES.length,
    chunkCount: records.length,
  });
}
