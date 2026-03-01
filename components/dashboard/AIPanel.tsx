"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Brain, Send, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { useOrgStore, ORG_CONFIGS } from "@/store/useOrgStore";
import { useDatasetStore } from "@/store/useDatasetStore";
import { mockGeminiStream, streamGeminiInsight } from "@/lib/gemini";
import type { DatasetSummary } from "@/lib/csv-engine";

const QUICK_QUESTIONS = [
  "What are the key patterns in this data?",
  "Which categories have the highest values?",
  "Are there any anomalies or outliers?",
  "Summarize the filtered rows",
  "What trends do you see?",
  "Give me actionable recommendations",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isThinking?: boolean;
}

interface AIPanelProps {
  filteredCount: number;
  filteredRows: Record<string, unknown>[];
  dynamicSummary: DatasetSummary | null;
}

export function AIPanel({
  filteredCount,
  filteredRows,
  dynamicSummary,
}: AIPanelProps) {
  const {
    isAIPanelOpen,
    setAIPanelOpen,
    currentOrg,
    activeFilters,
    globalSearch,
  } = useOrgStore();
  const { dataset, activeFile } = useDatasetStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const orgConfig = ORG_CONFIGS[currentOrg];

  // Clear chat history when the user switches org
  useEffect(() => {
    const handleOrgSwitch = () => {
      setMessages([]);
      setInput("");
      setIsLoading(false);
    };
    window.addEventListener("org-switch", handleOrgSwitch);
    return () => window.removeEventListener("org-switch", handleOrgSwitch);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const q = (question ?? input).trim();
    if (!q || isLoading) return;

    setInput("");
    setIsLoading(true);

    const userMsg: Message = { role: "user", content: q };
    const thinkingMsg: Message = {
      role: "assistant",
      content: "",
      isThinking: true,
      isStreaming: true,
    };
    setMessages((prev) => [...prev, userMsg, thinkingMsg]);

    try {
      const summary = dynamicSummary ?? {
        rowCount: filteredCount,
        columnCount: 0,
        numericColumns: [],
        categoricalColumns: [],
        statistics: {},
      };

      const streamOpts = {
        activeFilters,
        globalSearch,
        filteredRowCount: filteredCount,
        totalRowCount: dataset?.rowCount ?? filteredCount,
        summary,
        orgName: orgConfig.name,
        filename: activeFile ?? "dataset.csv",
        userQuestion: q,
      };

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const stream = apiKey
        ? streamGeminiInsight(streamOpts, apiKey)
        : mockGeminiStream(streamOpts);

      let fullContent = "";
      let isFirstText = true;

      for await (const chunk of stream) {
        if (chunk.type === "thinking") {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                content: chunk.content,
                isThinking: true,
              };
            }
            return next;
          });
          await new Promise((r) => setTimeout(r, 800));
        } else {
          if (isFirstText) {
            isFirstText = false;
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last?.role === "assistant") {
                next[next.length - 1] = {
                  ...last,
                  isThinking: false,
                  content: "",
                };
              }
              return next;
            });
          }
          fullContent += chunk.content;
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === "assistant") {
              next[next.length - 1] = {
                ...last,
                content: fullContent,
                isStreaming: true,
              };
            }
            return next;
          });
        }
      }

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = {
            ...last,
            isStreaming: false,
            isThinking: false,
          };
        }
        return next;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[AIPanel Gemini error]", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: `❌ ${msg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isAIPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setAIPanelOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 200 }}
            className="fixed right-0 top-0 h-full z-40 flex flex-col"
            style={{
              width: "clamp(320px, 28vw, 460px)",
              borderLeft: "1px solid var(--color-border)",
              background: "hsl(224 71% 3.5% / 0.97)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--color-org-muted)",
                    border: "1px solid var(--color-org-border)",
                  }}
                >
                  <Brain
                    size={15}
                    style={{ color: "var(--color-org-primary)" }}
                  />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    AI Insights
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Gemini · {activeFile ?? "no file"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAIPanelOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--color-muted-foreground)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgb(255 255 255 / 0.05)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-foreground)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-muted-foreground)";
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Context bar */}
            <div
              className="px-5 py-2.5"
              style={{
                borderBottom: "1px solid var(--color-border)",
                background: "rgb(255 255 255 / 0.01)",
              }}
            >
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                <Sparkles
                  size={11}
                  style={{ color: "var(--color-org-primary)" }}
                />
                <span>
                  <span className="text-white font-medium">
                    {filteredCount.toLocaleString()}
                  </span>{" "}
                  rows
                  {dataset && filteredCount < dataset.rowCount && " (filtered)"}
                  {" · "}
                  <span className="text-white font-medium">
                    {dynamicSummary?.columnCount ?? 0}
                  </span>{" "}
                  columns
                  {Object.values(activeFilters).some(Boolean) && (
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: "var(--color-org-muted)",
                        color: "var(--color-org-primary)",
                      }}
                    >
                      filters active
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <Brain
                    size={28}
                    className="mx-auto mb-3"
                    style={{ color: "rgb(255 255 255 / 0.15)" }}
                  />
                  <p
                    className="text-sm mb-1"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Ask me about your data
                  </p>
                  <p
                    className="text-xs mb-6"
                    style={{ color: "rgb(255 255 255 / 0.25)" }}
                  >
                    I can see your active filters and column statistics
                  </p>
                  <div className="space-y-1.5">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all"
                        style={{
                          border: "1px solid var(--color-border)",
                          background: "transparent",
                          color: "var(--color-muted-foreground)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "var(--color-org-border)";
                          (e.currentTarget as HTMLElement).style.background =
                            "var(--color-org-muted)";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--color-foreground)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "var(--color-border)";
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--color-muted-foreground)";
                        }}
                      >
                        <ChevronRight
                          size={11}
                          style={{
                            color: "var(--color-org-primary)",
                            flexShrink: 0,
                          }}
                        />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: "var(--color-org-muted)",
                          border: "1px solid var(--color-org-border)",
                        }}
                      >
                        <Brain
                          size={11}
                          style={{ color: "var(--color-org-primary)" }}
                        />
                      </div>
                    )}
                    <div
                      className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                      style={
                        msg.role === "user"
                          ? {
                              background: "var(--color-org-muted)",
                              border: "1px solid var(--color-org-border)",
                              color: "var(--color-foreground)",
                            }
                          : {
                              background: "rgb(255 255 255 / 0.04)",
                              border: "1px solid var(--color-border)",
                              color:
                                "color-mix(in srgb, var(--color-foreground) 80%, transparent)",
                            }
                      }
                    >
                      {msg.isThinking ? (
                        <div
                          className="flex items-center gap-2 italic text-xs"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          <Loader2 size={11} className="animate-spin" />
                          {msg.content || "Thinking..."}
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">
                          {msg.content}
                          {msg.isStreaming && (
                            <span
                              className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse"
                              style={{ background: "var(--color-org-primary)" }}
                            />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-4"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <div
                className="flex items-end gap-2 rounded-xl p-2"
                style={{
                  border: "1px solid var(--color-border)",
                  background: "rgb(255 255 255 / 0.03)",
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about your data..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm placeholder-white/25 text-white resize-none focus:outline-none leading-relaxed"
                  style={{ minHeight: "34px", maxHeight: "120px" }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background:
                      !input.trim() || isLoading
                        ? "rgb(255 255 255 / 0.06)"
                        : "var(--color-org-primary)",
                    color:
                      !input.trim() || isLoading
                        ? "rgb(255 255 255 / 0.25)"
                        : "white",
                    cursor:
                      !input.trim() || isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                </button>
              </div>
              <p
                className="text-center text-[10px] mt-1.5"
                style={{ color: "rgb(255 255 255 / 0.2)" }}
              >
                Enter · Shift+Enter for newline
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
