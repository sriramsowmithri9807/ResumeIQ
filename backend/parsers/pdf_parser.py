"""
PDF text extraction using PyMuPDF (fitz).
Handles multi-page PDFs and extracts clean text.
"""
import fitz  # PyMuPDF
import re


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text from a PDF file given as bytes.
    Returns cleaned, concatenated text from all pages.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_text = []

        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            # Extract text with block layout for better structure
            text = page.get_text("text")
            if text.strip():
                pages_text.append(text)

        doc.close()
        raw_text = "\n".join(pages_text)
        return clean_text(raw_text)

    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def clean_text(text: str) -> str:
    """Remove excessive whitespace while preserving structure."""
    # Replace multiple blank lines with a single one
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Remove trailing whitespace on each line
    lines = [line.rstrip() for line in text.split('\n')]
    return '\n'.join(lines).strip()
