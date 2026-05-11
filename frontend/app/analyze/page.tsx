"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { UploadZone } from "@/components/UploadZone";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AlertCircle, FileSearch, Sparkles } from "lucide-react";

const MIN_JD_LENGTH = 50;

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const { state, error, analyze } = useAnalysis();

  const jdLength = jobDescription.trim().length;
  const isValid = file !== null && jdLength >= MIN_JD_LENGTH;
  const isLoading = state === "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !isValid) return;
    await analyze(file, jobDescription.trim());
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <Navbar />
        <div className="pt-24 px-6">
          <LoadingAnalysis />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.4)",
                color: "var(--accent-light)",
              }}
            >
              <FileSearch size={12} />
              ATS Resume Analyzer
            </div>
            <h1
              className="text-4xl md:text-5xl font-black mb-3"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Analyze your{" "}
              <span className="gradient-text">resume</span>
            </h1>
            <p style={{ color: "var(--foreground-muted)" }}>
              Upload your resume and paste the job description to get your ATS score.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Upload */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <label className="block text-sm font-semibold mb-3">
                <span className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent)", color: "white" }}
                  >
                    1
                  </span>
                  Upload Resume
                  <span className="font-normal text-xs ml-1" style={{ color: "var(--foreground-muted)" }}>
                    PDF or DOCX
                  </span>
                </span>
              </label>
              <UploadZone
                onFileSelect={setFile}
                selectedFile={file}
                onClear={() => setFile(null)}
              />
            </div>

            {/* Job Description */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <label
                htmlFor="job-description"
                className="block text-sm font-semibold mb-3"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent)", color: "white" }}
                  >
                    2
                  </span>
                  Job Description
                  <span className="font-normal text-xs ml-1" style={{ color: "var(--foreground-muted)" }}>
                    paste the full JD
                  </span>
                </span>
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here... Include requirements, responsibilities, and qualifications for best results."
                rows={10}
                className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all duration-200"
                style={{
                  background: "var(--surface-2)",
                  border: `1px solid ${jdLength >= MIN_JD_LENGTH ? "rgba(124,58,237,0.4)" : "var(--border)"}`,
                  color: "var(--foreground)",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: "1.7",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                onBlur={e => (e.target.style.borderColor = jdLength >= MIN_JD_LENGTH ? "rgba(124,58,237,0.4)" : "var(--border)")}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: jdLength < MIN_JD_LENGTH ? "var(--warning)" : "var(--foreground-subtle)" }}>
                  {jdLength < MIN_JD_LENGTH ? `${MIN_JD_LENGTH - jdLength} more characters needed` : "✓ Length looks good"}
                </span>
                <span className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
                  {jdLength.toLocaleString()} chars
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "var(--danger-muted)", border: "1px solid rgba(239,68,68,0.3)" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle size={18} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 1 }} />
                <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
              id="analyze-submit-button"
              style={{
                background: isValid
                  ? "var(--gradient-brand)"
                  : "var(--surface-2)",
                color: isValid ? "white" : "var(--foreground-subtle)",
                boxShadow: isValid ? "0 8px 30px rgba(124,58,237,0.4)" : "none",
                opacity: isLoading ? 0.7 : 1,
                cursor: !isValid ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => {
                if (isValid) e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Sparkles size={18} />
              {isLoading ? "Analyzing..." : "Analyze My Resume"}
            </button>

            <p className="text-center text-xs" style={{ color: "var(--foreground-subtle)" }}>
              🔒 Processed locally · Your resume is never stored or sent to the cloud
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
