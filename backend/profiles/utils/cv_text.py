# profiles/utils/cv_text.py
import os
import re


def clean_extracted_text(s: str) -> str:
    if not s:
        return ""

    s = s.replace("\u00a0", " ")  # espaces insécables

    # Remplacer "A m i n e" -> "Amine" (lettres séparées par espaces)
    s = re.sub(
        r"(?:(?<=\b)[A-Za-zÀ-ÿ]\s)+(?:[A-Za-zÀ-ÿ])",
        lambda m: m.group(0).replace(" ", ""),
        s,
    )

    # Réduire espaces multiples
    s = re.sub(r"[ \t]{2,}", " ", s)

    # Nettoyer trop de lignes vides
    s = re.sub(r"\n{3,}", "\n\n", s)

    return s.strip()


def extract_text_from_pdf(path: str) -> str:
    """PDF texte (copiable) via pypdf."""
    try:
        from pypdf import PdfReader
    except Exception:
        return ""

    chunks = []
    try:
        reader = PdfReader(path)
        for page in reader.pages:
            t = page.extract_text() or ""
            if t.strip():
                chunks.append(t)
    except Exception:
        return ""

    return clean_extracted_text("\n".join(chunks))


def extract_text_from_docx(path: str) -> str:
    try:
        from docx import Document
    except Exception:
        return ""

    try:
        doc = Document(path)
        text = "\n".join([p.text for p in doc.paragraphs]).strip()
        return clean_extracted_text(text)
    except Exception:
        return ""


def extract_text_from_txt(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return clean_extracted_text(f.read())
    except Exception:
        return ""


def _tesseract_cmd_if_needed():
    """
    Optionnel: si pytesseract ne trouve pas tesseract sur Windows,
    décommente et adapte le chemin.
    """
    # import pytesseract
    # pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    pass


def extract_text_from_image(path: str, lang: str = "fra") -> str:
    try:
        import pytesseract
        from PIL import Image
    except Exception:
        return ""

    try:
        _tesseract_cmd_if_needed()
        img = Image.open(path)
        text = pytesseract.image_to_string(img, lang=lang).strip()
        return clean_extracted_text(text)
    except Exception:
        return ""


def extract_text_from_scanned_pdf(path: str, lang: str = "fra") -> str:
    """
    OCR d'un PDF scanné:
    - nécessite: pdf2image + poppler installé.
    - si non dispo, retourne "".
    """
    try:
        from pdf2image import convert_from_path
        import pytesseract
    except Exception:
        return ""

    try:
        _tesseract_cmd_if_needed()

        pages = convert_from_path(path, dpi=300)

        chunks = []
        for img in pages:
            chunks.append(pytesseract.image_to_string(img, lang=lang))

        return clean_extracted_text("\n".join(chunks))
    except Exception:
        return ""


def extract_cv_text(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()

    # PDF
    if ext == ".pdf":
        # 1) extraction texte classique
        text = extract_text_from_pdf(path)
        if len(text) > 30:
            return text

        # 2) fallback OCR si PDF scanné
        return extract_text_from_scanned_pdf(path, lang="fra") or ""

    # DOCX
    if ext == ".docx":
        return extract_text_from_docx(path)

    # TXT
    if ext == ".txt":
        return extract_text_from_txt(path)

    # Images
    if ext in [".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp"]:
        return extract_text_from_image(path, lang="fra")

    return ""