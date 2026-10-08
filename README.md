# Yatra — AI Virtual Pilgrimage

Yatra is an intent-first temple discovery experience. Visitors describe why they want to go, their time and preferences. Yatra recommends a pilgrimage route, explains the match, opens a virtual temple experience and provides an AI guide.

## Product flow

User intent → temple matching → personalized route → virtual experience → AI temple guide → next stop.

## Implemented

- Intent-based temple recommendations with explainable matching
- Knowledge for Varadaraja, Ekambareswarar, Kamakshi, Kumarakottam and Kailasanathar
- Personalized route cards and next-stop navigation
- Native virtual temple scene with interactive hotspots
- Local open-source AI guide using Ollama + Qwen3
- Multilingual responses through the selected language
- Structured temple-knowledge fallback when the local model is unavailable
- No OpenAI dependency and no paid API key

## Run the AI guide locally

Install Ollama, then pull the model:

```bash
ollama pull qwen3:8b
ollama run qwen3:8b
```

Ollama normally exposes its local API at:

```
http://127.0.0.1:11434
```

The Yatra backend calls Ollama directly. No API key is required.

Optional environment variables:

```bash
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
```

## Important deployment note

GitHub Pages is static and cannot run Ollama. A public deployment needs a server where Ollama and Qwen3 are running. For a local demo, run Ollama on the same machine as the browser/backend.

If the model is unavailable, Yatra still returns relevant information from `data/temples.json`.

## GitHub Pages

The static experience can be published with `.github/workflows/deploy-pages.yml`.

Expected static URL: https://nagasai17bce-rgb.github.io/3D-temple-tour-/

## Content

Temple facts are based on public tourism information. Verify current timings, seva availability and special-event schedules directly with the temple before a physical visit.

## Vision

Yatra should evolve into a true virtual pilgrimage platform with licensed or owned 360° imagery, multilingual voice guidance, richer retrieval, live route planning and personalized pilgrimage memories.
