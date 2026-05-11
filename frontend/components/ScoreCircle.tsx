/**
 * Animated SVG score circle — shows ATS score with a ring gauge.
 */
"use client";

import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 55) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 45) return "Fair";
  return "Needs Work";
}

export function ScoreCircle({ score, size = 200, label = "ATS Score" }: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const color = getScoreColor(score);

  // Animate score on mount
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="score-ring"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={12}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              transition: "stroke-dashoffset 0.05s ease",
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            className="font-black text-4xl tabular-nums"
            style={{ color, fontFamily: "'Syne', sans-serif" }}
          >
            {animatedScore}
          </span>
          <span className="text-xs font-medium mt-0.5" style={{ color: "var(--foreground-muted)" }}>
            out of 100
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: "var(--foreground-muted)" }}>{label}</p>
        <p className="text-sm font-bold mt-0.5" style={{ color }}>{getScoreLabel(score)}</p>
      </div>
    </div>
  );
}
