# DB-GPT

**DB-GPT** is an AI-powered, multi-database chat assistant that lets you interact with your databases (PostgreSQL, MongoDB, and more) using natural language. It leverages LLMs (Gemini, OpenAI) to generate structured query plans and execute them securely, with a modern Next.js web UI and a Fastify-based backend.

---

## Features

- **Natural Language to Query:** Ask questions in plain English, get structured queries and results.
- **Multi-Database Support:** Works with PostgreSQL and MongoDB (extensible to others).
- **LLM Provider Choice:** Use Gemini or OpenAI models, configurable per project.
- **Schema Introspection:** Automatically loads and caches your DB schema for safe, accurate queries.
- **No Hallucination:** Only valid collections/tables and fields are used, based on your schema.
- **Secure Execution:** Dangerous operations (delete, update, drop, etc.) require confirmation.
- **Persistent Sessions:** All configuration and chat history are saved in localStorage and a cookie for seamless reloads.
- **Modern UI:** Built with Next.js App Router, React, and shadcn/ui components.
- **Connection Management:** Explicit endpoints for introspection, execution, and closing DB connections.

---

## Project Structure

```
apps/
  web/
    app/
      page.tsx              # SSR redirect to /config or /dashboard based on cookie
      config/page.tsx       # Project configuration form
      dashboard/page.tsx    # Main chat dashboard
    components/
      common/
        ConfigForm.tsx      # Configuration form component
        Chat.tsx            # Chat UI component
        ResultViewer.tsx    # Table/result viewer
        ConfirmModal.tsx    # Dangerous operation confirmation modal
    lib/
      utils.ts              # LocalStorage helpers
packages/
  api/
    server.ts               # Fastify API: /introspect, /execute, /close
  agents/
    llm/
      promptBuilder.ts      # Prompt builders for Mongo/Postgres
      generatePostgresPlan.ts
      mongoPlanGenerator.ts
    mongo/
      index.ts              # MongoAgent with connection management
    postgres/
      index.ts              # PostgresAgent with connection management
```

---

## How It Works

### 1. Configuration

- On first visit, you are redirected to `/config`.
- Fill in:
  - Project Name
  - Database URL (Postgres or MongoDB)
  - LLM Provider (Gemini/OpenAI)
  - API Key
  - Model
- On submit, the frontend calls `/introspect` with your DB URL.
- The backend introspects your schema and returns it.
- The schema and config are saved in localStorage and a `configured=true` cookie is set.

### 2. Dashboard & Chat

- After config, you are redirected to `/dashboard`.
- The dashboard header shows project name (editable), DB type, provider, model, and DB URL (not editable).
- Chat UI lets you ask questions about your data.
- Each prompt calls `/execute`, sending the prompt, config, and cached schema.
- The backend uses the schema to generate a safe query plan (never re-introspects), validates it, executes it, and returns results.
- Results are shown in a table or JSON view.
- Dangerous operations (delete, update, drop, etc.) require confirmation.

### 3. Connection Management

- `/introspect`: Accepts `{ dbUrl }`, returns schema.
- `/execute`: Accepts `{ prompt, dbUrl, provider, model, schema }`, returns `{ plan, result }`.
- `/close`: Accepts `{ dbUrl }`, closes the DB connection and removes it from cache.
- On dashboard "Exit", `/close` is called, localStorage and cookie are cleared, and you are redirected to `/config`.

---

## Running Locally

1. **Clone the repo and install dependencies:**
   ```sh
   git clone <repo-url>
   cd db-gpt-0.1
   pnpm install
   ```

2. **Start a Postgres DB with sample data (optional):**
   ```sh
   docker-compose up -d
   # See init.sql and docker-compose.yml for details
   ```

3. **Start the backend API:**
   ```sh
   pnpm --filter @db-gpt/api dev
   # or
   cd packages/api && pnpm dev
   ```

4. **Start the frontend:**
   ```sh
   pnpm --filter @db-gpt/web dev
   # or
   cd apps/web && pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## API Endpoints

- `POST /introspect`  
  Body: `{ dbUrl }`  
  → Returns: `{ schema }`

- `POST /execute`  
  Body: `{ prompt, dbUrl, provider, model, schema }`  
  → Returns: `{ plan, result }`

- `POST /close`  
  Body: `{ dbUrl }`  
  → Closes the DB connection

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, shadcn/ui, TypeScript
- **Backend:** Fastify, TypeScript
- **Database:** PostgreSQL, MongoDB (extensible)
- **AI Providers:** Gemini, OpenAI

---

## Security & Notes

- **Never expose your DB or LLM API keys publicly.**
- This project is for demo/dev use. For production, use secure session management and connection pooling.
- All DB operations are validated against your schema to prevent hallucination and SQL injection.

---

## Credits

- Built by [Musharaf Parwez]
- Inspired by the open-source AI/data community

---

## License

MIT
