"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("untitled.py");
  const [results, setResults] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/";
  }, []);

  const handleScan = async () => {
    if (!code.trim()) return;
    setScanning(true); setResults(null); setShowResults(false); setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await fetch(`${API}/api/scan/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: code, filename: filename, use_ai: useAI }),
      });
      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => { setResults(data); setScanning(false); setShowResults(true); }, 500);
    } catch {
      clearInterval(progressInterval); setScanning(false);
      alert("Cannot connect to backend.");
    }
  };

  const handleNewScan = () => {
    setCode("");
    setResults(null);
    setShowResults(false);
    setProgress(0);
    setScanning(false);
    setFilename("untitled.py");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  const calculateScore = (vulns: any[]) => {
    let score = 100;
    vulns.forEach((v) => {
      if (v.severity === "CRITICAL") score -= 30;
      else if (v.severity === "HIGH") score -= 15;
      else if (v.severity === "MEDIUM") score -= 8;
      else if (v.severity === "LOW") score -= 3;
    });
    return Math.max(0, score);
  };

  const getGrade = (score: number) => {
    if (score >= 95) return "A+";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return "#00e5a0";
    if (score >= 80) return "#ffd000";
    if (score >= 70) return "#f97316";
    return "#ef4444";
  };

  const getScoreBreakdown = (vulns: any[]) => {
    if (!vulns || vulns.length === 0) return null;
    const pointMap: Record<string, number> = { CRITICAL: 30, HIGH: 15, MEDIUM: 8, LOW: 3 };
    const seen = new Set<string>();
    const items: { title: string; severity: string; points: number }[] = [];
    vulns.forEach((v: any) => {
      const key = v.title;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ title: v.title, severity: v.severity, points: pointMap[v.severity] || 0 });
      }
    });
    items.sort((a, b) => b.points - a.points);
    return items;
  };

  const getSeverityColor = (s: string) =>
    ({ CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#00e5a0" }[s] || "#64748b");

  const handleLogout = () => { localStorage.removeItem("token"); window.location.href = "/"; };

  const securityScore = results ? calculateScore(results.vulnerabilities) : 100;
  const scoreBreakdown = results ? getScoreBreakdown(results.vulnerabilities) : null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {mounted && (
        <div className="particles">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${(i * 4) % 100}%`,
              animationDuration: `${6 + (i % 5) * 3}s`,
              animationDelay: `${i % 10}s`,
              width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`,
            }} />
          ))}
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 32px", borderBottom: "1px solid var(--border)", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div onClick={() => window.location.href = "/"} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <img src="/logo.jpg" alt="PyShield" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
            <span style={{ fontSize: "18px", fontWeight: 800 }}>Py<span style={{ color: "var(--accent)" }}>Shield</span></span>
          </div>
          <span className="badge-low badge" onClick={handleNewScan} style={{ marginLeft: "6px", cursor: "pointer" }} title="Reset Dashboard">Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="pulse" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Engine Active</span>
          </div>
          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)",
            padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px"
          }}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", padding: "24px 32px",
        height: "calc(100vh - 70px)", overflow: "hidden"
      }}>
        {/* LEFT - Code Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700 }}>
              <span style={{ color: "var(--accent)", marginRight: "8px" }}>⟩</span>Source Code
            </h2>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
              <input type="checkbox" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              AI Analysis
            </label>
          </div>

          <div className="code-editor" style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{
              padding: "10px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00e5a0" }} />
                <span className="terminal-text" style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "8px" }}>{filename}</span>
              </div>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "11px", color: "var(--accent)", cursor: "pointer",
                padding: "4px 8px", borderRadius: "4px", background: "rgba(0, 229, 160, 0.05)",
                border: "1px solid rgba(0, 229, 160, 0.15)", transition: "all 0.3s ease"
              }}>
                <span>📁 Upload Code</span>
                <input type="file" accept=".py" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>
            </div>
            {scanning && <div className="scanning-line" />}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{ flex: 1 }}
              placeholder={"# Paste your Python code here or upload a file...\n\n# Example vulnerable code:\nimport pickle\nimport os\n\npassword = 'admin123'\neval(user_input)\nos.system('rm -rf /')"}
            />
          </div>

          {scanning && (
            <div className="progress-bar" style={{ flexShrink: 0 }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
            <button className="btn-scan" onClick={handleScan} disabled={scanning || !code.trim()} style={{ flex: 1 }}>
              {scanning ? <><span className="spinner" /> Scanning...</> : "⟩ Run Security Scan"}
            </button>
            {(showResults || code.trim()) && !scanning && (
              <button onClick={handleNewScan} className="btn-outline" style={{ padding: "16px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 700 }}>
                New Scan
              </button>
            )}
          </div>
        </div>

        {/* RIGHT - Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, flexShrink: 0 }}>
            <span style={{ color: "var(--accent-warm)", marginRight: "8px" }}>◈</span>Scan Results
            {results && <span style={{ marginLeft: "12px", fontSize: "13px", fontWeight: 400, color: "var(--text-secondary)" }}>{results.total_vulnerabilities} found</span>}
          </h2>

          {!results && !scanning && (
            <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", gap: "12px" }}>
              <span style={{ fontSize: "48px", opacity: 0.3 }}>🔍</span>
              <span style={{ fontSize: "14px" }}>Paste code and hit scan to find vulnerabilities</span>
            </div>
          )}

          {scanning && (
            <div className="glass-card scan-pulse" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <img src="/logo.jpg" alt="Scanning" style={{ width: "48px", height: "48px", borderRadius: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
              <span className="terminal-text" style={{ fontSize: "14px", background: "linear-gradient(135deg, var(--accent), var(--accent-warm))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Analyzing code structure...
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {progress < 30 ? "Parsing AST..." : progress < 60 ? "Running 12 security rules..." : progress < 90 ? "Checking patterns..." : "Finalizing..."}
              </span>
            </div>
          )}

          {showResults && results && (
            <div style={{
              display: "flex", flexDirection: "column", gap: "12px",
              overflowY: "auto", flex: 1, paddingRight: "4px",
              scrollbarWidth: "thin", scrollbarColor: "var(--accent) transparent"
            }}>
              {/* Security Health Grade */}
              <div className="glass-card result-card" style={{
                padding: "20px", display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: "16px", flexShrink: 0,
                borderLeft: `4px solid ${getGradeColor(securityScore)}`
              }}>
                <div style={{ textAlign: "left" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                    Security Health Rating
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    AST analysis result for <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>{filename}</span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: getGradeColor(securityScore), lineHeight: "1" }}>
                    {getGrade(securityScore)}
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    Score: {securityScore}/100
                  </span>
                </div>
              </div>

              {/* Score Breakdown — How to raise your grade */}
              {scoreBreakdown && scoreBreakdown.length > 0 && securityScore < 90 && (
                <div className="glass-card result-card" style={{
                  padding: "16px 20px", flexShrink: 0,
                  borderLeft: `3px solid ${getGradeColor(securityScore)}`,
                  background: "rgba(239, 68, 68, 0.02)"
                }}>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: getGradeColor(securityScore), marginBottom: "12px" }}>
                    {securityScore < 50 ? "🚨" : "⚠️"} Fix these to raise your grade:
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {scoreBreakdown.map((item, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 12px", borderRadius: "8px",
                        background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className={`badge badge-${item.severity.toLowerCase()}`} style={{ fontSize: "9px", padding: "2px 8px" }}>
                            {item.severity}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{item.title}</span>
                        </div>
                        <span className="terminal-text" style={{ fontSize: "12px", color: getSeverityColor(item.severity), fontWeight: 700 }}>
                          -{item.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "12px", lineHeight: "1.5" }}>
                    💡 Fix the top items first — each CRITICAL fix recovers <span style={{ color: "#ef4444", fontWeight: 700 }}>+30 points</span>, each HIGH fix recovers <span style={{ color: "#f97316", fontWeight: 700 }}>+15 points</span>.
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="glass-card result-card" style={{ padding: "20px", display: "flex", justifyContent: "space-around", textAlign: "center", flexShrink: 0 }}>
                {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                  <div key={level}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: getSeverityColor(level) }}>
                      {results.vulnerabilities.filter((v: any) => v.severity === level).length}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>{level}</div>
                  </div>
                ))}
              </div>

              {results.total_vulnerabilities === 0 && (
                <div className="glass-card result-card" style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--accent)", marginBottom: "8px" }}>Code is Clean!</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No vulnerabilities detected.</p>
                </div>
              )}

              {results.vulnerabilities.map((vuln: any, i: number) => (
                <div key={i} className="glass-card result-card" style={{
                  padding: "16px 20px", animationDelay: `${(i + 1) * 0.1}s`,
                  borderLeft: `3px solid ${getSeverityColor(vuln.severity)}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "14px" }}>{vuln.title}</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {vuln.cwe && <span className="terminal-text" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{vuln.cwe}</span>}
                      <span className={`badge badge-${vuln.severity.toLowerCase()}`}>{vuln.severity}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{vuln.description}</p>
                  <span className="terminal-text" style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "8px", display: "inline-block" }}>Line {vuln.line}</span>
                </div>
              ))}

              {results.ai_suggestions && (
                <div className="result-card" style={{ animationDelay: `${(results.vulnerabilities.length + 1) * 0.1}s` }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🤖</span> AI Remediation Suggestions
                  </h3>
                  <div className="ai-box">{results.ai_suggestions}</div>
                </div>
              )}

              <div style={{ height: "20px", flexShrink: 0 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}