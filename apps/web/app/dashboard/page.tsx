"use client";
import React, { useEffect, useState } from "react";
import Chat from "@/components/common/Chat";
import { loadDashboardState } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [state, setState] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loaded = loadDashboardState();
    if (!loaded || !loaded.configured) {
      router.replace("/config");
    } else {
      setState(loaded);
    }
  }, [router]);

  const handleExit = async () => {
    if (!state?.dbUrl) return;
    try {
      await fetch("http://localhost:3001/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbUrl: state.dbUrl }),
      });
    } catch (e) {
      // Handle error if needed
    }
    localStorage.removeItem("dbgpt_dashboard");
    router.replace("/config");
  };

  if (!state) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <input
            className="text-2xl font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500
                       rounded-md px-1 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
                       transition-all w-auto min-w-[10ch]"
            value={state.projectName}
            onChange={(e) => {
              const newName = e.target.value;
              setState((prev: any) => ({ ...prev, projectName: newName }));
              localStorage.setItem(
                "dbgpt_dashboard",
                JSON.stringify({ ...state, projectName: newName })
              );
            }}
            style={{ width: `${Math.max(10, state.projectName.length)}ch` }}
            placeholder="Project Name"
            spellCheck={false}
          />
          {state.dbType && (
            <span className="inline-block rounded-md bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
              {state.dbType}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-semibold">Provider:</span>{" "}
            <span className="font-mono">{state.provider}</span>
          </div>
          <div>
            <span className="font-semibold">Model:</span>{" "}
            <span className="font-mono">{state.model}</span>
          </div>
          <div className="max-w-xs truncate">
            <span className="font-semibold">DB URL:</span>{" "}
            <span className="font-mono">{state.dbUrl}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleExit}
            title="Exit and close connection"
          >
            Exit
          </Button>
        </div>
      </header>

      <main className="flex-grow overflow-hidden p-5">
        <Chat />
      </main>
    </div>
  );
}
