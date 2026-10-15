# AI Agent CLI

This project was built as part of the AI Agents Fundamentals course on [master.dev](https://master.dev).

A TypeScript terminal AI agent built with the Vercel AI SDK, OpenAI, and Ink. It runs as an interactive TUI that can stream responses, call tools, ask for approval before risky actions, and maintain a compact conversation history as token usage grows.

## Features

- Streaming assistant responses in a terminal UI
- Tool calling for file system operations, shell commands, and web search
- Human approval flow before executing tool calls
- Context-window and token tracking
- Automatic conversation compaction when the model context gets tight
- Simple local evaluation harness for testing agent behavior

## Requirements

- Node.js 18+
- npm
- An OpenAI API key via `OPENAI_API_KEY`
- Optional `LMNR_PROJECT_API_KEY` for Laminar telemetry

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the repository root:

```bash
OPENAI_API_KEY=your_openai_api_key
LMNR_PROJECT_API_KEY=your_lmnr_key # optional
```

## Run the app

Start the interactive agent in development mode:

```bash
npm run dev
```

Or run the CLI directly with the production-style script:

```bash
npm run start
```

The app opens an interactive terminal interface. Type `exit` or `quit` to close it.

## Build

Compile the TypeScript sources into the `dist/` directory:

```bash
npm run build
```

You can also run the built CLI directly:

```bash
node dist/cli.js
```

## Project structure

- `src/cli.ts` — CLI entry point
- `src/ui/` — Ink-based terminal UI
- `src/agent/run.ts` — main agent loop and model orchestration
- `src/agent/tools/` — file, shell, and web tools exposed to the model
- `src/agent/context/` — token estimation and context compaction logic
- `evals/` — evaluation scripts and fixtures

## How it works

The agent takes user input, sends it through the model with a system prompt, streams the response, and executes tools as needed. Any tool that may be destructive or environment-changing is surfaced through the approval step before execution.

