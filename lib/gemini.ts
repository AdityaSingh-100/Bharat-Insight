// lib/gemini.ts - Data-agnostic Gemini streaming

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DatasetSummary } from "./csv-engine";

export interface GeminiStreamOptions {
  activeFilters: Record<string, string>;
  globalSearch: string;
  filteredRowCount: number;
  totalRowCount: number;
  summary: DatasetSummary;
  orgName: string;
  filename: string;
  userQuestion: string;
}

function buildPrompt(opts: GeminiStreamOptions): string {
  const {
    activeFilters,
    globalSearch,
    filteredRowCount,
    totalRowCount,
    summary,
    orgName,
    filename,
    userQuestion,
  } = opts;

  const filterLines = [
    ...Object.entries(activeFilters)
      .filter(([, v]) => v)
      .map(([k, v]) => `  ${k}: "${v}"`),
    ...(globalSearch ? [`  search: "${globalSearch}"`] : []),
  ];

  const numericStatsLines = Object.entries(summary.statistics)
    .filter(([, s]) => s.mean !== undefined)
    .slice(0, 8)
    .map(
      ([col, s]) =>
        `  ${col}: min=${s.min?.toFixed?.(2) ?? s.min}, max=${s.max?.toFixed?.(2) ?? s.max}, mean=${s.mean?.toFixed?.(2) ?? s.mean}, sum=${s.sum?.toLocaleString?.() ?? s.sum}`,
    );

  const catStatsLines = Object.entries(summary.statistics)
    .filter(([, s]) => s.uniqueCount !== undefined)
    .slice(0, 5)
    .map(
      ([col, s]) =>
        `  ${col}: ${s.uniqueCount} unique values, top: ${s.topValues?.join(", ")}`,
    );

  return `You are a concise data analyst assistant for ${orgName}.

DATASET: "${filename}"
COLUMNS: ${summary.columnCount} columns · Numeric: ${summary.numericColumns.join(", ")} · Categorical: ${summary.categoricalColumns.join(", ")}

CURRENT VIEW:
  Total rows: ${totalRowCount.toLocaleString()}
  Filtered rows: ${filteredRowCount.toLocaleString()} (${((filteredRowCount / totalRowCount) * 100).toFixed(1)}% of total)
${filterLines.length > 0 ? `  Active filters:\n${filterLines.join("\n")}` : "  No active filters"}

NUMERIC STATISTICS (filtered rows):
${numericStatsLines.join("\n") || "  No numeric columns"}

CATEGORICAL BREAKDOWN:
${catStatsLines.join("\n") || "  No categorical columns"}

QUESTION: ${userQuestion}

Rules:
- Reply in plain text only — no markdown, no asterisks, no bullet symbols, no numbered lists
- Use short paragraphs separated by a blank line
- Label sections with ALL-CAPS words like: SUMMARY, PATTERNS, RECOMMENDATIONS — followed by a colon on the same line, then the text on the next line
- Keep each section to 2-4 sentences max
- Cite actual numbers from the statistics; skip generic filler phrases
- Total response must be under 200 words`;
}

// Models to try in order — falls back if quota exceeded
const MODELS_FALLBACK = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

function parseRetryDelay(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err);
  const match =
    msg.match(/retry(?:Delay)?['":\s]+(\d+)s/i) ??
    msg.match(/Please retry in ([\d.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1])) * 1000 : 0;
}

// Real Gemini streaming via official SDK
export async function* streamGeminiInsight(
  opts: GeminiStreamOptions,
  apiKey: string,
): AsyncGenerator<{ type: "thinking" | "text"; content: string }> {
  yield {
    type: "thinking",
    content: `Analyzing ${opts.filteredRowCount.toLocaleString()} rows from "${opts.filename}"...`,
  };

  const genAI = new GoogleGenerativeAI(apiKey);

  let lastErr: unknown;
  for (const modelName of MODELS_FALLBACK) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: buildPrompt(opts) }] }],
        generationConfig: { temperature: 0.65, maxOutputTokens: 1024 },
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield { type: "text", content: text };
      }
      return; // success — stop trying fallbacks
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = msg.includes("429") || msg.toLowerCase().includes("quota");
      console.error(`[Gemini ${modelName}]`, msg);

      if (is429) {
        // Try waiting the suggested delay before next model
        const delay = parseRetryDelay(err);
        if (delay > 0 && delay < 30_000) {
          yield {
            type: "thinking",
            content: `Rate limited on ${modelName}, retrying in ${Math.ceil(delay / 1000)}s...`,
          };
          await new Promise((r) => setTimeout(r, delay));
        }
        lastErr = err;
        continue; // try next model
      }
      throw new Error(`Gemini request failed: ${msg}`);
    }
  }

  // All models exhausted
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`All Gemini models quota exceeded. ${msg}`);
}

// Legacy fetch-based streaming (fallback)
async function* _streamGeminiInsightFetch(
  opts: GeminiStreamOptions,
  apiKey: string,
): AsyncGenerator<{ type: "thinking" | "text"; content: string }> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(opts) }] }],
        generationConfig: { temperature: 0.65, maxOutputTokens: 1024 },
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No stream");

  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      const t = line.trim();
      if (!t || t === "[" || t === "]" || t === ",") continue;
      try {
        const json = t.startsWith(",") ? t.slice(1) : t;
        const text =
          JSON.parse(json)?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield { type: "text", content: text };
      } catch {
        /* skip */
      }
    }
  }
}

// Mock streamer (no API key needed)
export async function* mockGeminiStream(
  opts: GeminiStreamOptions,
): AsyncGenerator<{ type: "thinking" | "text"; content: string }> {
  yield {
    type: "thinking",
    content: `Analyzing ${opts.filteredRowCount.toLocaleString()} rows from "${opts.filename}"...`,
  };

  await new Promise((r) => setTimeout(r, 1000));

  const filterDesc =
    Object.entries(opts.activeFilters).filter(([, v]) => v).length > 0
      ? `Filters active: ${Object.entries(opts.activeFilters)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}="${v}"`)
          .join(", ")}.`
      : "No column filters active — viewing full dataset.";

  const numStats = Object.entries(opts.summary.statistics)
    .filter(([, s]) => s.mean !== undefined)
    .slice(0, 3)
    .map(
      ([col, s]) =>
        `${col}: avg ${s.mean?.toFixed?.(2) ?? s.mean}, range ${s.min?.toFixed?.(2)} – ${s.max?.toFixed?.(2)}`,
    )
    .join("  |  ");

  const topCats = Object.entries(opts.summary.statistics)
    .filter(([, s]) => s.topValues)
    .slice(0, 2)
    .map(([col, s]) => `${col}: ${s.topValues?.slice(0, 3).join(", ")}`)
    .join("  |  ");

  const response = `SUMMARY:
${opts.filteredRowCount.toLocaleString()} of ${opts.totalRowCount.toLocaleString()} rows shown (${((opts.filteredRowCount / opts.totalRowCount) * 100).toFixed(1)}%). ${filterDesc}

PATTERNS:
${numStats || "No numeric columns detected."}
${topCats ? topCats + "\n" : ""}The filtered view has ${opts.summary.numericColumns.length} numeric and ${opts.summary.categoricalColumns.length} categorical columns available.

RECOMMENDATIONS:
Use column filters to drill into specific segments. Sort columns by clicking headers to surface top and bottom performers.

NOTE:
This is a demo response. Add your Gemini API key to .env.local for AI-powered analysis.`;

  const words = response.split(" ");
  for (const word of words) {
    yield { type: "text", content: word + " " };
    await new Promise((r) => setTimeout(r, 15));
  }
}
