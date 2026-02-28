// app/api/dataset/route.ts
// Server-side: reads CSV files from /dataset folder and returns parsed JSON

import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const DATASET_DIR = join(process.cwd(), "dataset");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("file");

  try {
    // List available files
    const files = await readdir(DATASET_DIR);
    const csvFiles = files.filter((f) => f.toLowerCase().endsWith(".csv"));

    if (!filename) {
      // Return list of available CSV files
      return NextResponse.json({
        files: csvFiles,
        datasetDir: "dataset/",
      });
    }

    // Validate filename (security: prevent path traversal)
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    if (!csvFiles.includes(filename)) {
      return NextResponse.json({ error: `File "${filename}" not found in /dataset` }, { status: 404 });
    }

    const filepath = join(DATASET_DIR, filename);
    const content = await readFile(filepath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/csv",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("ENOENT") && msg.includes("dataset")) {
      return NextResponse.json(
        {
          error: "Dataset directory not found. Create a /dataset folder in your project root and add CSV files.",
          hint: "mkdir dataset && cp your-data.csv dataset/",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
