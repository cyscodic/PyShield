"""
Local Fix Engine — Built-in remediation suggestions for every vulnerability type.
Works offline without any API key. Acts as primary or fallback for Gemini AI.
"""


# Maps CWE codes and vulnerability titles to detailed fix suggestions
FIX_DATABASE: dict[str, dict] = {
    "eval": {
        "title": "Use of eval()",
        "risk": "eval() executes any Python expression passed to it. If an attacker controls the input, they can run arbitrary code — stealing data, deleting files, or installing malware.",
        "fix": """# ❌ DANGEROUS — Never do this:
result = eval(user_input)

# ✅ SAFE — Use ast.literal_eval() for data parsing:
import ast
result = ast.literal_eval(user_input)  # Only allows strings, numbers, lists, dicts

# ✅ SAFE — Or use explicit parsing:
if user_input.isdigit():
    result = int(user_input)""",
        "confidence": "High",
    },

    "exec": {
        "title": "Use of exec()",
        "risk": "exec() can run entire blocks of Python code from a string. Combined with user input, this is a full remote code execution (RCE) vulnerability.",
        "fix": """# ❌ DANGEROUS:
exec(user_code)

# ✅ SAFE — Use a whitelist of allowed operations:
ALLOWED_OPS = {"add": lambda a, b: a + b, "sub": lambda a, b: a - b}
if operation in ALLOWED_OPS:
    result = ALLOWED_OPS[operation](x, y)""",
        "confidence": "High",
    },

    "compile": {
        "title": "Use of compile()",
        "risk": "compile() creates code objects that can be executed with exec(). If the source string comes from user input, attackers can inject arbitrary code.",
        "fix": """# ❌ DANGEROUS:
code = compile(user_input, '<string>', 'exec')
exec(code)

# ✅ SAFE — Avoid dynamic code compilation entirely.
# Use configuration files (JSON/YAML) instead of executable code.""",
        "confidence": "High",
    },

    "system": {
        "title": "Use of os.system()",
        "risk": "os.system() passes commands directly to the shell. If user input is included, attackers can chain additional commands using ; or && to take control of the server.",
        "fix": """# ❌ DANGEROUS:
import os
os.system(f'ping {user_ip}')

# ✅ SAFE — Use subprocess with shell=False:
import subprocess
subprocess.run(['ping', user_ip], shell=False, check=True)

# ✅ SAFE — Always validate/sanitize inputs:
import re
if re.match(r'^[\\d.]+$', user_ip):
    subprocess.run(['ping', user_ip])""",
        "confidence": "High",
    },

    "shell=True": {
        "title": "subprocess with shell=True",
        "risk": "shell=True passes the command through the system shell, making it vulnerable to injection attacks — an attacker can append destructive commands.",
        "fix": """# ❌ DANGEROUS:
subprocess.call(f'ls {directory}', shell=True)

# ✅ SAFE — Pass arguments as a list:
subprocess.run(['ls', directory], shell=False, check=True)""",
        "confidence": "High",
    },

    "sql_injection": {
        "title": "Potential SQL Injection",
        "risk": "Building SQL queries with string formatting (f-strings, %, .format()) allows attackers to manipulate queries — reading, modifying, or deleting your entire database.",
        "fix": """# ❌ DANGEROUS:
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")

# ✅ SAFE — Use parameterized queries:
cursor.execute("SELECT * FROM users WHERE name = ?", (name,))

# ✅ SAFE — With SQLAlchemy ORM:
user = session.query(User).filter(User.name == name).first()""",
        "confidence": "High",
    },

    "yaml_load": {
        "title": "Unsafe YAML loading",
        "risk": "yaml.load() without SafeLoader can deserialize arbitrary Python objects, allowing remote code execution through crafted YAML files.",
        "fix": """# ❌ DANGEROUS:
data = yaml.load(file)

# ✅ SAFE — Always use safe_load():
data = yaml.safe_load(file)

# ✅ SAFE — Or specify SafeLoader explicitly:
data = yaml.load(file, Loader=yaml.SafeLoader)""",
        "confidence": "High",
    },

    "weak_hash": {
        "title": "Weak hash algorithm",
        "risk": "MD5 and SHA-1 are cryptographically broken. Attackers can generate collisions or use rainbow tables to crack hashed passwords in seconds.",
        "fix": """# ❌ DANGEROUS:
hashed = hashlib.md5(password.encode()).hexdigest()

# ✅ SAFE — Use bcrypt for passwords:
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# ✅ SAFE — Use SHA-256 for checksums:
hashed = hashlib.sha256(data.encode()).hexdigest()""",
        "confidence": "High",
    },

    "debug_mode": {
        "title": "Debug mode enabled",
        "risk": "Running Flask/Django with debug=True in production exposes a debugger console that allows executing arbitrary Python code on the server.",
        "fix": """# ❌ DANGEROUS:
app.run(debug=True)

# ✅ SAFE — Use environment variable:
import os
app.run(debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true')

# ✅ SAFE — In production, always:
app.run(debug=False)""",
        "confidence": "High",
    },

    "ssl_disabled": {
        "title": "SSL verification disabled",
        "risk": "Setting verify=False disables SSL certificate checking, allowing man-in-the-middle (MITM) attacks where attackers can intercept and modify data in transit.",
        "fix": """# ❌ DANGEROUS:
requests.get(url, verify=False)

# ✅ SAFE — Always verify SSL:
requests.get(url, verify=True)  # This is the default

# ✅ SAFE — For internal/self-signed certs:
requests.get(url, verify='/path/to/custom-ca-bundle.crt')""",
        "confidence": "High",
    },

    "hardcoded_secret": {
        "title": "Hardcoded secret detected",
        "risk": "Hardcoded passwords, API keys, and tokens get committed to Git and exposed to anyone with repository access. Leaked credentials are the #1 cause of data breaches.",
        "fix": """# ❌ DANGEROUS:
API_KEY = 'sk-12345secret'
DB_PASSWORD = 'root123'

# ✅ SAFE — Use environment variables:
import os
API_KEY = os.getenv('API_KEY')
DB_PASSWORD = os.getenv('DB_PASSWORD')

# ✅ SAFE — Use a .env file with python-dotenv:
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv('API_KEY')""",
        "confidence": "High",
    },

    "pickle": {
        "title": "Import of pickle / marshal / shelve",
        "risk": "pickle, marshal, and shelve can execute arbitrary code during deserialization. An attacker can craft a malicious file that runs code when loaded.",
        "fix": """# ❌ DANGEROUS:
import pickle
data = pickle.loads(untrusted_data)

# ✅ SAFE — Use JSON for data serialization:
import json
data = json.loads(untrusted_data)

# ✅ SAFE — If you must use pickle, sign the data:
import hmac
# Verify HMAC signature before unpickling""",
        "confidence": "High",
    },

    "bare_except": {
        "title": "Bare except clause",
        "risk": "Using 'except:' without specifying exception types catches ALL errors, including KeyboardInterrupt and SystemExit. This can silently hide bugs and security issues.",
        "fix": """# ❌ BAD:
try:
    do_something()
except:
    pass

# ✅ BETTER — Catch specific exceptions:
try:
    do_something()
except ValueError as e:
    logger.error(f"Validation error: {e}")
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")

# ✅ ACCEPTABLE — If you need to catch broadly:
try:
    do_something()
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise  # Re-raise after logging""",
        "confidence": "High",
    },

    "telnetlib": {
        "title": "Import of telnetlib",
        "risk": "Telnet transmits all data (including credentials) in plaintext over the network. Anyone on the same network can intercept the communication.",
        "fix": """# ❌ DANGEROUS:
import telnetlib

# ✅ SAFE — Use SSH instead:
import paramiko
client = paramiko.SSHClient()
client.connect(hostname, username=user, password=passwd)""",
        "confidence": "High",
    },
}


def _match_vuln_to_fix(vuln: dict) -> dict | None:
    """Match a vulnerability to its fix entry using title keywords."""
    title = vuln.get("title", "").lower()
    cwe = vuln.get("cwe", "")

    # Direct title matching
    if "eval()" in title:
        return FIX_DATABASE["eval"]
    if "exec()" in title:
        return FIX_DATABASE["exec"]
    if "compile()" in title:
        return FIX_DATABASE["compile"]
    if "os.system" in title:
        return FIX_DATABASE["system"]
    if "shell=true" in title.lower():
        return FIX_DATABASE["shell=True"]
    if "sql injection" in title:
        return FIX_DATABASE["sql_injection"]
    if "yaml" in title:
        return FIX_DATABASE["yaml_load"]
    if "weak hash" in title:
        return FIX_DATABASE["weak_hash"]
    if "debug" in title:
        return FIX_DATABASE["debug_mode"]
    if "ssl" in title:
        return FIX_DATABASE["ssl_disabled"]
    if "hardcoded" in title:
        return FIX_DATABASE["hardcoded_secret"]
    if "pickle" in title or "marshal" in title or "shelve" in title:
        return FIX_DATABASE["pickle"]
    if "bare except" in title:
        return FIX_DATABASE["bare_except"]
    if "telnet" in title:
        return FIX_DATABASE["telnetlib"]

    return None


def get_local_suggestions(vulnerabilities: list[dict]) -> str:
    """
    Generate detailed fix suggestions locally without any API call.
    Returns a formatted string with risk explanations and code fixes.
    """
    if not vulnerabilities:
        return "✅ No vulnerabilities detected. Your code looks clean!"

    lines = []
    lines.append(f"🛡️ PyShield Security Report — {len(vulnerabilities)} issue(s) found\n")
    lines.append("=" * 55 + "\n")

    seen_titles = set()
    fix_count = 0

    for vuln in vulnerabilities:
        title = vuln.get("title", "Unknown")
        if title in seen_titles:
            continue
        seen_titles.add(title)

        fix = _match_vuln_to_fix(vuln)
        fix_count += 1

        lines.append(f"━━━ Fix #{fix_count}: {title} (Line {vuln.get('line', '?')}) ━━━\n")

        if fix:
            lines.append(f"⚠️  WHY IT'S DANGEROUS:\n{fix['risk']}\n")
            lines.append(f"🔧 HOW TO FIX:\n{fix['fix']}\n")
            lines.append(f"📊 Confidence: {fix['confidence']}\n")
        else:
            lines.append(f"⚠️  {vuln.get('description', 'No description available.')}\n")
            lines.append("🔧 Review this code pattern and apply security best practices.\n")

        lines.append("")

    lines.append("=" * 55)
    lines.append("💡 TIP: Fix CRITICAL and HIGH issues first, then address MEDIUM and LOW.")

    return "\n".join(lines)
