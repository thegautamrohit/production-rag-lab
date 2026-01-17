"use client";

import { useState } from "react";

export type Source = {
  "loc.lines.from": number;
  "loc.lines.to": number;
  "loc.pageNumber": number;
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState({
    response: "",
    sources: [] as Array<Source>,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setResponse({
      response: "",
      sources: [] as Array<Source>,
    });

    try {
      const response = await fetch("/api/ask-rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: question }),
      });

      const result = await response.json();
      // console.log(result);
      setResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black font-sans">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Production RAG Lab
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Ask any question and get an AI-generated response.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Your Question
              </label>
              <textarea
                id="question"
                rows={4}
                className="mt-2 block w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-white"
                placeholder="What is RAG?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Thinking..." : "Ask Question"}
            </button>
          </form>
        </div>

        {response?.response?.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {response?.response}
            </h2>
          </div>
        )}

        {response?.sources?.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Sources:
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {response?.sources?.map((item: Source, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Source {index + 1}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      Page {item?.["loc.pageNumber"]}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Lines {item?.["loc.lines.from"]} - {item?.["loc.lines.to"]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
