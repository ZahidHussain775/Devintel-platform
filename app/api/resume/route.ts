import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resumeParser";

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

    // Import the module then grab the real default — avoids the Windows
    // ENOENT bug where pdf-parse tries to open its own test fixture on import.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfModule = (await import("pdf-parse/lib/pdf-parse.js")) as any;
    const pdfParse  = pdfModule.default ?? pdfModule;

    const pdfData = await pdfParse(buffer, {
      // Passing a no-op version function stops pdf-parse from trying
      // to read test files off disk during initialisation.
      version: "default",
    });

    const resumeData = parseResumeText(pdfData.text);

    return NextResponse.json(resumeData);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}