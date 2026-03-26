# MVP — FlightGPT: Flight Radar AI Assistant

## MVP Definition

The MVP is the simplest version of FlightGPT that satisfies all assignment requirements and produces a compelling 2-minute demo. Every decision below is made to hit the deadline with a working, demonstrable product.

## What's In MVP

### ✅ Agent & Tools
- [ ] LangChain.js ReAct agent using `createReactAgent`
- [ ] `calculator` tool — math expressions via safe evaluation
- [ ] `web_search` tool — Tavily API integration
- [ ] `knowledge_base` tool — ChromaDB RAG with 5 aviation docs
- [ ] `flight_lookup` tool — OpenSky Network API (4th tool / stretch)

### ✅ RAG Knowledge Base
- [ ] 5 markdown documents in `docs/` folder
  - `aircraft-types.md` — common commercial aircraft (737, A320, 777, etc.)
  - `aviation-terminology.md` — glossary of terms (callsign, squawk, IFR, VFR, etc.)
  - `airports-reference.md` — major US airports, ICAO/IATA codes
  - `opensky-api-reference.md` — what data OpenSky provides and its format
  - `common-routes.md` — popular US routes, distances, typical flight times
- [ ] ChromaDB persistent vector store
- [ ] Documents embedded at startup if store is empty
- [ ] Source attribution in RAG tool responses

### ✅ Conversation Memory
- [ ] Message history array maintained per session
- [ ] Full history passed to agent on each invocation
- [ ] Follow-up questions referencing prior context work

### ✅ Web UI
- [ ] Express server on PORT 3000
- [ ] `GET /` serves `public/index.html`
- [ ] `POST /chat` accepts `{ message, history }`, returns agent response
- [ ] Basic chat interface — input box, send button, message display
- [ ] Streaming via SSE (stretch goal)

### ✅ Repo Infrastructure
- [ ] `aiDocs/context.md` — project orientation for AI tools
- [ ] `aiDocs/PRD.md` — this document's parent
- [ ] `aiDocs/ROADMAP.md` — phased plan with checkboxes
- [ ] `.gitignore` — excludes `.env`, `node_modules`, `chroma-db/`, `dist/`
- [ ] `.env.example` — template with all required keys
- [ ] `README.md` — setup instructions and agent description
- [ ] `scripts/test.sh` — runs basic tool tests
- [ ] Pino structured logging on all tool calls
- [ ] 5+ meaningful commits showing progression

## What's NOT In MVP

- Global flight coverage (US bounding box only for OpenSky)
- User accounts or persistent sessions
- Polished UI design
- Historical flight data
- Mobile responsiveness

## Demo Script (2 minutes)

```
0:00 — Show the web UI, explain what FlightGPT is (15 sec)
0:15 — "What's flying over Utah right now?" → flight_lookup fires, show results
0:45 — "Which of those is the largest aircraft?" → memory + knowledge_base fires
1:15 — "How far is SLC to JFK in kilometers?" → calculator fires
1:35 — "Are there any delays at JFK today?" → web_search fires
1:55 — Wrap up, show repo structure briefly
2:00 — Done
```

## Technical Constraints

- Use `claude-haiku-3-5` to minimize API costs during development
- OpenSky free tier: no API key needed, rate limited to ~10 req/min
- ChromaDB runs locally — no external DB service needed
- Keep `recursionLimit: 10` on agent to prevent runaway loops

## MVP Acceptance Criteria

The MVP is done when:
1. All four tools fire correctly when prompted appropriately
2. A 3-turn conversation works with follow-up context
3. The web UI is accessible at `localhost:3000`
4. The repo has all required infrastructure files
5. The demo script above can be recorded without errors
