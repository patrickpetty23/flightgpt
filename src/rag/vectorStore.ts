import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import OpenAI from "openai";

import { logger } from "../logger";

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_RESULTS_LIMIT = 3;
const STORE_FILENAME = "flightgpt-aviation-knowledge.json";
const STORE_METADATA_FILENAME = "flightgpt-aviation-knowledge.meta.json";

export type VectorStoreRecord = {
  id: string;
  source: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
};

export type SimilarityMatch = {
  source: string;
  content: string;
  score: number;
};

export type VectorStoreMetadata = {
  docSignature: string;
  sourceFiles: string[];
  recordCount: number;
  updatedAt: string;
};

function getStoreDirectory(): string {
  return path.resolve(process.cwd(), process.env.CHROMA_PATH ?? "./chroma-db");
}

function getStoreFilePath(): string {
  return path.join(getStoreDirectory(), STORE_FILENAME);
}

function getStoreMetadataFilePath(): string {
  return path.join(getStoreDirectory(), STORE_METADATA_FILENAME);
}

async function ensureStoreDirectory(): Promise<void> {
  await mkdir(getStoreDirectory(), { recursive: true });
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to your environment before using the knowledge base.",
    );
  }

  return new OpenAI({ apiKey });
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: DEFAULT_EMBEDDING_MODEL,
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

export async function readVectorStore(): Promise<VectorStoreRecord[]> {
  try {
    const raw = await readFile(getStoreFilePath(), "utf8");
    return JSON.parse(raw) as VectorStoreRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function getVectorStoreCount(): Promise<number> {
  const records = await readVectorStore();
  return records.length;
}

export async function readVectorStoreMetadata(): Promise<VectorStoreMetadata | null> {
  try {
    const raw = await readFile(getStoreMetadataFilePath(), "utf8");
    return JSON.parse(raw) as VectorStoreMetadata;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function overwriteVectorStore(
  records: VectorStoreRecord[],
): Promise<void> {
  await ensureStoreDirectory();
  await writeFile(getStoreFilePath(), JSON.stringify(records, null, 2), "utf8");

  logger.info({
    event: "vector_store_written",
    storePath: getStoreFilePath(),
    recordCount: records.length,
  });
}

export async function writeVectorStoreMetadata(
  metadata: VectorStoreMetadata,
): Promise<void> {
  await ensureStoreDirectory();
  await writeFile(
    getStoreMetadataFilePath(),
    JSON.stringify(metadata, null, 2),
    "utf8",
  );

  logger.info({
    event: "vector_store_metadata_written",
    storePath: getStoreMetadataFilePath(),
    docSignature: metadata.docSignature,
    sourceFileCount: metadata.sourceFiles.length,
  });
}

function cosineSimilarity(left: number[], right: number[]): number {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;

    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export async function similaritySearch(
  query: string,
  limit = DEFAULT_RESULTS_LIMIT,
): Promise<SimilarityMatch[]> {
  const records = await readVectorStore();

  if (records.length === 0) {
    return [];
  }

  const [queryEmbedding] = await embedTexts([query]);

  return records
    .map((record) => ({
      source: record.source,
      content: record.content,
      score: cosineSimilarity(queryEmbedding, record.embedding),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
