import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resumeParser";

// ── DOMMatrix polyfill ──────────────────────────────────────────────────────
// pdf-parse pulls in pdfjs-dist internally, which expects browser canvas
// APIs (DOMMatrix) even though we never render anything — only extract text.
// Vercel's Node.js serverless runtime has no DOM, so we stub it out.
if (typeof globalThis.DOMMatrix === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = class DOMMatrix {
    constructor() {}
  };
}

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
    const buffer = Buffer.from(arrayBuffer);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfModule = (await import("pdf-parse")) as any;
    const pdfParse  = pdfModule.default?.default ?? pdfModule.default ?? pdfModule;
    const pdfData   = await pdfParse(buffer);

    const resumeData = parseResumeText(pdfData.text);
    return NextResponse.json(resumeData);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}