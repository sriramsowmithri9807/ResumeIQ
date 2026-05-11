/**
 * UploadZone — drag-and-drop file uploader for resumes (PDF/DOCX)
 */
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function UploadZone({ onFileSelect, selectedFile, onClear }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        setError("Please upload a PDF or DOCX file only (max 5MB).");
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  if (selectedFile) {
    return (
      <div
        className="relative rounded-2xl p-6 flex items-center gap-4"
        style={{
          background: "var(--success-muted)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
        }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(34, 197, 94, 0.2)" }}>
          <FileText size={22} style={{ color: "var(--success)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: "var(--success)" }}>
            {selectedFile.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
            {(selectedFile.size / 1024).toFixed(0)} KB · Ready to analyze
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: "var(--foreground-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--foreground-muted)")}
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`drop-zone cursor-pointer p-10 flex flex-col items-center justify-center gap-4 text-center transition-all duration-300 ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} id="resume-upload" />

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300"
          style={{
            background: isDragActive
              ? "rgba(124, 58, 237, 0.2)"
              : "rgba(124, 58, 237, 0.08)",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            transform: isDragActive ? "scale(1.1)" : "scale(1)",
          }}
        >
          <Upload
            size={28}
            style={{
              color: "var(--accent-light)",
              transform: isDragActive ? "translateY(-3px)" : "translateY(0)",
              transition: "transform 0.3s ease",
            }}
          />
        </div>

        {/* Text */}
        <div>
          <p className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
            {isDragActive ? "Drop it! 🎯" : "Drop your resume here"}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
            or{" "}
            <span className="font-medium" style={{ color: "var(--accent-light)" }}>
              click to browse
            </span>
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--foreground-subtle)" }}>
            PDF or DOCX · Max 5MB
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-center px-2" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
