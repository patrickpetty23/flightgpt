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

const CHUNKING_VERSION = "markdown-sections-v1";
const CHUNK_SIZE = 900;

type ChunkSeed = Omit<VectorStoreRecord, "embedding">;
type SourceDocument = {
  filename: string;
  content: string;
};
type MarkdownSection = {
  sectionPath: string[];
  body: string;
};

function getDocsDirectory(): string {
  return path.resolve(process.cwd(), "docs");
}

function getDocumentLabel(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

function parseMarkdownSections(document: SourceDocument): MarkdownSection[] {
  const normalized = document.content.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  const lines = normalized.split("\n");
  const sections: MarkdownSection[] = [];
  const headingStack: string[] = [];
  let currentPath = [getDocumentLabel(document.filename), "Introduction"];
  let bodyLines: string[] = [];

  const flushSection = () => {
    const body = bodyLines.join("\n").trim();

    if (!body) {
      bodyLines = [];
      return;
    }

    sections.push({
      sectionPath: [...currentPath],
      body,
    });
    bodyLines = [];
  };

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (headingMatch) {
      flushSection();

      const headingLevel = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      headingStack.splice(headingLevel - 1);
      headingStack[headingLevel - 1] = headingText;
      currentPath = [...headingStack];
      continue;
    }

    bodyLines.push(line);
  }

  flushSection();

  if (sections.length === 0) {
    return [
      {
        sectionPath: [getDocumentLabel(document.filename)],
        body: normalized,
      },
    ];
  }

  return sections;
}

function buildChunkPrefix(sectionPath: string[]): string {
  return `Section: ${sectionPath.join(" > ")}`;
}

function splitLargeBlock(block: string, maxLength: number): string[] {
  if (block.length <= maxLength) {
    return [block];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < block.length) {
    let end = Math.min(start + maxLength, block.length);

    if (end < block.length) {
      const paragraphBreak = block.lastIndexOf("\n\n", end);
      const lineBreak = block.lastIndexOf("\n", end);
      const sentenceBreak = Math.max(
        block.lastIndexOf(". ", end),
        block.lastIndexOf("? ", end),
        block.lastIndexOf("! ", end),
      );
      const chosenBreak = Math.max(paragraphBreak, lineBreak, sentenceBreak);

      if (chosenBreak > start + Math.floor(maxLength * 0.5)) {
        end = chosenBreak + (chosenBreak === sentenceBreak ? 1 : 0);
      }
    }

    const chunk = block.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= block.length) {
      break;
    }

    start = end;
  }

  return chunks;
}

function splitSectionIntoChunks(section: MarkdownSection): string[] {
  const prefix = buildChunkPrefix(section.sectionPath);
  const availableLength = CHUNK_SIZE - prefix.length - 2;
  const paragraphs = section.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let currentBody = "";

  const pushChunk = (body: string) => {
    const normalizedBody = body.trim();

    if (!normalizedBody) {
      return;
    }

    chunks.push(`${prefix}\n\n${normalizedBody}`);
  };

  for (const paragraph of paragraphs) {
    const candidate = currentBody
      ? `${currentBody}\n\n${paragraph}`
      : paragraph;

    if (candidate.length <= availableLength) {
      currentBody = candidate;
      continue;
    }

    if (currentBody) {
      pushChunk(currentBody);
      currentBody = "";
    }

    if (paragraph.length <= availableLength) {
      currentBody = paragraph;
      continue;
    }

    for (const chunk of splitLargeBlock(paragraph, availableLength)) {
      pushChunk(chunk);
    }
  }

  pushChunk(currentBody);

  return chunks;
}

async function loadChunkSeeds(documents: SourceDocument[]): Promise<ChunkSeed[]> {
  const seeds: ChunkSeed[] = [];

  for (const document of documents) {
    const { filename, content } = document;
    const chunks = parseMarkdownSections({ filename, content }).flatMap(
      splitSectionIntoChunks,
    );

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
  hash.update(`chunking:${CHUNKING_VERSION}`);
  hash.update("\n");

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

  const seeds = await loadChunkSeeds(documents);
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
