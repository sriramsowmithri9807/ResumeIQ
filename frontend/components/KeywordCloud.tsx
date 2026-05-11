/**
 * Keyword Cloud — displays matched and missing keywords as color-coded chips
 */
"use client";

import { motion } from "framer-motion";

interface KeywordCloudProps {
  matched: string[];
  missing: string[];
}

export function KeywordCloud({ matched, missing }: KeywordCloudProps) {
  return (
    <div className="space-y-6">
      {/* Matched keywords */}
      {matched.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
            <h4 className="text-sm font-semibold" style={{ color: "var(--foreground-muted)" }}>
              Matched Keywords
              <span className="ml-2 font-normal" style={{ color: "var(--foreground-subtle)" }}>
                ({matched.length})
              </span>
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {matched.map((kw, i) => (
              <motion.span
                key={kw}
                className="keyword-matched cursor-default"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                ✓ {kw}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Missing keywords */}
      {missing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--danger)" }} />
            <h4 className="text-sm font-semibold" style={{ color: "var(--foreground-muted)" }}>
              Missing Keywords
              <span className="ml-2 font-normal" style={{ color: "var(--foreground-subtle)" }}>
                ({missing.length})
              </span>
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {missing.map((kw, i) => (
              <motion.span
                key={kw}
                className="keyword-missing cursor-default"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 + 0.1, duration: 0.2 }}
              >
                + {kw}
              </motion.span>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--foreground-subtle)" }}>
            💡 Adding these keywords naturally into your resume will improve your ATS score.
          </p>
        </div>
      )}
    </div>
  );
}
