from fastapi import APIRouter
from pydantic import BaseModel

from app.scanner.rules import scan_code
from app.scanner.ai_analyzer import get_ai_suggestions

router = APIRouter(prefix="/scan", tags=["Scanner"])


class ScanRequest(BaseModel):
    source_code: str
    filename: str = "untitled.py"
    use_ai: bool = False


class ScanResponse(BaseModel):
    filename: str
    total_vulnerabilities: int
    vulnerabilities: list[dict]
    ai_suggestions: str | None = None


@router.post("/analyze", response_model=ScanResponse)
def analyze_code(request: ScanRequest):
    results = scan_code(request.source_code)

    ai_suggestions = None
    if request.use_ai and results:
        ai_suggestions = get_ai_suggestions(request.source_code, results)

    return {
        "filename": request.filename,
        "total_vulnerabilities": len(results),
        "vulnerabilities": results,
        "ai_suggestions": ai_suggestions,
    }