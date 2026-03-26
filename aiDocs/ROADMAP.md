# ROADMAP — FlightGPT: Flight Radar AI Assistant

## Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Project setup & infrastructure | ✅ Complete |
| 2 | Core tools (calculator + web search) | ✅ Complete |
| 3 | Agent wiring & basic chat | ✅ Complete |
| 4 | RAG knowledge base | ✅ Complete |
| 5 | Flight lookup tool (4th tool) | ✅ Complete |
| 6 | Web UI | ✅ Complete |
| 7 | Streaming | ⬜ Not started |
| 8 | Polish & deliverables | ⬜ Not started |

---

## Phase 1 — Project Setup & Infrastructure

Goal: repo is scaffolded, AI tools can orient from context.md, no secrets committed.

- [x] Initialize repo with `npm init` and TypeScript config
- [x] Install all dependencies (langchain, @langchain/anthropic, @langchain/langgraph, @langchain/core, @langchain/tavily, chromadb, express, pino, zod, openai)
- [x] Create folder structure (`src/tools/`, `src/agent/`, `src/rag/`, `src/server/`, `docs/`, `public/`, `scripts/`, `aiDocs/`)
- [x] Create `.env.example` with all required keys
- [x] Create `.gitignore` (node_modules, .env, dist/, chroma-db/)
- [x] Add `aiDocs/context.md`, `aiDocs/PRD.md`, `aiDocs/MVP.md`, `aiDocs/ROADMAP.md`
- [x] Set up Pino logger in `src/logger.ts`
- [x] Create `scripts/test.sh` skeleton
- [x] Commit: `chore: project setup and infrastructure`

---

## Phase 2 — Core Tools

Goal: calculator and web search tools built, tested independently.

- [x] Build `src/tools/calculator.ts`
  - [x] Safe math evaluation (use `mathjs` in production)
  - [x] Returns string result
  - [x] Catches and returns errors gracefully
  - [x] Descriptive `when to use` description
- [x] Build `src/tools/webSearch.ts`
  - [x] Tavily integration
  - [x] maxResults: 3
  - [x] Formats results with title, content, URL
  - [x] Async with try/catch
- [x] Write basic test for each tool (call directly, log output)
- [x] Update `scripts/test.sh` to run tool tests
- [x] Commit: `feat: calculator and web search tools`

---

## Phase 3 — Agent Wiring & Basic Chat

Goal: agent runs in terminal with two tools, ReAct loop visible in logs.

- [x] Build `src/agent/agent.ts`
  - [x] Initialize Claude model (claude-haiku-3-5)
  - [x] Wire calculator + web search tools
  - [x] Create agent with `createReactAgent`
  - [x] Set `recursionLimit: 10`
- [x] Add structured logging for every tool call (`{ tool, arguments, result }`)
- [x] Build simple terminal chat loop to test
- [x] Verify agent picks correct tool for math vs web questions
- [x] Commit: `feat: agent wired with calculator and web search`

---

## Phase 4 — RAG Knowledge Base

Goal: ChromaDB running, 5 docs embedded, knowledge_base tool works with source attribution.

- [x] Write 5 aviation documents in `docs/`
  - [x] `aircraft-types.md`
  - [x] `aviation-terminology.md`
  - [x] `airports-reference.md`
  - [x] `opensky-api-reference.md`
  - [x] `common-routes.md`
- [x] Build `src/rag/vectorStore.ts` — ChromaDB client setup
- [x] Build `src/rag/embedDocs.ts` — load docs, chunk, embed, store (skip if already embedded)
- [x] Build `src/tools/knowledgeBase.ts`
  - [x] Semantic search with `similaritySearch(query, 3)`
  - [x] Returns results with source attribution (`[Source: filename]`)
  - [x] Async with try/catch
- [x] Add knowledge_base tool to agent
- [x] Test: "what is a squawk code?" → should hit RAG not web search
- [x] Commit: `feat: RAG knowledge base with ChromaDB`

---

## Phase 5 — Flight Lookup Tool

Goal: live flight data from OpenSky Network, 4th tool working.

- [x] Build `src/tools/flightLookup.ts`
  - [x] OpenSky Network REST API call (no auth required)
  - [x] Accept location name → convert to bounding box OR accept callsign
  - [x] Format response: callsign, origin country, altitude, speed, coordinates
  - [x] Handle empty results gracefully
  - [x] Async with try/catch
- [x] Add flight_lookup tool to agent
- [x] Test: "what's flying over Utah right now?" → should call flight_lookup
- [x] Commit: `feat: flight lookup tool via OpenSky Network`

---

## Phase 6 — Web UI

Goal: chat page accessible at localhost:3000, all tools fire from browser.

- [x] Build `src/server/server.ts`
  - [x] Express app, serve `public/index.html` on `GET /`
  - [x] `POST /chat` endpoint accepts `{ message, history }`
  - [x] Manages conversation memory (message history array)
  - [x] Returns agent response as JSON
- [x] Build `public/index.html`
  - [x] Chat input + send button
  - [x] Message display area (user vs assistant styled differently)
  - [x] Basic CSS — clean and functional
- [x] Test full flow from browser: all 4 tools reachable
- [x] Commit: `feat: web UI and Express server`

---

## Phase 7 — Streaming (Stretch)

Goal: show the agent's reasoning steps in real time so the user 
sees the agent working instead of waiting for a final answer.

This is based on the LangGraph agent.stream() API which emits 
each step of the ReAct loop as it happens — tool calls, tool 
results, and the final response — rather than waiting for the 
full response before returning anything to the UI.

- [] Add POST /chat/stream endpoint using SSE (text/event-stream)
- [] Use agent.stream() instead of agent.invoke()
- [] Emit each agent step as a server-sent event as it arrives
- [] Frontend shows a "FlightGPT is thinking..." indicator while 
      the agent is working through its reasoning steps
- [] Final assistant response is displayed when streaming completes
- [] Test: user can see the agent is active rather than waiting 
      in silence for a response
- [] Commit: feat: streaming responses via SSE

Note: this satisfies the course definition of streaming as described 
in Dev Unit 7. Word-by-word token streaming (like ChatGPT) is a 
more advanced pattern beyond the scope of this assignment.

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
