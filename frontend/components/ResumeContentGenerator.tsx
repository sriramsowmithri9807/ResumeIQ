/**
 * ResumeContentGenerator — displays tailored, copy-pasteable resume content
 * with per-section and global copy buttons.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, FileText, Briefcase, Wrench, Mail,
  ChevronDown, ChevronUp, Sparkles, Download,
} from "lucide-react";
import { ResumeContentSnippets } from "@/services/api";

interface Props {
  content: ResumeContentSnippets;
}

// ── Copy button with animated feedback ──────────────────────────────────────

function CopyButton({
  text,
  label = "Copy",
  size = "sm",
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isSmall = size === "sm";

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer flex-shrink-0"
      style={{
        padding: isSmall ? "5px 10px" : "8px 16px",
        fontSize: isSmall ? "0.72rem" : "0.82rem",
        background: copied
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(124, 58, 237, 0.12)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(124,58,237,0.3)"}`,
        color: copied ? "var(--success)" : "var(--accent-light)",
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(124,58,237,0.2)";
          e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(124,58,237,0.12)";
          e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
        }
      }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <Check size={isSmall ? 11 : 13} />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <Copy size={isSmall ? 11 : 13} />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function ContentSection({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  copyText,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  copyText: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-5 py-4 cursor-pointer"
        style={{ background: "transparent" }}
        onClick={() => setOpen((v) => !v)}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}30` }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--foreground-subtle)" }}>
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div onClick={(e) => e.stopPropagation()}>
            <CopyButton text={copyText} label="Copy" size="sm" />
          </div>
          {open ? (
            <ChevronUp size={15} style={{ color: "var(--foreground-subtle)" }} />
          ) : (
            <ChevronDown size={15} style={{ color: "var(--foreground-subtle)" }} />
          )}
        </div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-5 pb-5"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="pt-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Code-block-style text display ─────────────────────────────────────────────

function TextBlock({ text }: { text: string }) {
  return (
    <p
      className="text-sm leading-relaxed"
      style={{
        color: "var(--foreground)",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "14px 16px",
        fontFamily: "'Inter', sans-serif",
        lineHeight: "1.75",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {text}
    </p>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ResumeContentGenerator({ content }: Props) {
  // Build the full copy-all text
  const fullText = `PROFESSIONAL SUMMARY
${content.tailored_summary}

EXPERIENCE BULLET POINTS TO ADD
${content.experience_bullets.map((b) => `• ${b}`).join("\n")}

SKILLS TO ADD
${content.skills_to_add.join(", ")}

COVER LETTER INTRODUCTION
${content.cover_letter_intro}`;

  const bulletsText = content.experience_bullets
    .map((b) => `• ${b}`)
    .join("\n");

  const skillsText = content.skills_to_add.join(", ");

  return (
    <div className="space-y-3">
      {/* Header row with copy-all button */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--foreground-subtle)" }}>
            TAILORED TO THIS JD
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--foreground-subtle)" }}>
            Click any section to expand · Use the copy buttons to paste into your resume
          </p>
        </div>
        <CopyButton text={fullText} label="Copy All" size="md" />
      </div>

      {/* 1. Professional Summary */}
      <ContentSection
        icon={FileText}
        iconColor="#a78bfa"
        title="Professional Summary"
        subtitle="Paste this at the top of your resume — tailored to this role"
        copyText={content.tailored_summary}
        defaultOpen={true}
      >
        <TextBlock text={content.tailored_summary} />
        <p className="text-xs mt-3" style={{ color: "var(--foreground-subtle)" }}>
          💡 Replace or enhance your current summary with this text. It mirrors the JD language that ATS systems scan for.
        </p>
      </ContentSection>

      {/* 2. Experience Bullets */}
      <ContentSection
        icon={Briefcase}
        iconColor="#34d399"
        title="Experience Bullet Points"
        subtitle="Add these to your experience section — each uses keywords from this JD"
        copyText={bulletsText}
        defaultOpen={true}
      >
        <div className="space-y-2">
          {content.experience_bullets.map((bullet, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className="flex-1 text-sm leading-relaxed px-4 py-3 rounded-xl"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  lineHeight: "1.65",
                }}
              >
                <span style={{ color: "var(--success)", fontWeight: 600 }}>•</span>{" "}
                {bullet}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-1">
                <CopyButton text={`• ${bullet}`} label="Copy" size="sm" />
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--foreground-subtle)" }}>
          💡 Adapt these bullets to match your actual experience. The structure and keywords are optimised for ATS parsing.
        </p>
      </ContentSection>

      {/* 3. Skills to Add */}
      <ContentSection
        icon={Wrench}
        iconColor="#60a5fa"
        title="Skills to Add"
        subtitle="Add these to your skills section — they appear in this JD"
        copyText={skillsText}
        defaultOpen={false}
      >
        <div className="flex flex-wrap gap-2 mb-3">
          {content.skills_to_add.map((skill, i) => (
            <motion.button
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigator.clipboard.writeText(skill)}
              className="text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-all duration-150"
              style={{
                background: "rgba(96, 165, 250, 0.12)",
                border: "1px solid rgba(96, 165, 250, 0.3)",
                color: "#60a5fa",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(96,165,250,0.22)";
                e.currentTarget.style.borderColor = "rgba(96,165,250,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(96,165,250,0.12)";
                e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)";
              }}
              title="Click to copy this skill"
            >
              + {skill}
            </motion.button>
          ))}
        </div>
        <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
          💡 Click any skill chip to copy it individually, or use "Copy" above to get the full list.
        </p>
      </ContentSection>

      {/* 4. Cover Letter Intro */}
      <ContentSection
        icon={Mail}
        iconColor="#fb923c"
        title="Cover Letter Introduction"
        subtitle="A personalised opening paragraph for your cover letter"
        copyText={content.cover_letter_intro}
        defaultOpen={false}
      >
        <TextBlock text={content.cover_letter_intro} />
        <p className="text-xs mt-3" style={{ color: "var(--foreground-subtle)" }}>
          💡 Use this as the opening paragraph of your cover letter. Edit the company name and personalise as needed.
        </p>
      </ContentSection>
    </div>
  );
}
