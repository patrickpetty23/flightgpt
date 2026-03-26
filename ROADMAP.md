# ROADMAP — FlightGPT: Flight Radar AI Assistant

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Project setup & infrastructure | ⬜ Not started |
| 2 | Core tools (calculator + web search) | ⬜ Not started |
| 3 | Agent wiring & basic chat | ⬜ Not started |
| 4 | RAG knowledge base | ⬜ Not started |
| 5 | Flight lookup tool (4th tool) | ⬜ Not started |
| 6 | Web UI | ⬜ Not started |
| 7 | Streaming | ⬜ Not started |
| 8 | Polish & deliverables | ⬜ Not started |

---

## Phase 1 — Project Setup & Infrastructure

Goal: repo is scaffolded, AI tools can orient from context.md, no secrets committed.

- [ ] Initialize repo with `npm init` and TypeScript config
- [ ] Install all dependencies (langchain, @langchain/anthropic, @langchain/langgraph, @langchain/core, @langchain/tavily, chromadb, express, pino, zod, openai)
- [ ] Create folder structure (`src/tools/`, `src/agent/`, `src/rag/`, `src/server/`, `docs/`, `public/`, `scripts/`, `aiDocs/`)
- [ ] Create `.env.example` with all required keys
- [ ] Create `.gitignore` (node_modules, .env, dist/, chroma-db/)
- [ ] Add `aiDocs/context.md`, `aiDocs/PRD.md`, `aiDocs/MVP.md`, `aiDocs/ROADMAP.md`
- [ ] Set up Pino logger in `src/logger.ts`
- [ ] Create `scripts/test.sh` skeleton
- [ ] Commit: `chore: project setup and infrastructure`

---

## Phase 2 — Core Tools

Goal: calculator and web search tools built, tested independently.

- [ ] Build `src/tools/calculator.ts`
  - [ ] Safe math evaluation (use `mathjs` in production)
  - [ ] Returns string result
  - [ ] Catches and returns errors gracefully
  - [ ] Descriptive `when to use` description
- [ ] Build `src/tools/webSearch.ts`
  - [ ] Tavily integration
  - [ ] maxResults: 3
  - [ ] Formats results with title, content, URL
  - [ ] Async with try/catch
- [ ] Write basic test for each tool (call directly, log output)
- [ ] Update `scripts/test.sh` to run tool tests
- [ ] Commit: `feat: calculator and web search tools`

---

## Phase 3 — Agent Wiring & Basic Chat

Goal: agent runs in terminal with two tools, ReAct loop visible in logs.

- [ ] Build `src/agent/agent.ts`
  - [ ] Initialize Claude model (claude-haiku-3-5)
  - [ ] Wire calculator + web search tools
  - [ ] Create agent with `createReactAgent`
  - [ ] Set `recursionLimit: 10`
- [ ] Add structured logging for every tool call (`{ tool, arguments, result }`)
- [ ] Build simple terminal chat loop to test
- [ ] Verify agent picks correct tool for math vs web questions
- [ ] Commit: `feat: agent wired with calculator and web search`

---

## Phase 4 — RAG Knowledge Base

Goal: ChromaDB running, 5 docs embedded, knowledge_base tool works with source attribution.

- [ ] Write 5 aviation documents in `docs/`
  - [ ] `aircraft-types.md`
  - [ ] `aviation-terminology.md`
  - [ ] `airports-reference.md`
  - [ ] `opensky-api-reference.md`
  - [ ] `common-routes.md`
- [ ] Build `src/rag/vectorStore.ts` — ChromaDB client setup
- [ ] Build `src/rag/embedDocs.ts` — load docs, chunk, embed, store (skip if already embedded)
- [ ] Build `src/tools/knowledgeBase.ts`
  - [ ] Semantic search with `similaritySearch(query, 3)`
  - [ ] Returns results with source attribution (`[Source: filename]`)
  - [ ] Async with try/catch
- [ ] Add knowledge_base tool to agent
- [ ] Test: "what is a squawk code?" → should hit RAG not web search
- [ ] Commit: `feat: RAG knowledge base with ChromaDB`

---

## Phase 5 — Flight Lookup Tool

Goal: live flight data from OpenSky Network, 4th tool working.

- [ ] Build `src/tools/flightLookup.ts`
  - [ ] OpenSky Network REST API call (no auth required)
  - [ ] Accept location name → convert to bounding box OR accept callsign
  - [ ] Format response: callsign, origin country, altitude, speed, coordinates
  - [ ] Handle empty results gracefully
  - [ ] Async with try/catch
- [ ] Add flight_lookup tool to agent
- [ ] Test: "what's flying over Utah right now?" → should call flight_lookup
- [ ] Commit: `feat: flight lookup tool via OpenSky Network`

---

## Phase 6 — Web UI

Goal: chat page accessible at localhost:3000, all tools fire from browser.

- [ ] Build `src/server/server.ts`
  - [ ] Express app, serve `public/index.html` on `GET /`
  - [ ] `POST /chat` endpoint accepts `{ message, history }`
  - [ ] Manages conversation memory (message history array)
  - [ ] Returns agent response as JSON
- [ ] Build `public/index.html`
  - [ ] Chat input + send button
  - [ ] Message display area (user vs assistant styled differently)
  - [ ] Basic CSS — clean and functional
- [ ] Test full flow from browser: all 4 tools reachable
- [ ] Commit: `feat: web UI and Express server`

---

## Phase 7 — Streaming (Stretch)

Goal: responses stream token by token in the UI.

- [ ] Switch `POST /chat` to SSE (`text/event-stream`)
- [ ] Use `agent.stream()` instead of `agent.invoke()`
- [ ] Update frontend to consume SSE and append tokens as they arrive
- [ ] Test: visible streaming in browser
- [ ] Commit: `feat: streaming responses via SSE`

---

## Phase 8 — Polish & Deliverables

Goal: everything submitted, demo recorded, repo clean.

- [ ] Write `README.md`
  - [ ] What FlightGPT is
  - [ ] All four tools described
  - [ ] Setup instructions (clone, install, configure .env, run)
  - [ ] How to embed docs on first run
- [ ] Final review of all infrastructure files
- [ ] Verify 5+ meaningful commits in git history
- [ ] Verify `.env` is not committed
- [ ] Record 2-minute demo video (follow demo script in MVP.md)
- [ ] Submit GitHub repo link + demo video
- [ ] Commit: `chore: final polish and README`

---

## Stretch Goals Tracker

- [ ] Streaming in web UI (Phase 7)
- [ ] 4th custom tool — flight_lookup (Phase 5)
- [ ] Persistent vector store — ChromaDB (Phase 4)
- [ ] Agent proposal write-up (optional — identify a feature in an existing project)
