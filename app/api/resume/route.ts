// import { NextRequest, NextResponse } from "next/server";
// import { parseResumeText } from "@/lib/resumeParser";

// export async function POST(req: NextRequest) {
//   try {
//     // Read the incoming request as form data
//     // The frontend sends the PDF file as multipart/form-data
//     const formData = await req.formData();
//     const file = formData.get("resume");

//     // Validate — make sure a file was actually sent
//     if (!file || typeof file === "string") {
//       return NextResponse.json(
//         { error: "No resume file provided" },
//         { status: 400 }
//       );
//     }

//     // Validate file type — only accept PDFs
//     if (file.type !== "application/pdf") {
//       return NextResponse.json(
//         { error: "Only PDF files are supported" },
//         { status: 400 }
//       );
//     }

//     // Validate file size — reject anything over 5MB
//     // file.size is in bytes, so 5 * 1024 * 1024 = 5MB
//     if (file.size > 5 * 1024 * 1024) {
//       return NextResponse.json(
//         { error: "File too large — maximum size is 5MB" },
//         { status: 400 }
//       );
//     }

//     // Convert the file to a Buffer (raw bytes) that pdf-parse can read
//     // file.arrayBuffer() reads the entire file into memory as binary data
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Dynamically import pdf-parse to avoid Next.js static import issues.
//     // pdf-parse exports itself as the default CommonJS export so we cast it.
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//    const pdfParse = require("pdf-parse");
//   //  console.log(pdfParse);
//    console.log(typeof pdfParse);
// console.log(Object.keys(pdfParse));
//    const pdfData  = await pdfParse(buffer);
//     // pdfData.text contains all the text extracted from the PDF
//     // Pass it to our parser utility which extracts structured data
//     const resumeData = parseResumeText(pdfData.text);

//     return NextResponse.json(resumeData);
// } catch (err) {
//     console.error("RESUME PARSE ERROR:", err);
//     const message = err instanceof Error ? err.message : "Failed to parse resume";
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resumeParser";
import pdfParse from "pdf-parse";


export async function POST(req: NextRequest) {
  try {
    // Read multipart form data
    const formData = await req.formData();
    const file = formData.get("resume");

    // Validate file exists
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 }
      );
    }

    // Validate PDF type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large — maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await pdfParse(buffer);

    const resumeData = parseResumeText(pdfData.text);

    return NextResponse.json(resumeData);

    return NextResponse.json(resumeData);
  } catch (err) {
    console.error("RESUME PARSE ERROR:", err);

    const message =
      err instanceof Error
        ? err.message
        : "Failed to parse resume";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}