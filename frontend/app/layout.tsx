import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeIQ — AI-Powered ATS Resume Analyzer",
  description:
    "Beat the ATS. Upload your resume and job description to get your ATS score, missing keywords, and AI-powered suggestions to land more interviews.",
  keywords: ["ATS", "resume analyzer", "AI resume", "job application", "resume score"],
  openGraph: {
    title: "ResumeIQ — Beat the ATS",
    description: "AI-powered resume analysis. Get your ATS score in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${syne.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
