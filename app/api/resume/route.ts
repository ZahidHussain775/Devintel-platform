import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resumeParser";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large — maximum size is 5MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array   = new Uint8Array(arrayBuffer);

    // unpdf is built for serverless/edge runtimes — no DOM, no canvas,
    // no DOMMatrix dependency. Works cleanly on Vercel.
    const pdf = await getDocumentProxy(uint8Array);
    const { text } = await extractText(pdf, { mergePages: true });

    const resumeData = parseResumeText(text);
    return NextResponse.json(resumeData);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}g