"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function AdminPage() {
  const [skillId, setSkillId] = useState("skill_advanced_zk_architect");
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingReset(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog(`> [CIRCUIT] Executing resetCertification("${skillId}")...`, "info");
      const res = await getClient().resetCertification(skillId);
      setResult({ ...res, circuit: "resetCertification" });
      addLog(`> [SUCCESS] Certification reset! New Skill ID: ${res.newSkillId}`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingReset(false); }
  };

  const handleIncrement = async () => {
    setLoadingSession(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [CIRCUIT] Executing incrementSession()...", "info");
      const res = await getClient().incrementSession();
      setResult({ ...res, circuit: "incrementSession" });
      addLog(`> [SUCCESS] Session incremented! TxHash: ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingSession(false); }
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-amber">Admin</span>
          <span className="badge badge-purple">Issuer Only</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Admin / Certification Issuer Panel</h1>
        <p className="section-desc">Manage on-chain skill certification state via Midnight Lace Wallet.</p>
      </div>
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#f1f5f9" }}>Reset Skill ID</h2>
        <p className="section-desc" style={{ marginBottom: "1.25rem" }}>Updates the on-chain skillId ledger state to a new certification program.</p>
        <form onSubmit={handleReset} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input type="text" id="newSkillId" value={skillId} onChange={e => setSkillId(e.target.value)} placeholder="New Skill ID" style={{ flex: "1 1 260px" }} />
          <button type="submit" className="btn-primary" disabled={loadingReset} id="resetBtn">
            {loadingReset ? <><span className="spinner" /> Executing...</> : "Reset Certification"}
          </button>
        </form>
      </div>
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#f1f5f9" }}>Increment Session</h2>
        <p className="section-desc" style={{ marginBottom: "1.25rem" }}>Increments the activeSession counter on-chain, rotating the certification epoch.</p>
        <button className="btn-primary" onClick={handleIncrement} disabled={loadingSession} id="incrementSessionBtn">
          {loadingSession ? <><span className="spinner" /> Executing...</> : "Increment Session (+1)"}
        </button>
      </div>
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Activity Log</div>
          <div className="log-box">{logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.msg}</div>)}</div>
        </div>
      )}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Circuit Executed Successfully!</p>
          {[
            { label: "Circuit", value: result.circuit === "resetCertification" ? "resetCertification(Bytes<32>)" : "incrementSession()" },
            ...(result.newSkillId ? [{ label: "New Skill ID", value: result.newSkillId }] : []),
            { label: "TxHash", value: result.txHash },
            { label: "Signed By", value: result.signedBy },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", minWidth: 130 }}>{label}:</span>
              <span style={{ fontSize: "0.8rem", color: "#f1f5f9", fontFamily: "monospace", wordBreak: "break-all" }}>{value}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "2rem" }}><Link href="/" className="btn-secondary">Back to Dashboard</Link></div>
    </div>
  );
}