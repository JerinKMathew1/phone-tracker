import React, { useState, useRef } from "react";
import axios from "axios";

export default function App() {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([
    { prefix: "READY", msg: "Awaiting target number..." },
    { prefix: "SYS",   msg: "All signals nominal. Carrier arrays online." },
    { prefix: "NET",   msg: "Connected to telecom backbone · 3 nodes active" },
  ]);
  const [error, setError] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const logRef = useRef(null);
  const scanTimer = useRef(null);

  const SCAN_MSGS = [
    "Routing through carrier nodes...",
    "Querying telecom backbone...",
    "Resolving geolocation...",
    "Decoding line metadata...",
  ];

  const addLog = (prefix, msg) => {
    setLogs((prev) => [...prev, { prefix, msg }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  };

  const startScan = () => {
    let idx = 0;
    setScanMsg(SCAN_MSGS[0]);
    scanTimer.current = setInterval(() => {
      idx = (idx + 1) % SCAN_MSGS.length;
      setScanMsg(SCAN_MSGS[idx]);
    }, 700);
  };

  const stopScan = () => {
    clearInterval(scanTimer.current);
    setScanMsg("");
  };

  const reset = () => {
    setNumber("");
    setResult(null);
    setError(false);
    setLogs([{ prefix: "RESET", msg: "System cleared. Ready for new scan." }]);
  };

  const runScan = async () => {
    if (!number.trim()) { addLog("WARN", "No number provided."); return; }
    setResult(null);
    setError(false);
    addLog("INPUT", `Target: ${number}`);
    addLog("INIT", "Opening scan protocol...");
    setLoading(true);
    startScan();
    try {
      const res = await axios.post("https://phone-tracker-4tp4.onrender.com/track", { number });
      stopScan();
      setLoading(false);
      addLog("RECV", "Response received from server.");
      addLog("PARSE", "Decoding payload fields...");
      addLog("DONE", `Scan complete for ${number}`);
      setResult({ ...res.data, timestamp: new Date().toLocaleTimeString() });
    } catch (e) {
      stopScan();
      setLoading(false);
      addLog("ERR", "Could not reach backend server.");
      addLog("ERR", e.message);
      setError(true);
    }
  };

  const fields = result ? [
    { label: "Number",    icon: "📞", value: result.number       || "N/A" },
    { label: "Country",   icon: "🌐", value: result.country_name || "N/A" },
    { label: "Carrier",   icon: "📶", value: result.carrier      || "N/A" },
    { label: "Line Type", icon: "📡", value: result.line_type    || "N/A" },
    { label: "Location",  icon: "📍", value: result.location     || "N/A" },
  ] : [];

  const C = {
    bg:          "#0a0f1e",
    surface:     "#0d1526",
    card:        "#111d35",
    border:      "#1e3a5f",
    borderGlow:  "#2a5298",
    accent:      "#3b82f6",
    accentLight: "#60a5fa",
    accentDim:   "#1d4ed8",
    textPri:     "#e2eeff",
    textSec:     "#7aa2d4",
    textDim:     "#3d5a8a",
    green:       "#22c55e",
    greenBg:     "#052e16",
    red:         "#f87171",
    redBg:       "#2d0a0a",
    yellow:      "#fbbf24",
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Courier New', monospace", padding: "2.5rem 1rem", color: C.textPri }}>
      <style>{`
        @keyframes grow { 0%,100%{height:4px} 50%{height:18px} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanline { 0%{top:0%} 100%{top:100%} }
        .track-input::placeholder { color: #3d5a8a; }
        .track-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; outline: none; }
        .track-btn:hover { background: #1d4ed8 !important; }
        .track-btn:active { transform: scale(0.97); }
        .reset-btn:hover { border-color: #3b82f6 !important; color: #60a5fa !important; }
        .result-card:hover { border-color: #2a5298 !important; background: #131f38 !important; }
        .log-scroll::-webkit-scrollbar { width: 4px; }
        .log-scroll::-webkit-scrollbar-track { background: transparent; }
        .log-scroll::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 660, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0d1526", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📡</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.22em", color: C.accentLight }}>
              PHONE TRACKER
            </div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: C.textDim }}>
            TELECOM INTELLIGENCE SYSTEM · v2.4.1
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
            {["SIGNAL OK", "3 NODES ACTIVE", "SECURE"].map((s) => (
              <span key={s} style={{ fontSize: 10, letterSpacing: "0.15em", color: C.textDim, background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 4, padding: "3px 8px" }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.textDim, fontSize: 13 }}>+</span>
            <input
              className="track-input"
              style={{ width: "100%", boxSizing: "border-box", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px 12px 28px", fontFamily: "inherit", fontSize: 15, color: C.textPri, transition: "border 0.2s, box-shadow 0.2s" }}
              type="text"
              placeholder="Enter phone number..."
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runScan()}
            />
          </div>
          <button
            className="track-btn"
            style={{ background: C.accentDim, border: `0.5px solid ${C.accent}`, borderRadius: 10, padding: "12px 22px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s, transform 0.1s", letterSpacing: "0.08em" }}
            onClick={runScan}
            disabled={loading}
          >
            {loading ? "⏳ SCANNING..." : "⚡ SCAN"}
          </button>
          <button
            className="reset-btn"
            style={{ background: "transparent", border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontFamily: "inherit", fontSize: 16, color: C.textDim, cursor: "pointer", transition: "all 0.2s" }}
            onClick={reset}
            title="Reset"
          >↺</button>
        </div>

        {/* Terminal */}
        <div style={{ background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingBottom: 10, borderBottom: `0.5px solid ${C.border}` }}>
            {[C.red, C.yellow, C.green].map((c, i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }} />
            ))}
            <span style={{ fontSize: 10, letterSpacing: "0.18em", color: C.textDim, marginLeft: "auto" }}>SYSTEM LOG</span>
          </div>
          <div ref={logRef} className="log-scroll" style={{ maxHeight: 130, overflowY: "auto", fontSize: 12, lineHeight: 1.9 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span style={{
                  minWidth: 70, color:
                    l.prefix === "DONE"  ? C.green :
                    l.prefix === "ERR"   ? C.red :
                    l.prefix === "INPUT" ? C.accentLight :
                    C.textDim
                }}>[{l.prefix}]</span>
                <span style={{
                  color:
                    l.prefix === "DONE"  ? C.green :
                    l.prefix === "ERR"   ? C.red :
                    l.prefix === "INPUT" ? C.accentLight :
                    C.textSec,
                  wordBreak: "break-all"
                }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scan animation */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem", padding: "10px 14px", background: C.surface, border: `0.5px solid ${C.border}`, borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 18 }}>
              {[0, 150, 300, 450].map((d, i) => (
                <div key={i} style={{ width: 3, height: 4, background: C.accent, borderRadius: 1, animation: `grow 0.9s ${d}ms infinite ease-in-out` }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: C.textSec, letterSpacing: "0.05em" }}>{scanMsg}</span>
          </div>
        )}

        {/* Results grid */}
        {result && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: "1rem" }}>
              {fields.map((f) => (
                <div key={f.label} className="result-card" style={{ background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "0.9rem 1rem", transition: "all 0.2s", cursor: "default" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.14em", color: C.textDim, marginBottom: 7, textTransform: "uppercase" }}>
                    {f.icon} {f.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textPri, wordBreak: "break-all" }}>{f.value}</div>
                </div>
              ))}
              <div className="result-card" style={{ background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "0.9rem 1rem", transition: "all 0.2s", cursor: "default" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", color: C.textDim, marginBottom: 7, textTransform: "uppercase" }}>🛡 Valid</div>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                  background: result.valid ? C.greenBg : C.redBg,
                  color:      result.valid ? C.green   : C.red,
                  border: `0.5px solid ${result.valid ? C.green : C.red}`,
                }}>
                  {result.valid ? "✓ VALID" : "✗ INVALID"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: `0.5px solid ${C.border}`, fontSize: 12, color: C.textDim }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: error ? C.red : C.green, display: "inline-block", animation: "pulse 2s infinite" }} />
              {error ? "Connection failed — is the backend running?" : `Scan complete · ${result.timestamp}`}
            </div>
          </>
        )}

        {error && !result && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: `0.5px solid ${C.border}`, fontSize: 12, color: C.red }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, display: "inline-block" }} />
            Connection failed — is the backend running?
          </div>
        )}

      </div>
    </div>
  );
}