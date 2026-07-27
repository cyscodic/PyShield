<p align="center">
  <img src="frontend/public/logo.jpg" alt="PyShield 2.0 Logo" width="160" style="border-radius: 12px;" />
</p>

# PyShield 2.0 
### *AI Security Engine for Python*

[![Live Demo](https://img.shields.io/badge/Live_Demo-pyshield.vercel.app-00E5A0?style=for-the-badge&logo=vercel&logoColor=white)](https://pyshield.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**PyShield 2.0** is an interactive, full-stack static application security testing (SAST) engine designed to detect OWASP vulnerabilities in Python source code and automatically generate production-ready secure code fixes using Google's Gemini AI.

---

## 🌟 Key Features

- 🔍 **Compiler-Level AST Analysis:** Uses Python's native Abstract Syntax Tree (`ast`) module to parse code syntax, eliminating regex false positives and catching threats at the structural level.
- 🤖 **Autonomous AI Security Agent:** Powered by **Google Gemini 2.0 API** to evaluate code for security flaws, explain vulnerabilities, and automatically generate 100% vulnerability-free replacement code.
- 🛡️ **Offline Fallback Engine:** Features a local rule-based remediation system ensuring 100% scanning uptime even if API limits or network outages occur.
- 📊 **Dynamic Health Scoring System:** Assigns an instant security grade (**A+ to F**) with a transparent, rule-weighted point-deduction breakdown.
- ⚡ **Full-Stack Microservices Architecture:** High-performance FastAPI backend containerized with Docker, paired with a modern React/Next.js Glassmorphism dashboard on Vercel.

---

## 🔍 Supported Vulnerability Detections (CWE Mapping)

| Vulnerability Category | CWE Identifier | Detection Mechanism |
| :--- | :--- | :--- |
| **SQL Injection** | [CWE-89](https://cwe.mitre.org/data/definitions/89.html) | Detects raw f-string & formatted SQL query execution |
| **Command Injection** | [CWE-78](https://cwe.mitre.org/data/definitions/78.html) | Identifies unsafe `os.system` & `subprocess` calls |
| **Code Injection (`eval`/`exec`)** | [CWE-95](https://cwe.mitre.org/data/definitions/95.html) | Flags dynamic code execution functions |
| **Hardcoded Credentials & Secrets** | [CWE-798](https://cwe.mitre.org/data/definitions/798.html) | Scans for embedded API keys, passwords, and tokens |
| **Weak Cryptographic Hashing** | [CWE-328](https://cwe.mitre.org/data/definitions/328.html) | Detects obsolete algorithms like `MD5` and `SHA1` |
| **Insecure Deserialization** | [CWE-502](https://cwe.mitre.org/data/definitions/502.html) | Warns against untrusted `pickle.loads` calls |
| **Disabled SSL Verification** | [CWE-295](https://cwe.mitre.org/data/definitions/295.html) | Catches `requests.get(..., verify=False)` calls |

---

## 🏗️ System Architecture

```
                 ┌──────────────────────────────────────┐
                 │       Next.js Dashboard (Vercel)     │
                 └──────────────────┬───────────────────┘
                                    │  REST API Calls (HTTPS / CORS)
                                    ▼
                 ┌──────────────────────────────────────┐
                 │       FastAPI Backend (Render/Docker)│
                 └──────────┬────────────────┬──────────┘
                            │                │
          AST Parser Engine │                │ AI Remediation API
                            ▼                ▼
             ┌────────────────────┐   ┌────────────────────┐
             │ Local AST Scanner  │   │  Google Gemini AI  │
             └──────────┬─────────┘   └─────────┬──────────┘
                        │                       │
                        └───────────┬───────────┘
                                    ▼
                 ┌──────────────────────────────────────┐
                 │  Health Grade (A+-F) & Secure Code   │
                 └──────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend:** FastAPI, Python 3.11+, Pydantic v2, SQLAlchemy
- **AI Integration:** Google Gemini 2.0 API (`google-generativeai`)
- **DevOps & Hosting:** Docker, Vercel (Frontend), Render (Backend)

---

## 💻 Local Setup & Installation

### Prerequisites
- Python 3.11 or higher
- Node.js 18.x or higher
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/cyscodic/PyShield.git
cd PyShield
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Create .env file
cp .env.example .env   # Or create .env manually

# Start FastAPI server
uvicorn app.main:app --reload --port 8001
```

### 3. Frontend Setup
```bash
# In a new terminal tab, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```

Open `http://localhost:3000` in your browser to view the application!

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/cyscodic/PyShield/issues).

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
