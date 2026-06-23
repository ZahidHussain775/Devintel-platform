import Groq from "groq-sdk";

// ── Groq client ───────────────────────────────────────────────────────────────
// Model: llama-3.3-70b-versatile
//   • Free tier: 6000 tokens/min, 500 requests/day
//   • 128k context window
//   • Works from Pakistan — no geo-restrictions

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your .env.local file. " +
      "Get a free key at https://console.groq.com"
    );
  }
  return new Groq({ apiKey });
}

// ── Generate plain text response ──────────────────────────────────────────────
export async function generateText(prompt: string): Promise<string> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Groq returned an empty response");
  return text;
}

// ── Generate and parse JSON response ─────────────────────────────────────────
// T is a generic — caller specifies what shape the JSON should be
export async function generateJSON<T>(prompt: string): Promise<T> {
  const text = await generateText(prompt);

  // Strip markdown code fences if Groq wraps JSON in them
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(clean) as T;
  } catch {
    throw new Error(`Groq response was not valid JSON:\n${clean}`);
  }
}
