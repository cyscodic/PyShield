# PyShield 🛡️

**PyShield 2.0** is a full-stack, AI-powered security vulnerability scanner for Python source code. It analyzes your code using Abstract Syntax Tree (AST) parsing to identify OWASP vulnerabilities and leverages Google's Gemini AI to automatically generate secure remediation patches.

## 🚀 Key Features

*   **Deep Static Analysis:** Uses Python's native `ast` module to detect vulnerabilities the way a compiler would (no regex false positives!).
*   **AI-Powered Remediation:** Integrates Google Gemini 2.0 to not only find issues but rewrite your insecure code into secure code.
*   **Offline Fallback Engine:** A highly resilient local remediation engine that kicks in instantly if the AI API is down or rate-limited.
*   **Dynamic Health Scoring:** Grades your code (A+ to F) and provides a detailed point-deduction breakdown based on vulnerability severity (Critical, High, Medium, Low).
*   **Modern UI/UX:** A stunning, animated Glassmorphism dashboard built with React and Next.js.

## 🔍 What it Detects

*   **SQL Injection** (CWE-89)
*   **Command Injection** (CWE-78)
*   **Dangerous Functions** (`eval`, `exec`) (CWE-95)
*   **Hardcoded Secrets & Passwords** (CWE-798)
*   **Weak Cryptography** (`MD5`, `SHA1`) (CWE-328)
*   **Insecure Deserialization** (`pickle`) (CWE-502)
*   *...and 8 other critical rules!*

## 🛠️ Tech Stack

*   **Frontend:** React, Next.js, Tailwind CSS
*   **Backend:** Python, FastAPI, SQLite
*   **AI Engine:** Google Gemini AI API
*   **Deployment:** Docker, Render (Backend), Vercel (Frontend)

## 💻 Local Installation

To run PyShield locally, follow these steps:

### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8001
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

*The application will now be running at `http://localhost:3000`.*

## 🌍 Deployment Architecture

This project is structured for a microservices deployment:
*   The **Backend** is containerized via Docker and deployed on **Render**.
*   The **Frontend** is deployed serverlessly via **Vercel**.
*   Communication between the two is handled via REST APIs secured by JWT Authentication.

