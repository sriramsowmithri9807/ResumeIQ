/**
 * useAnalysis hook — manages the full analysis state machine
 */
"use client";

import { useState } from "react";
import { analyzeResume, AnalysisResult } from "@/services/api";
import { useRouter } from "next/navigation";

type AnalysisState = "idle" | "loading" | "success" | "error";

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const router = useRouter();

  async function analyze(file: File, jobDescription: string) {
    setState("loading");
    setError(null);

    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
      setState("success");

      // Store result in sessionStorage and navigate to results
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      router.push("/results");
    } catch (err: any) {
      setState("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  function reset() {
    setState("idle");
    setError(null);
    setResult(null);
  }

  return { state, error, result, analyze, reset };
}
