# context.md — FlightGPT: Flight Radar AI Assistant

## What This Project Is

FlightGPT is a multi-tool AI chatbot agent built with LangChain.js and TypeScript. It lets users have natural conversations about live flights, aviation facts, and aircraft data. Users can ask questions like "what's flying over Utah right now?", "how far is SLC to JFK?", or "what kind of plane is a Boeing 737-800?" and get intelligent, sourced answers.

This is an individual assignment for the BYU Agentic Development course (Units 7–8). It demonstrates the ReAct pattern with multiple tools, RAG, conversation memory, streaming, and a web UI.

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Language:** TypeScript
- **Agent Framework:** LangChain.js (`langchain`, `@langchain/anthropic`, `@langchain/langgraph`)
- **LLM:** Claude (claude-haiku-3-5 for cost efficiency)
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector Store:** ChromaDB (persistent, via `chromadb` npm package)
- **Web Search:** Tavily API
- **Flight Data:** OpenSky Network REST API (free, no key required)
- **Web Server:** Express.js
- **Frontend:** Vanilla HTML/CSS/JS (single chat page)
- **Logging:** Pino (structured JSON logging)
- **Schema Validation:** Zod

## Project Structure

```
flightgpt/
├── aiDocs/
│   ├── context.md          ← you are here
│   ├── PRD.md
│   ├── MVP.md
│   └── ROADMAP.md
├── src/
│   ├── tools/
│   │   ├── calculator.ts
│   │   ├── webSearch.ts
│   │   ├── knowledgeBase.ts
│   │   └── flightLookup.ts
│   ├── agent/
│   │   └── agent.ts
│   ├── rag/
│   │   ├── embedDocs.ts
│   │   └── vectorStore.ts
│   ├── server/
│   │   └── server.ts
│   └── logger.ts
├── docs/                   ← RAG source documents
│   ├── aircraft-types.md
│   ├── aviation-terminology.md
│   ├── airports-reference.md
│   ├── opensky-api-reference.md
│   └── common-routes.md
├── public/
│   └── index.html          ← chat UI
├── scripts/
│   ├── test.sh
│   └── embed-docs.sh
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Tools the Agent Has

| Tool | Purpose | When the agent uses it |
|------|----------|----------------------|
| `calculator` | Math expressions | Distance, duration, fuel, unit conversions |
| `web_search` | Tavily web search | Current airport status, airline news, aircraft specs not in docs |
| `knowledge_base` | ChromaDB RAG search | Aviation terminology, aircraft types, airport codes, route info |
| `flight_lookup` | OpenSky Network API | Live flights near a location or by callsign |

## Environment Variables

```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=          # for embeddings only
TAVILY_API_KEY=
PORT=3000
CHROMA_PATH=./chroma-db  # persistent vector store location
```

## How to Orient as an AI Tool

- All agent logic lives in `src/agent/agent.ts`
- All tools are in `src/tools/` — one file per tool
- RAG documents are plain markdown files in `docs/`
- The vector store is embedded at startup via `src/rag/embedDocs.ts`
- The Express server is in `src/server/server.ts` — it exposes `POST /chat` and serves `public/index.html`
- Logging uses Pino — all tool calls log `{ tool, arguments, result }` as structured JSON
- Never commit `.env` — use `.env.example` as the template
