import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { logger } from "../logger";
import {
  embedTexts,
  getVectorStoreCount,
  overwriteVectorStore,
  readVectorStoreMetadata,
  type VectorStoreRecord,
  writeVectorStoreMetadata,
} from "./vectorStore";

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 150;

type ChunkSeed = Omit<VectorStoreRecord, "embedding">;
type SourceDocument = {
  filename: string;
  content: string;
};

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

  for (const document of await loadSourceDocuments()) {
    const { filename, content } = document;
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

async function loadSourceDocuments(): Promise<SourceDocument[]> {
  const entries = await readdir(getDocsDirectory(), { withFileTypes: true });
  const filenames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const documents = await Promise.all(
    filenames.map(async (filename) => ({
      filename,
      content: await readFile(path.join(getDocsDirectory(), filename), "utf8"),
    })),
  );

  if (documents.length === 0) {
    throw new Error("No markdown documents found in docs/.");
  }

  return documents;
}

function buildDocSignature(documents: SourceDocument[]): string {
  const hash = createHash("sha256");

  for (const document of documents) {
    hash.update(document.filename);
    hash.update("\n");
    hash.update(document.content.replace(/\r\n/g, "\n"));
    hash.update("\n---\n");
  }

  return hash.digest("hex");
}

export async function ensureDocsEmbedded(): Promise<void> {
  const documents = await loadSourceDocuments();
  const docSignature = buildDocSignature(documents);
  const currentCount = await getVectorStoreCount();
  const currentMetadata = await readVectorStoreMetadata();

  if (currentCount > 0 && currentMetadata?.docSignature === docSignature) {
    logger.info({
      event: "vector_store_reused",
      recordCount: currentCount,
      docSignature,
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
  await writeVectorStoreMetadata({
    docSignature,
    sourceFiles: documents.map((document) => document.filename),
    recordCount: records.length,
    updatedAt: new Date().toISOString(),
  });

  logger.info({
    event: "docs_embedded",
    documentCount: documents.length,
    chunkCount: records.length,
    docSignature,
  });
}
