# PRD — FlightGPT: Flight Radar AI Assistant

## Problem Statement

Flight tracking apps like FlightAware and Flightradar24 are powerful but data-heavy and click-dependent. Aviation enthusiasts and casual users alike have to navigate dense interfaces to answer simple questions like "what's flying over me right now?" or "how long would it take to fly from Salt Lake City to New York?"

There is no conversational interface for flight data. FlightGPT fills that gap.

## Product Vision

FlightGPT is a chatbot agent that lets users ask natural language questions about live flights, aircraft, airports, and aviation in general. It combines real-time flight data, a curated aviation knowledge base, web search, and math capabilities into a single conversational interface.

## Target User

Aviation enthusiasts, curious travelers, and students who want to explore flight data without learning a complex UI. Someone who would rather type "what 737s are flying over Utah right now?" than click through a map interface.

## The Problem FlightGPT Solves

| Pain Point | FlightGPT Solution |
|------------|-----------------|
| Flight trackers require clicking and zooming | Natural language queries |
| Hard to get quick answers about aircraft types | RAG knowledge base with instant lookup |
| No easy way to do flight math (distance, duration) | Built-in calculator tool |
| Stale or missing info on niche aviation topics | Web search fallback |

## Core Tools

### 1. Calculator
- Evaluates mathematical expressions
- Use cases: distance between airports, estimated flight duration, fuel load estimates, unit conversions (nautical miles to km, feet to meters)
- Input: valid JS math expression
- Output: string result

### 2. Web Search (Tavily)
- Searches the web for current aviation information not in the knowledge base
- Use cases: current airport delays, recent airline news, obscure aircraft specs, real-time weather at airports
- Input: search query string
- Output: formatted search results with sources

### 3. Knowledge Base (RAG — ChromaDB)
- Semantic search over curated aviation documents
- Use cases: aircraft type lookups, aviation terminology, common airport codes, route information
- Documents: 5 markdown files covering aircraft types, terminology, airports, OpenSky API reference, common routes
- Input: natural language query
- Output: relevant document chunks with source attribution

### 4. Flight Lookup (OpenSky Network)
- Fetches live flight data from the OpenSky Network REST API
- Use cases: "what's flying over Utah right now?", "track flight UAL123", "show me flights near SLC"
- Input: location (lat/lon bounding box) or callsign
- Output: formatted list of active flights with callsign, origin, altitude, speed, aircraft type

## Conversation Memory

The agent maintains full message history across turns in a session. Follow-up questions work naturally:
- "What's flying over Utah?" → agent calls flight_lookup
- "Which of those is the biggest plane?" → agent knows what "those" refers to

Memory is session-scoped (in-memory array). Not persisted across server restarts.

## Web UI

A single chat page served by Express. Features:
- Chat input and message history display
- Streaming responses (stretch goal) — text appears token by token
- Source attribution visible when RAG tool is used
- Tool activity indicator showing which tool was called

## Non-Goals (Out of Scope for MVP)

- User accounts or authentication
- Historical flight playback
- Global flight coverage (limited to what OpenSky free tier provides)
- Mobile app
- Persistent conversation history across sessions

## Success Criteria

- All three required tools work and are correctly routed by the agent
- RAG returns results with source attribution
- Conversation memory works across at least 3 turns
- Web UI is functional and usable
- Repo has proper infrastructure (context.md, PRD, roadmap, .gitignore, structured logging, incremental commits)
- 2-minute demo video shows at least 2 tools firing in a natural conversation
