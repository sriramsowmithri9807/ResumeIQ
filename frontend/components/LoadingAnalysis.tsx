/**
 * LoadingAnalysis — animated step-by-step progress loader during analysis
 */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Brain, BarChart2, Sparkles, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: FileText, label: "Extracting resume text", duration: 1500 },
  { icon: Brain, label: "Analyzing with NLP", duration: 2000 },
  { icon: BarChart2, label: "Computing ATS score", duration: 1800 },
  { icon: Sparkles, label: "Generating AI suggestions", duration: 2500 },
];

export function LoadingAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let step = 0;

    const advance = () => {
      if (step >= STEPS.length) return;
      const delay = STEPS[step].duration;

      setTimeout(() => {
        setCompletedSteps(prev => [...prev, step]);
        step++;
        setCurrentStep(step);
        advance();
      }, delay);
    };

    advance();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
      {/* Spinning rings */}
      <div className="relative w-28 h-28">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid transparent",
            borderTopColor: "var(--accent)",
            borderRightColor: "var(--accent-light)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            border: "2px solid transparent",
            borderBottomColor: "#06b6d4",
            borderLeftColor: "#7c3aed",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles size={28} style={{ color: "var(--accent-light)" }} />
          </motion.div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          Analyzing your resume
        </h3>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Our AI is reading every line...
        </p>
      </div>

      {/* Step list */}
      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(i);
          const isActive = currentStep === i;

          return (
            <motion.div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: isActive
                  ? "rgba(124, 58, 237, 0.1)"
                  : isCompleted
                  ? "rgba(34, 197, 94, 0.06)"
                  : "var(--surface)",
                border: `1px solid ${
                  isActive
                    ? "rgba(124, 58, 237, 0.4)"
                    : isCompleted
                    ? "rgba(34, 197, 94, 0.2)"
                    : "var(--border)"
                }`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isCompleted
                    ? "rgba(34, 197, 94, 0.15)"
                    : isActive
                    ? "rgba(124, 58, 237, 0.2)"
                    : "var(--surface-2)",
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                ) : (
                  <Icon
                    size={16}
                    style={{
                      color: isActive ? "var(--accent-light)" : "var(--foreground-subtle)",
                    }}
                  />
                )}
              </div>

              <span
                className="text-sm font-medium"
                style={{
                  color: isCompleted
                    ? "var(--success)"
                    : isActive
                    ? "var(--foreground)"
                    : "var(--foreground-subtle)",
                }}
              >
                {step.label}
              </span>

              {isActive && (
                <motion.div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}

              {isCompleted && (
                <span className="ml-auto text-xs font-medium" style={{ color: "var(--success)" }}>
                  Done
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
