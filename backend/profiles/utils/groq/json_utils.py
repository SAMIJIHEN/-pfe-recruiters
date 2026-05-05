# profiles/utils/groq/json_utils.py
import json
import re

def clean_ocr_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\xa0", " ").replace("\ufeff", " ")
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def strip_markdown_fences(content: str) -> str:
    content = content.strip()
    content = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
    content = re.sub(r"^```\s*", "", content)
    content = re.sub(r"\s*```$", "", content)
    return content.strip()

def extract_first_json_object(content: str) -> str:
    content = strip_markdown_fences(content)
    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1 and end > start:
        return content[start:end + 1].strip()
    return content.strip()

def try_parse_json(content: str):
    candidate = extract_first_json_object(content)
    try:
        return json.loads(candidate), None
    except Exception:
        pass
    candidate2 = re.sub(r",\s*([}\]])", r"\1", candidate)
    try:
        return json.loads(candidate2), None
    except Exception as e2:
        return None, str(e2)

def normalize_result(data: dict) -> dict:
    if not isinstance(data, dict):
        return {
            "full_name": None, "headline": None, "email": None, "phone": None,
            "location": None, "linkedin_url": None, "github_url": None,
            "languages": [], "skills": [], "education": [], "experience": []
        }
    return {
        "full_name": data.get("full_name"),
        "headline": data.get("headline"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "location": data.get("location"),
        "linkedin_url": data.get("linkedin_url") or data.get("linkedin"),
        "github_url": data.get("github_url") or data.get("github"),
        "languages": data.get("languages") if isinstance(data.get("languages"), list) else [],
        "skills": data.get("skills") if isinstance(data.get("skills"), list) else [],
        "education": data.get("education") if isinstance(data.get("education"), list) else [],
        "experience": data.get("experience") if isinstance(data.get("experience"), list) else [],
    }