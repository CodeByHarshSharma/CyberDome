# AI CyberDome

A coding arena where two AI models answer the same question and a third model judges them.

Type a problem, and Gemini and Cohere each write a solution. A judge model (Gemma via Ollama) then scores both from 0 to 10 with written reasoning.

## How it works

```
Question → [Gemini ‖ Cohere] (parallel) → Judge → Scores + reasoning
```

- **Orchestration:** a two-step LangGraph pipeline (solve, then judge)
- **Fair judging:** solution order is shuffled before judging to reduce position bias, then scores are mapped back
- **Resilient:** if one model fails, the other answer still shows

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, axios, react-markdown, rehype-highlight |
| Backend | Node.js, Express, TypeScript, LangChain / LangGraph, Zod |
| Models | Gemini (solution 1), Cohere (solution 2), Gemma on Ollama (judge) |

## Getting started

**Prerequisites:** Node.js 18+ and API keys for Google AI, Cohere, and Ollama.

```bash
git clone https://github.com/CodeByHarshSharma/CyberDome.git
cd CyberDome
```

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # then fill in your keys
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open on localhost.

## Author

[Harsh Sharma](https://github.com/CodeByHarshSharma).
