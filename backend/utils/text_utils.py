"""
Text utilities: cleaning, tokenization, section detection.
"""
import re
import string
from typing import List, Dict, Optional

# Common resume section headers to detect structure
SECTION_HEADERS = {
    "experience": ["experience", "work experience", "employment", "work history", "professional experience"],
    "education": ["education", "academic background", "qualifications", "academic qualifications"],
    "skills": ["skills", "technical skills", "core competencies", "technologies", "tools", "expertise"],
    "projects": ["projects", "personal projects", "portfolio", "side projects", "notable projects"],
    "summary": ["summary", "profile", "objective", "about me", "professional summary", "career objective"],
    "certifications": ["certifications", "certificates", "licenses", "credentials"],
    "achievements": ["achievements", "accomplishments", "awards", "honors"],
}

# Large tech/skill ontology for matching
TECH_SKILLS = {
    "languages": ["python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "kotlin", "swift",
                  "ruby", "php", "scala", "r", "matlab", "bash", "sql", "html", "css"],
    "frameworks": ["react", "next.js", "vue", "angular", "node.js", "express", "django", "flask", "fastapi",
                   "spring", "laravel", "rails", "tensorflow", "pytorch", "keras", "pandas", "numpy", "scikit-learn"],
    "cloud": ["aws", "gcp", "azure", "ec2", "s3", "lambda", "cloud functions", "kubernetes", "docker",
              "terraform", "ansible", "jenkins", "github actions", "ci/cd", "devops"],
    "databases": ["postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "oracle",
                  "dynamodb", "cassandra", "firebase"],
    "tools": ["git", "github", "gitlab", "jira", "confluence", "figma", "postman", "swagger",
              "linux", "unix", "vim", "vs code"],
}


def clean_text(text: str) -> str:
    """Normalize text for NLP processing."""
    text = text.lower()
    # Remove URLs
    text = re.sub(r'http[s]?://\S+', '', text)
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    # Remove phone numbers
    text = re.sub(r'[\+\d][\d\s\-\(\)]{7,}', '', text)
    # Remove special chars but keep spaces and hyphens
    text = re.sub(r'[^\w\s\-\.]', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_keywords(text: str, top_n: int = 50) -> List[str]:
    """
    Extract important keywords from text using frequency + stopword removal.
    Returns top N keywords by frequency.
    """
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
        "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "need", "dare", "ought", "used",
        "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us",
        "my", "your", "his", "its", "our", "their", "this", "that", "these", "those",
        "what", "which", "who", "whom", "when", "where", "why", "how",
        "not", "no", "nor", "so", "yet", "both", "either", "neither", "each",
        "more", "most", "other", "some", "such", "than", "too", "very",
        "also", "just", "because", "while", "about", "against", "between",
        "into", "through", "during", "before", "after", "above", "below",
        "up", "down", "out", "off", "over", "under", "again", "further",
        "then", "once", "here", "there", "all", "any", "few", "several",
        "own", "same", "s", "t", "ll", "re", "ve", "d", "m"
    }

    cleaned = clean_text(text)
    words = cleaned.split()

    # Count frequencies of meaningful words (len > 2, not stopwords)
    freq: Dict[str, int] = {}
    for word in words:
        word = word.strip(string.punctuation)
        if len(word) > 2 and word not in stop_words:
            freq[word] = freq.get(word, 0) + 1

    # Sort by frequency
    sorted_keywords = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [kw for kw, _ in sorted_keywords[:top_n]]


def detect_sections(text: str) -> Dict[str, Optional[str]]:
    """
    Detect resume sections by looking for known header patterns.
    Returns a dict mapping section name → section content (or None if not found).
    """
    lines = text.split('\n')
    sections: Dict[str, Optional[str]] = {k: None for k in SECTION_HEADERS}
    current_section: Optional[str] = None
    current_content: List[str] = []

    for line in lines:
        line_lower = line.lower().strip()
        found_section = False

        for section, headers in SECTION_HEADERS.items():
            if any(line_lower == h or line_lower.startswith(h + ":") for h in headers):
                # Save previous section
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = section
                current_content = []
                found_section = True
                break

        if not found_section and current_section:
            current_content.append(line)

    # Save last section
    if current_section and current_content:
        sections[current_section] = '\n'.join(current_content)

    return sections


def detect_formatting_quality(text: str) -> float:
    """
    Score formatting quality from 0.0 to 1.0 based on heuristics.
    Checks: section headers, bullet points, consistent structure, length.
    """
    score = 0.0
    lines = text.split('\n')
    non_empty = [l for l in lines if l.strip()]

    # Check length (ideal: 300-800 words)
    word_count = len(text.split())
    if 300 <= word_count <= 800:
        score += 0.3
    elif 200 <= word_count <= 1000:
        score += 0.15

    # Check for section headers
    sections_found = detect_sections(text)
    found_count = sum(1 for v in sections_found.values() if v is not None)
    score += min(found_count / 4, 1.0) * 0.3  # Max 0.3 for 4+ sections

    # Check for bullet points
    bullet_lines = [l for l in lines if re.match(r'^\s*[-•·*▪▸]\s', l)]
    if len(bullet_lines) >= 5:
        score += 0.25
    elif len(bullet_lines) >= 2:
        score += 0.1

    # Check for measurable achievements (numbers/percentages)
    has_numbers = bool(re.search(r'\d+%|\$\d+|\d+x|\d+\+', text))
    if has_numbers:
        score += 0.15

    return min(score, 1.0)


def extract_tech_skills(text: str) -> List[str]:
    """Extract recognized technical skills from text."""
    text_lower = text.lower()
    found_skills = []
    for category, skills in TECH_SKILLS.items():
        for skill in skills:
            if skill in text_lower:
                found_skills.append(skill)
    return list(set(found_skills))
