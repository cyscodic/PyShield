"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Mock Terminal Log States
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  const API = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001").replace(/\/$/, "");
  const tagline = "scan --target your_code.py --deep --ai";

  const consoleLogs = [
    "⟩ initializing pyshield scanner v1.0.0...",
    "🚀 loaded 12 security rules successfully.",
    "📁 target: unsafe_web_app.py",
    "🔍 parsing abstract syntax tree (ast)...",
    "⚠️ WARNING: hardcoded secret detected at line 3 (CWE-798)",
    "❌ CRITICAL: eval() usage found at line 14 (CWE-95)",
    "⚠️ WARNING: os.system() command injection risk at line 22 (CWE-78)",
    "🤖 contacting gemini ai engine for fixes...",
    "✨ Gemini AI: generating remediation patches...",
    "✅ patches successfully created!",
    "🛡️ scan complete: 3 issues identified. Rating: F",
  ];

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Title Typing Animation
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(tagline.slice(0, i + 1));
      i++;
      if (i >= tagline.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Live Terminal Log Loop
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setTerminalLogs((prev) => {
        if (logIndex >= consoleLogs.length) {
          setLogIndex(0);
          return [];
        }
        setLogIndex((prevIndex) => prevIndex + 1);
        return [...prev, consoleLogs[logIndex]];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [mounted, logIndex]);

  const handleStartScanning = () => {
    if (isLoggedIn) {
      window.location.href = "/dashboard";
    } else {
      setShowLogin(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = isResetPassword ? "/api/auth/reset-password" : isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isResetPassword ? { email, new_password: password } : isRegister ? { email, password, full_name: fullName } : { email, password };
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Something went wrong"); setLoading(false); return; }
      if (isResetPassword) {
        setIsResetPassword(false);
        setError("");
        alert("Password reset successfully! Please login with your new password.");
      } else if (isRegister) {
        setIsRegister(false);
        setError("");
        alert("Account created! Please login.");
      } else {
        localStorage.setItem("token", data.access_token);
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Particles */}
      {mounted && (
        <div className="particles">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${(i * 3.3) % 100}%`,
              animationDuration: `${6 + (i % 5) * 3}s`,
              animationDelay: `${i % 10}s`,
              width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`,
            }} />
          ))}
        </div>
      )}

      {/* Hex Nodes */}
      {mounted && (
        <div className="hex-nodes">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="hex-node" style={{
              left: `${(i * 6.6) % 100}%`, top: `${(i * 7.1) % 100}%`,
              animationDelay: `${i * 0.3}s`, animationDuration: `${3 + (i % 4)}s`,
            }} />
          ))}
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", borderBottom: "1px solid var(--border)"
      }}>
        <div 
          onClick={() => window.location.href = "/"}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <img src="/logo.jpg" alt="PyShield" style={{ width: "32px", height: "32px", borderRadius: "6px" }} />
          <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Py<span style={{ color: "var(--accent)" }}>Shield</span>
          </span>
          <span className="badge-low badge" style={{ marginLeft: "8px" }}>v1.0</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a href="http://127.0.0.1:8001/docs" target="_blank" rel="noreferrer"
            style={{ color: "var(--text-secondary)", fontSize: "14px", textDecoration: "none" }}>API Docs</a>
          <button className="btn-primary" onClick={handleStartScanning} style={{ padding: "10px 24px", fontSize: "13px" }}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <section style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 20px 40px"
      }}>
        <div className="fade-in" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", borderRadius: "8px", marginBottom: "32px",
          background: "rgba(0, 229, 160, 0.04)", border: "1px solid rgba(0, 229, 160, 0.12)"
        }}>
          <span style={{ color: "var(--accent)", fontSize: "13px" }}>$</span>
          <span className="terminal-text" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            pyshield {typedText}
          </span>
          <span className="cursor-blink" style={{ fontSize: "13px" }} />
        </div>

        <h1 className="fade-in fade-in-delay-1" style={{
          fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 800,
          lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-2px", maxWidth: "750px"
        }}>
          Find Vulnerabilities
          <br />
          <span style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-warm))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Before Hackers Do
          </span>
        </h1>

        <p className="fade-in fade-in-delay-2" style={{
          fontSize: "16px", color: "var(--text-secondary)", maxWidth: "520px", lineHeight: 1.8, marginBottom: "40px"
        }}>
          AST-powered static analysis combined with Gemini AI to detect, explain,
          and fix security vulnerabilities in your Python codebase.
        </p>

        <div className="fade-in fade-in-delay-3" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "64px" }}>
          <button className="btn-primary" onClick={handleStartScanning}>
            {isLoggedIn ? "Go to Dashboard →" : "Start Scanning →"}
          </button>
          <a href="http://127.0.0.1:8001/docs" target="_blank" rel="noreferrer" className="btn-outline">API Docs</a>
        </div>

        {/* NEW: Live Animated Terminal Demonstration */}
        <div className="glass-card fade-in fade-in-delay-4" style={{
          maxWidth: "600px", width: "100%", textAlign: "left",
          border: "1px solid var(--border)", borderRadius: "12px",
          overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          marginBottom: "64px"
        }}>
          <div style={{
            padding: "12px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.3)"
          }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00e5a0" }} />
            <span className="terminal-text" style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "8px" }}>
              pyshield-live-scanner.sh
            </span>
          </div>
          <div className="terminal-text" style={{
            padding: "20px", minHeight: "180px", maxHeight: "250px", overflowY: "auto",
            fontSize: "12px", lineHeight: "1.8", color: "var(--text-primary)",
            background: "rgba(0,0,0,0.4)"
          }}>
            {terminalLogs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  color: log.includes("❌") ? "#ef4444" : log.includes("⚠️") ? "#f59e0b" : log.includes("🤖") || log.includes("✨") ? "var(--accent-warm)" : log.includes("✅") ? "var(--accent)" : "inherit"
                }}
              >
                {log}
              </div>
            ))}
            <div className="cursor-blink" style={{ display: "inline-block" }} />
          </div>
        </div>

        {/* Stats */}
        <div className="fade-in fade-in-delay-4" style={{
          display: "flex", gap: "48px", padding: "24px 48px",
          borderRadius: "12px", background: "rgba(0, 229, 160, 0.02)", border: "1px solid var(--border)"
        }}>
          {[
            { value: "12+", label: "Security Rules" },
            { value: "<1s", label: "Scan Speed" },
            { value: "AI", label: "Powered Fixes" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "28px", fontWeight: 800,
                background: "linear-gradient(135deg, var(--accent), var(--accent-warm))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1.5px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px", marginTop: "80px", maxWidth: "880px", width: "100%", padding: "0 20px"
        }}>
          {[
            { icon: "⟩_", title: "AST Deep Scan", desc: "Parses Python into Abstract Syntax Trees to detect dangerous patterns at the structural level." },
            { icon: "◈", title: "AI Fix Suggestions", desc: "Gemini AI analyzes each vulnerability and provides production-ready code fixes." },
            { icon: "⚡", title: "12 Security Rules", desc: "Catches eval(), SQL injection, hardcoded secrets, command injection, and more." },
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: "28px", textAlign: "left" }}>
              <div className="terminal-text" style={{
                fontSize: "22px", marginBottom: "16px", width: "48px", height: "48px",
                display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(0, 229, 160, 0.08), rgba(245, 158, 11, 0.05))",
                border: "1px solid rgba(0, 229, 160, 0.12)", color: "var(--accent)"
              }}>{f.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "24px 40px", borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "12px", color: "var(--text-secondary)"
      }}>
        <span>© 2026 PyShield. Built with FastAPI + Next.js</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          <span>System Operational</span>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(10px)"
        }} onClick={() => setShowLogin(false)}>
          <div className="glass-card fade-in" style={{ padding: "36px", width: "100%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              <img src="/logo.jpg" alt="PyShield" style={{ width: "24px", height: "24px", borderRadius: "4px" }} />
              <span style={{ fontWeight: 700, fontSize: "18px" }}>Py<span style={{ color: "var(--accent)" }}>Shield</span></span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
              {isResetPassword ? "Reset Password" : isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "13px" }}>
              {isResetPassword ? "Enter your email and new password" : isRegister ? "Start securing your Python code" : "Login to continue scanning"}
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {!isResetPassword && isRegister && <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-dark" />}
              <input type="email" placeholder="Email" value={email} required onChange={(e) => setEmail(e.target.value)} className="input-dark" />
              <input type="password" placeholder={isResetPassword ? "New Password" : "Password"} value={password} required onChange={(e) => setPassword(e.target.value)} className="input-dark" />
              {error && <p style={{ color: "var(--critical)", fontSize: "13px" }}>{error}</p>}
              
              {!isRegister && !isResetPassword && (
                <p style={{ textAlign: "right", margin: 0 }}>
                  <span onClick={() => { setIsResetPassword(true); setError(""); }} style={{ fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer" }}>
                    Forgot Password?
                  </span>
                </p>
              )}

              <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "8px", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Processing..." : isResetPassword ? "Reset Password" : isRegister ? "Create Account" : "Login →"}
              </button>
            </form>
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)" }}>
              {isResetPassword ? "Remember your password?" : isRegister ? "Already have an account?" : "No account?"}{" "}
              <span onClick={() => { setIsRegister(isResetPassword ? false : !isRegister); setIsResetPassword(false); setError(""); }} style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>
                {isResetPassword ? "Login" : isRegister ? "Login" : "Sign Up"}
              </span>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}