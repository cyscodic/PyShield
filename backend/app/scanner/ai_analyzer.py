import google.generativeai as genai

from app.core.config import settings
from app.scanner.local_fixes import get_local_suggestions


def get_ai_suggestions(source_code: str, vulnerabilities: list[dict]) -> str:
    """
    Get remediation suggestions for detected vulnerabilities.
    Strategy: Try Gemini AI first → fall back to local fix engine.
    """

    # If no API key configured, use local engine directly
    if not settings.GEMINI_API_KEY:
        return get_local_suggestions(vulnerabilities)

    # Try Gemini AI
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        vuln_summary = "\n".join(
            f"- Line {v['line']}: [{v['severity']}] {v['title']}: {v['description']}"
            for v in vulnerabilities
        )

        prompt = (
            "You are a senior security engineer. Analyze the following Python code "
            "and the vulnerabilities detected by our AST scanner.\n\n"
            "For each vulnerability:\n"
            "1. Explain WHY it is dangerous in simple terms\n"
            "2. Provide a FIXED version of the code\n"
            "3. Rate your confidence (High/Medium/Low)\n\n"
            "SOURCE CODE:\n"
            f"{source_code}\n\n"
            "DETECTED VULNERABILITIES:\n"
            f"{vuln_summary}\n\n"
            "Respond in a clear, structured format. Be concise but thorough."
        )

        response = model.generate_content(prompt)
        return response.text

    except Exception:
        # Any error (rate limit, invalid key, network) → use local engine
        return get_local_suggestions(vulnerabilities)