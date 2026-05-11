"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import {
  Zap, Target, TrendingUp, Shield, ArrowRight,
  BarChart2, Sparkles, CheckCircle2, Upload,
} from "lucide-react";

// ── Feature cards data ──────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Target,
    title: "ATS Score Engine",
    description: "Multi-factor scoring across keywords, skills, experience, projects, and formatting to mirror real ATS systems.",
    color: "#a78bfa",
  },
  {
    icon: Sparkles,
    title: "AI Suggestions",
    description: "Powered by local Llama 3.2 — fully offline AI that rewrites weak bullet points and suggests missing keywords.",
    color: "#34d399",
  },
  {
    icon: BarChart2,
    title: "Visual Dashboard",
    description: "Clean, animated results with score gauges, keyword clouds, and hiring probability — not a wall of text.",
    color: "#60a5fa",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "Your resume never leaves your machine. No cloud AI, no data collection, no API keys required.",
    color: "#fb923c",
  },
];

const STEPS = [
  { num: "01", label: "Upload Resume", desc: "Drag and drop your PDF or DOCX" },
  { num: "02", label: "Paste Job Description", desc: "Copy the full JD from any job board" },
  { num: "03", label: "Get Your Score", desc: "AI analysis in under 10 seconds" },
];

// ── Mock score preview ──────────────────────────────────────────────────────

const MOCK_SCORE = 72;
const MOCK_KEYWORDS_MATCHED = ["React", "TypeScript", "Node.js", "AWS", "CI/CD"];
const MOCK_KEYWORDS_MISSING = ["Docker", "Kubernetes", "GraphQL"];

// ── Animations ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

// ── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background glow */}
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        {/* Grid */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "float 8s ease-in-out infinite 2s",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.4)",
              color: "var(--accent-light)",
            }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={12} />
            Powered by local AI · No API keys needed
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Beat the{" "}
            <span className="gradient-text">ATS.</span>
            <br />
            Land the job.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Upload your resume + paste a job description. Our AI gives you an{" "}
            <strong style={{ color: "var(--foreground)" }}>ATS score</strong>, flags{" "}
            <strong style={{ color: "var(--foreground)" }}>missing keywords</strong>, and
            writes <strong style={{ color: "var(--foreground)" }}>better bullet points</strong> — in seconds.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/analyze">
              <button
                className="btn-glow px-8 py-4 text-base font-semibold text-white flex items-center gap-2 cursor-pointer"
                id="hero-cta-button"
              >
                <Upload size={18} />
                Analyze My Resume
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="#how-it-works">
              <button
                className="px-8 py-4 text-base font-medium rounded-full cursor-pointer transition-all duration-200"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--foreground-muted)",
                  background: "transparent",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                  e.currentTarget.style.color = "var(--foreground)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--foreground-muted)";
                }}
              >
                See how it works ↓
              </button>
            </Link>
          </motion.div>

          {/* Score Preview Card */}
          <motion.div
            className="mt-16 mx-auto max-w-md glass rounded-2xl p-6 text-left"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-subtle)" }}>
                Example Analysis
              </span>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--warning-muted)", color: "var(--warning)" }}>
                Live Preview
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="30" fill="none"
                    stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - MOCK_SCORE / 100)}`}
                    style={{ filter: "drop-shadow(0 0 6px #f59e0b80)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black" style={{ color: "#f59e0b" }}>{MOCK_SCORE}</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-base">Software Engineer @ Stripe</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--foreground-muted)" }}>ATS Score · Good</p>
                <p className="text-xs mt-1" style={{ color: "var(--warning)" }}>↑ 18 pts potential improvement</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: "var(--foreground-subtle)" }}>MATCHED KEYWORDS</p>
              <div className="flex flex-wrap gap-1.5">
                {MOCK_KEYWORDS_MATCHED.map(kw => (
                  <span key={kw} className="keyword-matched text-xs">{kw}</span>
                ))}
              </div>
              <p className="text-xs font-semibold mt-3" style={{ color: "var(--foreground-subtle)" }}>MISSING</p>
              <div className="flex flex-wrap gap-1.5">
                {MOCK_KEYWORDS_MISSING.map(kw => (
                  <span key={kw} className="keyword-missing text-xs">{kw}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Everything you need to{" "}
              <span className="gradient-text">get hired</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--foreground-muted)" }}>
              Not just a score. A full roadmap to improve your resume for the exact role.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="glass p-6 rounded-2xl group cursor-default"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}30` }}
                  >
                    <Icon size={22} style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Three steps to a{" "}
              <span className="gradient-text">better resume</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex items-center gap-6 glass p-6 rounded-2xl"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                custom={i}
                viewport={{ once: true }}
              >
                <span
                  className="text-4xl font-black flex-shrink-0 gradient-text"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {step.num}
                </span>
                <div>
                  <h3 className="font-bold text-lg">{step.label}</h3>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>{step.desc}</p>
                </div>
                <CheckCircle2
                  size={22}
                  className="ml-auto flex-shrink-0"
                  style={{ color: "var(--accent-light)" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center glass p-12 rounded-3xl relative overflow-hidden"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "var(--gradient-hero)", opacity: 0.5 }}
          />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
              Ready to <span className="gradient-text">rizz up</span> your resume?
            </h2>
            <p className="mb-8" style={{ color: "var(--foreground-muted)" }}>
              Free. Private. No signup required. Results in seconds.
            </p>
            <Link href="/analyze">
              <button className="btn-glow px-10 py-4 text-base font-semibold text-white flex items-center gap-2 mx-auto cursor-pointer" id="bottom-cta-button">
                <Zap size={18} />
                Get My ATS Score
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>
          ResumeIQ · AI runs locally via Ollama · Your data never leaves your machine
        </p>
      </footer>
    </div>
  );
}
