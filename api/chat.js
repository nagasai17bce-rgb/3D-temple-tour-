import fs from "fs";
import path from "path";

function loadKnowledge() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "temples.json"), "utf8"));
}

function retrieve(k, name, q) {
  const t = k.temples.find(x => x.name === name) || k.temples[0];
  const x = q.toLowerCase();
  const chunks = [
    { text: t.facts.join(". "), score: /architecture|gopuram|pillar|sculpture|art|building/.test(x) ? 3 : 1 },
    { text: t.traditions.join(", "), score: /famous|tradition|festival|legend|special|significance|seva/.test(x) ? 3 : 1 },
    { text: t.timings, score: /time|timing|open|close|hours|darshan/.test(x) ? 3 : 1 },
    { text: t.guidance, score: 2 },
    { text: `Deity: ${t.deity}`, score: /deity|god|goddess|who/.test(x) ? 3 : 1 }
  ];
  return { temple: t, context: chunks.sort((a, b) => b.score - a.score).map(x => x.text).join("\n") };
}

function instructions(language, temple, context) {
  return `You are Yatra, an expert and respectful AI temple guide. Reply in ${language}.
Answer naturally and conversationally, not as a template. Use the supplied temple knowledge for factual claims.
Religious claims must be presented as traditions or beliefs, never as medical or guaranteed outcomes.
Do not invent rituals, dates, prices, seva availability or current events. If current information is not in the knowledge, say the visitor should verify with the temple.
You can explain history, architecture, deity, traditions, festivals, significance, darshan guidance and related questions.
Keep most answers under 150 words unless the visitor asks for more depth.

Temple: ${temple.name}
Deity: ${temple.deity}
Retrieved temple knowledge:
${context}`;
}

async function askOllama(baseUrl, model, system, question) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: question }
      ],
      stream: false,
      options: { temperature: 0.3 }
    })
  });
  if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
  const data = await response.json();
  return data.message?.content?.trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { question, temple, language = "English" } = req.body || {};
    if (!question || !temple) return res.status(400).json({ error: "question and temple are required" });

    const k = loadKnowledge();
    const r = retrieve(k, temple.name, question);
    const system = instructions(language, r.temple, r.context);

    const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    const model = process.env.OLLAMA_MODEL || "qwen3:8b";

    try {
      const answer = await askOllama(ollamaUrl, model, system, question);
      if (answer) return res.status(200).json({ answer, language, model });
    } catch (error) {
      console.error("Ollama unavailable:", error.message);
    }

    return res.status(200).json({
      answer: `I can still help from Yatra's temple knowledge. ${r.context.split("\n").slice(0, 3).join(" ")}`,
      language,
      model: "local-knowledge-fallback"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI guide unavailable" });
  }
}
