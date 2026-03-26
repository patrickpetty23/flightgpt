# FlightGPT

FlightGPT is a TypeScript aviation assistant that combines a LangChain agent with four tools:

- `calculator` for math and unit conversions
- `knowledge_base` for local aviation reference docs with source attribution
- `flight_lookup` for live aircraft data from OpenSky Network
- `web_search` for current aviation information from Tavily

The project includes a browser chat UI, conversation history, structured logging with Pino, and streaming step updates in the UI so users can see when the agent is reasoning through a tool call.

## Features

- Natural-language aviation chat interface at `http://localhost:3000`
- Four agent tools with explicit routing guidance
- Local RAG knowledge base backed by a persistent vector store in `chroma-db/`
- Source attribution for knowledge-base answers
- Live flight lookup for supported airports, cities, and regions
- SSE streaming for agent step updates in the web UI

## Project Structure

```text
flightgpt/
├── aiDocs/                # project planning and AI orientation docs
├── docs/                  # aviation knowledge base source documents
├── public/                # browser UI
├── scripts/               # CLI test scripts
├── src/
│   ├── agent/             # LangChain agent setup
│   ├── rag/               # embedding + vector store logic
│   ├── server/            # Express server
│   ├── tools/             # calculator, search, RAG, live flight tools
│   └── logger.ts          # Pino logger
├── .env.example
├── package.json
└── tsconfig.json
```

## Requirements

- Node.js 18+
- `ANTHROPIC_API_KEY` for the chat model
- `OPENAI_API_KEY` for embeddings
- `TAVILY_API_KEY` for current web search results

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file from `.env.example`:

```bash
cp .env.example .env
```

3. Fill in the required keys:

```env
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
OPENAI_API_KEY=
TAVILY_API_KEY=
PORT=3000
CHROMA_PATH=./chroma-db
```

4. Build the project:

```bash
npm run build
```

5. Start the web app:

```bash
npm run start
```

Then open `http://localhost:3000`.

## First-Run Knowledge Base Embedding

The local aviation docs are embedded automatically the first time the knowledge base is used. The app stores embeddings in `chroma-db/` and reuses them on later runs.

If the markdown files in `docs/` change, FlightGPT recomputes the document signature and refreshes the local vector store automatically the next time the knowledge base runs.

## Tools

### `calculator`

Use for math expressions, conversions, distances, durations, and aviation-related calculations.

### `knowledge_base`

Uses local markdown reference material for aircraft types, airport codes, terminology, common routes, OpenSky notes, and aviation math reference content.

### `flight_lookup`

Queries OpenSky Network for live aircraft over supported locations such as `Utah`, `SLC`, `JFK`, `LAX`, `ORD`, `ATL`, `DFW`, and `DEN`, or by callsign such as `UAL123`.

### `web_search`

Uses Tavily to answer questions that need fresh web data, such as airport delays, airline news, and changing real-world aviation information.

## Tests

Run the basic tool test suite:

```bash
npm test
```

Available individual scripts:

```bash
npm run test:calculator
npm run test:flight-lookup
npm run test:knowledge-base
npm run test:web-search
npm run test:agent
```

## Example Prompts

- `What's flying over Utah right now?`
- `Which of those is the largest aircraft?`
- `How far is SLC to JFK in kilometers?`
- `Are there any delays at JFK today?`
- `What is a squawk code?`

## Notes

- Conversation history is session-scoped and stored in memory.
- The free OpenSky endpoint is rate-limited and coverage is limited to what their API returns.
- The browser UI streams agent steps, not token-by-token chat output.
