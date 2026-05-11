/**
 * SuggestionCard — displays a single AI improvement suggestion
 */
"use client";

import { Lightbulb, Zap, AlertCircle, ChevronRight } from "lucide-react";

interface SuggestionCardProps {
  category: string;
  suggestion: string;
  priority: "High" | "Medium" | "Low";
  index: number;
}

const priorityConfig = {
  High: {
    color: "var(--danger)",
    bg: "var(--danger-muted)",
    border: "rgba(239, 68, 68, 0.25)",
    icon: AlertCircle,
    label: "High Priority",
  },
  Medium: {
    color: "var(--warning)",
    bg: "var(--warning-muted)",
    border: "rgba(245, 158, 11, 0.25)",
    icon: Zap,
    label: "Medium Priority",
  },
  Low: {
    color: "var(--info)",
    bg: "rgba(56, 189, 248, 0.1)",
    border: "rgba(56, 189, 248, 0.25)",
    icon: Lightbulb,
    label: "Low Priority",
  },
};

const categoryColors: Record<string, string> = {
  Keywords: "#a78bfa",
  "Bullet Points": "#34d399",
  Skills: "#60a5fa",
  Experience: "#fb923c",
  Projects: "#f472b6",
  Formatting: "#94a3b8",
  General: "#a78bfa",
};

export function SuggestionCard({ category, suggestion, priority, index }: SuggestionCardProps) {
  const config = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = config.icon;
  const categoryColor = categoryColors[category] || "#a78bfa";

  return (
    <div
      className="group p-4 rounded-xl transition-all duration-200 cursor-default"
      style={{
        background: "var(--surface)",
        border: `1px solid ${config.border}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = config.color + "60";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = config.border;
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
          style={{ background: config.bg, color: config.color }}
        >
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Category badge */}
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${categoryColor}18`,
                color: categoryColor,
                border: `1px solid ${categoryColor}30`,
              }}
            >
              {category}
            </span>
            {/* Priority */}
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: config.color }}>
              <Icon size={11} />
              {config.label}
            </span>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            {suggestion}
          </p>
        </div>

        <ChevronRight
          size={16}
          className="flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-1"
          style={{ color: "var(--foreground-subtle)" }}
        />
      </div>
    </div>
  );
}
