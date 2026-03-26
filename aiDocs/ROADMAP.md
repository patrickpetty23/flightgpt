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
| 7 | Streaming | ✅ Complete |
| 8 | Polish & deliverables | ✅ Complete |

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

- [x] Add POST /chat/stream endpoint using SSE (text/event-stream)
- [x] Use agent.stream() instead of agent.invoke()
- [x] Emit each agent step as a server-sent event as it arrives
- [x] Frontend shows a "FlightGPT is thinking..." indicator while 
      the agent is working through its reasoning steps
- [x] Final assistant response is displayed when streaming completes
- [x] Test: user can see the agent is active rather than waiting 
      in silence for a response
- [x] Commit: `feat: add streaming responses via SSE`

---

## Phase 8 — Polish & Deliverables

Goal: everything submitted, demo recorded, repo clean.

- [x] Write `README.md`
  - [x] What FlightGPT is
  - [x] All four tools described
  - [x] Setup instructions (clone, install, configure .env, run)
  - [x] How to embed docs on first run
- [x] Final review of all infrastructure files
- [x] Verify 5+ meaningful commits in git history
- [x] Verify `.env` is not committed
- [x] Record 2-minute demo video (follow demo script in MVP.md)
- [x] Submit GitHub repo link + demo video
- [x] Commit: `chore: final polish and README`

---

## Phase 9 — Live Flight Map

Goal: add a /map page showing real-time aircraft positions on an 
interactive map, updating every 10 seconds. Reuses the OpenSky 
integration already built in flightLookup.ts.

### Backend
- [ ] Add GET /api/flights to src/server/server.ts
      - Calls OpenSky API for continental US bounding box:
        lamin=24.5, lamax=49.5, lomin=-125.0, lomax=-66.0
      - Returns JSON array of flights with fields:
        { callsign, lat, lon, altitudeFt, speedKnots, heading, country }
      - Convert OpenSky raw values on the server:
        altitude: meters × 3.281 → feet
        speed: m/s × 1.944 → knots
        heading: index 10 (true_track)
      - Filter out: null lat/lon, on_ground === true, empty callsign
      - Handle OpenSky errors gracefully — return empty array, 
        don't crash the server
- [ ] Add GET /map route serving public/map.html

### Frontend — public/map.html (single file, inline CSS/JS)
- [ ] Load Leaflet.js and CSS from CDN:
      https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
      https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
- [ ] Initialize map centered on US (lat 39, lon -98, zoom 4)
- [ ] Use dark tile layer matching FlightGPT aesthetic:
      https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png
- [ ] Create a custom SVG plane icon using Leaflet's DivIcon:
      - Small filled triangle or arrow shape pointing up (north)
      - Rotate the icon using CSS transform: rotate({heading}deg)
        so each plane points in its actual direction of travel
      - All icons the same size (16×16px) — OpenSky free tier 
        does not provide aircraft type so we cannot size by 
        aircraft category without a separate API
      - Color: white with a subtle glow, visible on dark map
- [ ] On load: fetch /api/flights, place a marker per flight
- [ ] Every 10 seconds: fetch /api/flights again
      - Update existing markers to new positions using setLatLng
      - Add markers for new flights that appeared
      - Remove markers for flights that disappeared
      - Do NOT clear and redraw all markers — that causes flicker
- [ ] Each marker popup on click shows:
      ✈ {CALLSIGN}
      Altitude: {altitudeFt} ft
      Speed: {speedKnots} kt  
      Heading: {heading}°
      Country: {country}
      [Ask FlightGPT] button — opens /index.html with query 
      pre-filled as "Tell me about flight {callsign}"
- [ ] Flight counter in top-right corner: "{n} aircraft tracked"
      updates with each refresh
- [ ] Nav link in both pages:
      /map → "💬 Open Chat"
      /index.html → "🗺 Live Map"

### Testing
- [ ] Open /map — planes appear over the US within 2 seconds
- [ ] Wait 10 seconds — positions update without page flicker
- [ ] Click a marker — popup shows flight details
- [ ] Click "Ask FlightGPT" — chat opens with callsign pre-filled
- [ ] Commit: feat: live flight map with Leaflet and OpenSky

---

## Stretch Goals Tracker

- [x] Streaming in web UI (Phase 7)
- [x] 4th custom tool — flight_lookup (Phase 5)
- [x] Persistent vector store — ChromaDB (Phase 4)
- [ ] Agent proposal write-up (optional — identify a feature in an existing project)
