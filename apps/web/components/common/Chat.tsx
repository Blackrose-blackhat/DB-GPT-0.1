import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResultViewer from "./resultViewer";
import ConfirmModal from "./ConfirmModal";

import { loadDashboardState, saveDashboardState } from "@/lib/utils";

export default function Chat() {
  const [state, setState] = useState<any>(loadDashboardState() || {});
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");

  useEffect(() => {
    saveDashboardState(state);
  }, [state]);

  const handleSubmit = async (customPrompt?: string, skipConfirmation = false) => {
    const actualPrompt = customPrompt ?? prompt;
    if (!actualPrompt.trim()) return;

    if (!skipConfirmation && /(delete|update|alter|drop|remove)/i.test(actualPrompt)) {
      setPendingPrompt(actualPrompt);
      setConfirmOpen(true);
      return;
    }

    setLoading(true);

    setState((prev: any) => ({
      ...prev,
      chat: [...(prev.chat || []), { role: "user", content: actualPrompt }],
    }));

    // Add a placeholder AI message for streaming
    setState((prev: any) => ({
      ...prev,
      chat: [...(prev.chat || []), { role: "ai", content: "", table: null }],
    }));

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (state.provider === "gemini") headers["x-gemini-api-key"] = state.apiKey;
    if (state.provider === "openai") headers["x-open-ai-api-key"] = state.apiKey;

    try {
      const res = await fetch("http://localhost:3001/execute", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: actualPrompt,
          provider: state.provider,
          model: state.model,
          dbUrl: state.dbUrl,
          schema: state.schema,
        }),
      });

      const data = await res.json();

      // Generate summary based on response type
      let summary = "";
      if (Array.isArray(data.result)) {
        summary = `Found ${data.result.length} records. Here are the details:`;
      } else if (typeof data.result === "object" && data.result !== null) {
        summary = "Here is the result:";
      } else {
        summary = String(data.result);
      }

      // Simulate streaming the summary text
      setStreaming(true);
      for (let i = 0; i < summary.length; i++) {
        await new Promise((r) => setTimeout(r, 10));
        const partial = summary.slice(0, i + 1);
        setState((prev: any) => {
          const updated = [...(prev.chat || [])];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === "ai") {
            updated[lastIdx] = { ...updated[lastIdx], content: partial };
          }
          return { ...prev, chat: updated };
        });
      }
      setStreaming(false);

      // Update AI message with full content and table/raw data
      setState((prev: any) => {
        const updated = [...(prev.chat || [])];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === "ai") {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: summary,
            table: Array.isArray(data.result) ? data.result : undefined,
            raw: data.result,
          };
        }
        return { ...prev, chat: updated };
      });

      setPrompt("");
    } catch {
      setState((prev: any) => ({
        ...prev,
        chat: [
          ...(prev.chat || []),
          { role: "ai", content: "An error occurred while processing your request." },
        ],
      }));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    handleSubmit(pendingPrompt, true);
    setPendingPrompt("");
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingPrompt("");
  };

  if (!state.configured) return null;

  return (
    <>
      <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto px-4 pb-32">
        {(state.chat || []).map((msg: any, idx: number) => (
          <div
            key={idx}
            className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-5 py-3 rounded-lg whitespace-pre-wrap
              ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }`}
            >
              {msg.content}
              {msg.role === "ai" && msg.table && (
                <div className="mt-3">
                  <ResultViewer result={msg.table} summary="" />
                </div>
              )}
              {msg.role === "ai" && !msg.table && msg.raw && (
                <pre className="bg-gray-900 text-white text-xs rounded p-2 mt-3 overflow-x-auto">
                  {JSON.stringify(msg.raw, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start mb-4">
            <div className="inline-block px-5 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse">
              ...
            </div>
          </div>
        )}
      </div>

      <ConfirmModal open={confirmOpen} query={pendingPrompt} onConfirm={handleConfirm} onCancel={handleCancel} />

      <form
        className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) handleSubmit();
        }}
      >
        <div className="max-w-3xl mx-auto flex gap-3 items-center px-4">
          <Input
            placeholder="Ask your database anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!loading) handleSubmit();
              }
            }}
            className="flex-1"
            disabled={loading}
            spellCheck={false}
          />
          <Button
            type="submit"
            disabled={loading || !state.dbUrl || !state.apiKey || !prompt.trim()}
          >
            {loading ? "Running..." : "Send"}
          </Button>
        </div>
      </form>
    </>
  );
}
