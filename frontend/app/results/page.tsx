"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ScoreCircle } from "@/components/ScoreCircle";
import { KeywordCloud } from "@/components/KeywordCloud";
import { SuggestionCard } from "@/components/SuggestionCard";
import { ResumeContentGenerator } from "@/components/ResumeContentGenerator";
import { AnalysisResult } from "@/services/api";
import {
  TrendingUp, AlertTriangle, Star, ChevronDown, ArrowLeft,
  Target, Sparkles, Shield, BarChart2, RefreshCw, FileText,
} from "lucide-react";

// ── Animated section wrapper ────────────────────────────────────────────────

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Section card wrapper ────────────────────────────────────────────────────

function Card({ title, icon: Icon, iconColor = "var(--accent-light)", children }: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}30` }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <h2 className="font-bold text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Hiring probability badge ────────────────────────────────────────────────

function HiringBadge({ probability }: { probability: string }) {
  const config = {
    High: { color: "var(--success)", bg: "var(--success-muted)", border: "rgba(34,197,94,0.3)", emoji: "🎯" },
    Medium: { color: "var(--warning)", bg: "var(--warning-muted)", border: "rgba(245,158,11,0.3)", emoji: "📈" },
    Low: { color: "var(--danger)", bg: "var(--danger-muted)", border: "rgba(239,68,68,0.3)", emoji: "⚠️" },
  }[probability] || { color: "var(--accent-light)", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.3)", emoji: "📊" };

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
      style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
    >
      <span>{config.emoji}</span>
      {probability} Hiring Probability
    </div>
  );
}

// ── Animated progress bar ───────────────────────────────────────────────────

function AnimatedBar({ value, color = "var(--accent)" }: { value: number; color?: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: color,
          transition: "width 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedWeak, setExpandedWeak] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (!stored) {
      router.push("/analyze");
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      router.push("/analyze");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)" }} />
      </div>
    );
  }

  const { score_breakdown: sb } = result;

  const scoreRows = [
    { label: "Keyword Match", value: sb.keyword_match, weight: "50%", color: "#a78bfa" },
    { label: "Skills Match", value: sb.skills_match, weight: "20%", color: "#60a5fa" },
    { label: "Experience Relevance", value: sb.experience_relevance, weight: "15%", color: "#34d399" },
    { label: "Projects Relevance", value: sb.projects_relevance, weight: "10%", color: "#fb923c" },
    { label: "Formatting", value: sb.formatting_score, weight: "5%", color: "#f472b6" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Back + header */}
          <Section delay={0}>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/analyze">
                <button
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                  style={{ color: "var(--foreground-muted)", border: "1px solid var(--border)", background: "transparent" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--foreground)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--foreground-muted)"}
                >
                  <ArrowLeft size={14} />
                  Analyze again
                </button>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
              Your <span className="gradient-text">ATS Report</span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <HiringBadge probability={result.hiring_probability} />
              <span className="text-sm" style={{ color: "var(--foreground-subtle)" }}>
                Match: {result.match_percentage.toFixed(0)}%
              </span>
            </div>
          </Section>

          {/* Top row: Score + Breakdown */}
          <div className="grid md:grid-cols-5 gap-5">
            {/* Score circle */}
            <Section delay={0.05}>
              <div
                className="md:col-span-2 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 pulse-glow"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  gridColumn: "span 2",
                }}
              >
                <ScoreCircle score={result.ats_score} size={180} label="ATS Score" />
              </div>
            </Section>

            {/* Score breakdown */}
            <Section delay={0.1}>
              <div
                className="md:col-span-3 rounded-2xl p-6"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  gridColumn: "span 3",
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={16} style={{ color: "#a78bfa" }} />
                  <h2 className="font-bold text-base">Score Breakdown</h2>
                </div>
                <div className="space-y-4">
                  {scoreRows.map(row => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
                          {row.label}
                          <span className="ml-1.5 text-xs" style={{ color: "var(--foreground-subtle)" }}>
                            ({row.weight})
                          </span>
                        </span>
                        <span className="text-sm font-bold" style={{ color: row.color }}>
                          {row.value.toFixed(0)}
                        </span>
                      </div>
                      <AnimatedBar value={row.value} color={row.color} />
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>

          {/* Keywords */}
          <Section delay={0.15}>
            <Card title="Keyword Analysis" icon={Target} iconColor="#a78bfa">
              <KeywordCloud
                matched={result.keyword_analysis.matched_keywords}
                missing={result.keyword_analysis.missing_keywords}
              />
            </Card>
          </Section>

          {/* AI Suggestions */}
          <Section delay={0.2}>
            <Card title="AI Improvement Suggestions" icon={Sparkles} iconColor="#34d399">
              <div className="space-y-3">
                {result.ai_suggestions.length > 0 ? (
                  result.ai_suggestions.map((s, i) => (
                    <SuggestionCard
                      key={i}
                      category={s.category}
                      suggestion={s.suggestion}
                      priority={s.priority as "High" | "Medium" | "Low"}
                      index={i}
                    />
                  ))
                ) : (
                  <p style={{ color: "var(--foreground-muted)" }}>No suggestions available.</p>
                )}
              </div>
            </Card>
          </Section>

          {/* Copy-pasteable Content Snippets */}
          {result.resume_content && (
            <Section delay={0.22}>
              <Card title="Resume Content Generator" icon={FileText} iconColor="#60a5fa">
                <ResumeContentGenerator content={result.resume_content} />
              </Card>
            </Section>
          )}

          {/* Weak Sections + Strengths side by side */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Weak sections */}
            <Section delay={0.25}>
              <Card title="Weak Sections" icon={AlertTriangle} iconColor="var(--warning)">
                {result.weak_sections.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--success)" }}>
                    🎉 No critical weak sections found!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.weak_sections.map((ws, i) => (
                      <div key={i}>
                        <button
                          className="w-full flex items-center justify-between p-3 rounded-xl text-left cursor-pointer transition-all duration-150"
                          style={{
                            background: expandedWeak === i ? "var(--warning-muted)" : "var(--surface-2)",
                            border: `1px solid ${expandedWeak === i ? "rgba(245,158,11,0.3)" : "var(--border)"}`,
                          }}
                          onClick={() => setExpandedWeak(expandedWeak === i ? null : i)}
                        >
                          <span className="text-sm font-medium">{ws.section}</span>
                          <ChevronDown
                            size={15}
                            style={{
                              color: "var(--foreground-muted)",
                              transform: expandedWeak === i ? "rotate(180deg)" : "rotate(0)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </button>
                        {expandedWeak === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="px-3 py-3 space-y-2"
                          >
                            <p className="text-xs" style={{ color: "var(--warning)" }}>
                              ⚠ {ws.reason}
                            </p>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                              💡 {ws.suggestion}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Section>

            {/* Strengths */}
            <Section delay={0.3}>
              <Card title="Resume Strengths" icon={Star} iconColor="var(--success)">
                {result.strengths.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
                    Analysis complete. Focus on improving the weak sections above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: "var(--success-muted)", border: "1px solid rgba(34,197,94,0.2)" }}
                      >
                        <Star size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>{s.area}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                            {s.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Section>
          </div>

          {/* Analyze again CTA */}
          <Section delay={0.35}>
            <div className="flex justify-center pt-2">
              <Link href="/analyze">
                <button
                  className="btn-glow px-8 py-3.5 text-sm font-semibold text-white flex items-center gap-2 cursor-pointer"
                  id="analyze-again-button"
                >
                  <RefreshCw size={16} />
                  Analyze Another Resume
                </button>
              </Link>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
