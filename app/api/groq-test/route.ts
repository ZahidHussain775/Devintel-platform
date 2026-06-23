import { NextResponse } from "next/server";
import { generateText } from "@/lib/groq";

// GET /api/groq-test
// Tests whether the Groq API key is valid.
// Visit localhost:3000/api/groq-test in your browser to check.
export async function GET() {
  try {
    const response = await generateText(
      "Reply with exactly one sentence confirming you are ready to analyze developer profiles."
    );
    return NextResponse.json({
      status: "connected",
      model: "llama-3.3-70b-versatile (Groq)",
      response,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
