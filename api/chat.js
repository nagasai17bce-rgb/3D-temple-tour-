import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { question, temple } = req.body || {};
    if (!question || !temple) return res.status(400).json({ error: "question and temple are required" });

    const system = `You are Yatra, a respectful AI temple guide for a virtual pilgrimage app.
Answer naturally and directly about the active temple. You may explain history, architecture, legends, traditions,
festivals, worship/seva, timings, practical visit guidance and what a visitor might notice.
Use only the supplied temple facts for factual claims. Clearly label religious traditions as beliefs/traditions,
never as medical guarantees. If current timing/seva information is not supplied, say the visitor should verify
with the temple. Do not invent rituals, dates, ticket prices or claims.
Active temple facts:
${JSON.stringify(temple)}`;

    const response = await client.responses.create({
      model: "gpt-6-astra",
      instructions: system,
      input: question
    });

    return res.status(200).json({ answer: response.output_text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI guide unavailable" });
  }
}