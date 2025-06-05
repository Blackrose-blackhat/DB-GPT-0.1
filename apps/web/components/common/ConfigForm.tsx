import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConfigForm({ onConfigured }: { onConfigured: () => void }) {
  const [projectName, setProjectName] = useState("My Project");
  const [dbUrl, setDbUrl] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const res = await fetch("http://localhost:3001/introspect", {
        method: "POST",
        headers,
        body: JSON.stringify({ dbUrl }),
      });
      const data = await res.json();
      if (data && data.schema) {
        localStorage.setItem(
          "dbgpt_dashboard",
          JSON.stringify({
            projectName,
            dbUrl,
            provider,
            apiKey,
            model,
            dbType: detectDbType(dbUrl),
            schema: data.schema,
            chat: [],
            configured: true,
          })
        );
        document.cookie = "configured=true; path=/";
        onConfigured();
      } else {
        alert("Failed to load  schema. Please check your configuration.");
      }
    } catch {
      alert("Error connecting to database or loading schema.");
    } finally {
      setLoading(false);
    }
  };

  function detectDbType(url: string) {
    if (url.startsWith("mongodb://") || url.startsWith("mongodb+srv://")) return "MongoDB";
    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) return "PostgreSQL";
    if (url.startsWith("mysql://")) return "MySQL";
    return "Unknown";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-20 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-md
                 flex flex-col gap-6"
    >
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
        Project Configuration
      </h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="projectName" className="font-semibold text-gray-700 dark:text-gray-300">
          Project Name
        </label>
        <Input
          id="projectName"
          placeholder="My Project"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dbUrl" className="font-semibold text-gray-700 dark:text-gray-300">
          Database URL
        </label>
        <Input
          id="dbUrl"
          placeholder="postgresql://user:pass@host:port/dbname"
          value={dbUrl}
          onChange={(e) => setDbUrl(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-gray-700 dark:text-gray-300">Provider</label>
        <select
          className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800
                     px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2
                     focus:ring-indigo-500 focus:border-indigo-500"
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setModel(e.target.value === "gemini" ? "gemini-2.0-flash" : "gpt-3.5-turbo");
          }}
        >
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="apiKey"
          className="font-semibold text-gray-700 dark:text-gray-300"
        >{`${provider === "gemini" ? "Gemini" : "OpenAI"} API Key`}</label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-gray-700 dark:text-gray-300">Model</label>
        {provider === "gemini" ? (
          <select
            className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800
                       px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2
                       focus:ring-indigo-500 focus:border-indigo-500"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        ) : (
          <select
            className="mt-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800
                       px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2
                       focus:ring-indigo-500 focus:border-indigo-500"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        )}
      </div>

      <Button type="submit" disabled={loading} className="mt-6">
        {loading ? "Connecting..." : "Connect & Load Schema"}
      </Button>
    </form>
  );
}
