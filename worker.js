export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env, url);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleChat(request, env, url) {
  try {
    const body = await request.json();
    const { question, temple, language = "English" } = body || {};

    if (!question || !temple) {
      return json({ error: "question and temple are required" }, 400);
    }

    const knowledge = await loadKnowledge(env, url);
    const result = retrieve(knowledge, temple.name, question);
    const system = systemPrompt(language, result.temple, result.context);

    if (!env.AI) {
      return json({
        answer: `Yatra AI is not connected yet. ${result.context.split("\n").slice(0, 3).join(" ")}`,
        language,
        model: "knowledge-fallback"
      });
    }

    const model = env.AI_MODEL || "@cf/qwen/qwen3-30b-a3b-fp8";
    const response = await env.AI.run(model, {
      messages: [
        { role: "system", content: system },
        { role: "user", content: question }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const answer = response?.response?.trim();
    if (!answer) throw new Error("Workers AI returned no response");

    return json({ answer, language, model });
  } catch (error) {
    console.error("Yatra AI error:", error);
    return json({ error: "AI guide unavailable" }, 500);
  }
}

async function loadKnowledge(env, url) {
  if (env.KNOWLEDGE_JSON) return JSON.parse(env.KNOWLEDGE_JSON);

  const response = await env.ASSETS.fetch(
    new Request(new URL("/data/temples.json", url))
  );

  if (!response.ok) {
    throw new Error(`Knowledge file unavailable: ${response.status}`);
  }

  return response.json();
}

function retrieve(knowledge, name, q) {
  const t = knowledge.temples.find(x => x.name === name) || knowledge.temples[0];
  const x = q.toLowerCase();
  const chunks = [
    { text: t.facts.join(". "), score: /architecture|gopuram|pillar|sculpture|art|building/.test(x) ? 3 : 1 },
    { text: t.traditions.join(", "), score: /famous|tradition|festival|legend|special|significance|seva/.test(x) ? 3 : 1 },
    { text: t.timings, score: /time|timing|open|close|hours|darshan/.test(x) ? 3 : 1 },
    { text: t.guidance, score: 2 },
    { text: `Deity: ${t.deity}`, score: /deity|god|goddess|who/.test(x) ? 3 : 1 }
  ];

  return {
    temple: t,
    context: chunks.sort((a, b) => b.score - a.score).map(x => x.text).join("\n")
  };
}

function systemPrompt(language, temple, context) {
  return `You are Yatra, an expert and respectful AI temple guide. Reply in ${language}.
Answer naturally and conversationally, not as a template. Use the supplied temple knowledge for factual claims.
Religious claims must be presented as traditions or beliefs, never as medical guarantees.
Do not invent rituals, dates, prices, seva availability or current events. If current information is not in the knowledge, tell the visitor to verify with the temple.
You can explain history, architecture, deity, traditions, festivals, significance, darshan guidance and related questions.
Keep most answers under 150 words unless the visitor asks for more depth.

Temple: ${temple.name}
Deity: ${temple.deity}
Retrieved temple knowledge:
${context}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
