# Yatra — AI Virtual Pilgrimage

Yatra is an intent-first temple discovery experience. Visitors describe why they want to go, their time and preferences. Yatra recommends a pilgrimage route, explains the match, opens a virtual temple experience and provides an AI guide.

## Product flow

User intent → temple matching → personalized route → virtual experience → AI temple guide → next stop.

## Implemented

- Intent-based temple recommendations with explainable matching
- Knowledge for Varadaraja, Ekambareswarar, Kamakshi, Kumarakottam and Kailasanathar
- Personalized route cards and next-stop navigation
- Native virtual temple experience
- Multilingual AI guide
- Cloudflare Pages Function + Workers AI
- Open-source Qwen model; no OpenAI/Gemini/OpenRouter API key
- Structured temple-knowledge fallback

## Free live deployment: Cloudflare Pages + Workers AI

The recommended live deployment is Cloudflare Pages with a Workers AI binding.

### 1. Push this repository to GitHub

This repository already contains the Pages Function at `functions/api/chat.js`.

### 2. Create a Cloudflare Pages project

In Cloudflare Dashboard:

1. Go to **Workers & Pages**.
2. Create a Pages project and connect this GitHub repository.
3. Build command: leave empty.
4. Build output directory: `.`.
5. Deploy.

### 3. Enable Workers AI

In the Cloudflare Pages project settings, add a **Workers AI** binding:

- Variable name: `AI`
- Binding: Workers AI

The function reads the binding as `context.env.AI`.

No API key is added to the frontend.

### 4. Model

Yatra uses:

`@cf/qwen/qwen3-30b-a3b-fp8`

You can change it with the `AI_MODEL` environment variable if you prefer another model supported by Workers AI.

### 5. Local development

Install dependencies:

```bash
npm install
npm run dev
```

This runs the Pages site and its Functions through Wrangler.

## Important

Workers AI has a free daily allocation, not unlimited inference. Cloudflare's current free allocation is 10,000 neurons/day. Usage above the free allocation may require a paid Workers AI setup.

## GitHub Pages

The static experience can still be published with the existing GitHub Pages workflow, but the AI chat requires Cloudflare Pages/Workers AI because GitHub Pages cannot execute server-side AI inference.

## Content

Temple facts are based on public tourism information. Verify current timings, seva availability and special-event schedules directly with the temple before a physical visit.

## Vision

Yatra should evolve into a true virtual pilgrimage platform with licensed or owned 360° imagery, multilingual voice guidance, richer retrieval, live route planning and personalized pilgrimage memories.
