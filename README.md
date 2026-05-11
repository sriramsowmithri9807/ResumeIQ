# ResumeIQ 🚀

> **AI-Powered ATS Resume Analyzer** — fully local, privacy-focused, and tailored for modern recruitment.

ResumeIQ helps you beat the ATS (Applicant Tracking System) by analyzing your resume against any job description. It provides a detailed score breakdown, identifies missing keywords, and uses **local AI** to generate tailored, copy-pasteable content to optimize your application.

---

## ✨ Features

- **🎯 Precision ATS Scoring**: Real-time scoring based on keyword matching, skills relevance, experience, and formatting.
- **📝 Resume Content Generator**: Automatically generates tailored **Professional Summaries**, **Experience Bullets**, and **Cover Letter** intros based on the job description.
- **🔍 Deep Keyword Analysis**: Identifies exactly which keywords you have matched and which ones are missing from your profile.
- **💡 AI Improvement Suggestions**: Actionable advice on how to improve your resume's impact and hiring probability.
- **🛡️ 100% Privacy-First**: All AI processing happens **locally** on your machine via Ollama. Your data never leaves your computer.
- **💎 Premium Dashboard**: A stunning, futuristic UI built with Next.js, Framer Motion, and Glassmorphism.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion |
| **Backend** | FastAPI (Python 3.11+) |
| **AI / LLM** | Ollama (llama3.2) — Running locally |
| **NLP** | sentence-transformers + custom keyword engine |
| **File Parsing** | PyMuPDF (PDF) + python-docx (DOCX) |

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- **Ollama** installed → [ollama.com](https://ollama.com)

### 2. Install Ollama & Pull the Model
```bash
# Pull the llama3.2 model (required for AI features)
ollama pull llama3.2

# Ensure Ollama is serving
ollama serve
```

### 3. Setup the Backend (FastAPI)
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```
*API docs will be available at `http://localhost:8000/docs`*

### 4. Setup the Frontend (Next.js)
```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```
*App will be available at `http://localhost:3000`*

---

## 📂 Project Structure

```
ResumeIQ/
├── frontend/                  # Next.js 15 application
│   ├── app/                   # App router (Landing, Analyze, Results)
│   ├── components/            # Reusable UI components
│   └── services/api.ts        # Typed API client
└── backend/                   # FastAPI application
    ├── ai_engine/             # Pipeline orchestration
    ├── api/routes/            # API endpoints
    ├── services/              # Scoring & AI generation logic
    ├── parsers/               # PDF & DOCX extraction
    └── utils/                 # NLP & text utilities
```

---

## 🛡️ Privacy Notice
ResumeIQ is designed with privacy as its core principle. Unlike other AI resume tools, it does not send your personal data to OpenAI, Google, or any third-party cloud. All analysis and text generation happen locally on your hardware.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📜 License
MIT License - Created with ❤️ for job seekers.
