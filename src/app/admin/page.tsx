"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function AdminPage() {
  // ── resetCertification state
  const [skillId, setSkillId] = useState("skill_advanced_zk_architect");
  const [resetThreshold, setResetThreshold] = useState(70);
  const [loadingReset, setLoadingReset] = useState(false);

  // ── setIssuerCommitment state
  const [issuerKey, setIssuerKey] = useState("");
  const [issuerThreshold, setIssuerThreshold] = useState(70);
  const [loadingIssuer, setLoadingIssuer] = useState(false);

  // ── revokeCertificate state
  const [revokeCommitment, setRevokeCommitment] = useState("");
  const [loadingRevoke, setLoadingRevoke] = useState(false);

  // ── incrementSession state
  const [loadingSession, setLoadingSession] = useState(false);

  // ── shared
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingReset(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog(`> [CIRCUIT] Executing resetCertification("${skillId}", threshold=${resetThreshold})...`, "info");
      const res = await getClient().resetCertification(skillId, resetThreshold);
      setResult({ ...res, circuit: "resetCertification(Bytes<32>, Uint<32>)" });
      addLog(`> [SUCCESS] Certification reset! New Skill ID: ${res.newSkillId}`, "success");
      addLog(`> [THRESHOLD] New passing threshold set: ${res.newThreshold}/100`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingReset(false); }
  };

  const handleIssuerSetup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingIssuer(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [ZK WITNESS] issuerSigningKey — derived from private key, never disclosed", "info");
      addLog(`> [CIRCUIT] Executing setIssuerCommitment(Uint<32>) — threshold=${issuerThreshold}...`, "info");
      const client = getClient();
      client.setIssuerKey(issuerKey || "issuer_default_signing_key");
      const res = await client.setIssuerCommitment(issuerThreshold);
      setResult({ ...res, circuit: "setIssuerCommitment(Uint<32>)" });
      addLog(`> [SUCCESS] Issuer commitment anchored on-chain!`, "success");
      addLog(`> [COMMITMENT] ${res.issuerCommitment}`, "success");
      addLog(`> [THRESHOLD] certificationThreshold set to ${res.newThreshold}/100`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingIssuer(false); }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingRevoke(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [ZK WITNESS] issuerSigningKey — authorization proof generated locally", "info");
      addLog(`> [CIRCUIT] Executing revokeCertificate(Bytes<32>) — commitment: ${revokeCommitment.substring(0, 20)}...`, "info");
      const res = await getClient().revokeCertificate(revokeCommitment);
      setResult({ ...res, circuit: "revokeCertificate(Bytes<32>)" });
      addLog(`> [SUCCESS] Commitment revoked on-chain!`, "success");
      addLog(`> [REVOKED] ${res.revokedCommitment}`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingRevoke(false); }
  };

  const handleIncrement = async () => {
    setLoadingSession(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [CIRCUIT] Executing incrementSession() — invalidating stale proofs...", "info");
      const res = await getClient().incrementSession();
      setResult({ ...res, circuit: "incrementSession()" });
      addLog(`> [SUCCESS] Session incremented! TxHash: ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingSession(false); }
  };

  const isLoading = loadingReset || loadingIssuer || loadingRevoke || loadingSession;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-amber">Admin</span>
          <span className="badge badge-purple">Issuer Authority</span>
          <span className="badge badge-green">Midnight Preview</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Certification Issuer Admin Console</h1>
        <p className="section-desc">
          All admin circuits require the issuer's private signing key as a ZK witness for authorization. The issuer key is never transmitted — only the derived commitment is verified on-chain.
        </p>
      </div>

      {/* ── Circuit Reference ── */}
      <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem", borderLeft: "3px solid #f59e0b" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Admin Circuits Available
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
          {[
            { circuit: "setIssuerCommitment(Uint<32>)", desc: "Anchor issuer authority + set threshold", color: "#8b5cf6" },
            { circuit: "revokeCertificate(Bytes<32>)", desc: "Revoke a specific certificate commitment", color: "#ef4444" },
            { circuit: "resetCertification(Bytes<32>, Uint<32>)", desc: "Reset skill program + threshold", color: "#f59e0b" },
            { circuit: "incrementSession()", desc: "Bump session nonce (replay protection)", color: "#06b6d4" },
          ].map(c => (
            <div key={c.circuit} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "0.75rem", border: `1px solid ${c.color}33` }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: c.color, marginBottom: "0.25rem" }}>{c.circuit}</div>
              <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel 1: Set Issuer Commitment ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.25rem", borderLeft: "3px solid #8b5cf6" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "1rem" }}>
          🔑 Panel 1 — setIssuerCommitment(Uint&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          One-time setup: derives the issuer's public commitment from the private signing key via ZK witness and anchors it on-chain. Sets the minimum passing score threshold.
        </p>
        <form onSubmit={handleIssuerSetup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Issuer Private Signing Key (ZK Witness — issuerSigningKey())
            </label>
            <input type="password" id="issuerKey" value={issuerKey} onChange={e => setIssuerKey(e.target.value)}
              placeholder="Issuer private signing key (never transmitted)" autoComplete="off" />
            <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.3rem" }}>
              Used to derive the <code>issuerCommitment</code> on-chain anchor — key never disclosed
            </p>
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Minimum Certification Threshold: <span style={{ color: "#8b5cf6" }}>{issuerThreshold}/100</span>
            </label>
            <input type="range" min={0} max={100} value={issuerThreshold}
              onChange={e => setIssuerThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#8b5cf6" }} />
            <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.3rem" }}>
              Stored as <code>certificationThreshold: Uint&lt;32&gt;</code> on-chain ledger
            </p>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} id="setIssuerBtn" style={{ background: "rgba(139,92,246,0.2)", borderColor: "rgba(139,92,246,0.5)" }}>
            {loadingIssuer ? <><span className="spinner" /> Anchoring Commitment...</> : "Set Issuer Commitment (ZK)"}
          </button>
        </form>
      </div>

      {/* ── Panel 2: Revoke Certificate ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.25rem", borderLeft: "3px solid #ef4444" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ef4444", marginBottom: "1rem" }}>
          🚫 Panel 2 — revokeCertificate(Bytes&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Revoke a specific commitment (e.g., fraud detected). Requires issuer authority proof via <code>issuerSigningKey()</code> ZK witness. Revoked commitment stored in <code>lastRevokedCommitment</code>.
        </p>
        <form onSubmit={handleRevoke} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              Commitment Hash to Revoke (Bytes&lt;32&gt;)
            </label>
            <input type="text" id="revokeCommitment" value={revokeCommitment}
              onChange={e => setRevokeCommitment(e.target.value)}
              placeholder="0x... commitment hash to revoke" required />
            <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.3rem" }}>
              Will be stored in <code>lastRevokedCommitment</code> — <code>revokedCount</code> incremented on-chain
            </p>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading || !revokeCommitment} id="revokeBtn"
            style={{ background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.4)" }}>
            {loadingRevoke ? <><span className="spinner" /> Revoking...</> : "Revoke Certificate (ZK Auth)"}
          </button>
        </form>
      </div>

      {/* ── Panel 3: Reset Certification ── */}
      <div className="glass-card" style={{ padding: "1.75rem", marginBottom: "1.25rem", borderLeft: "3px solid #f59e0b" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f59e0b", marginBottom: "1rem" }}>
          🔄 Panel 3 — resetCertification(Bytes&lt;32&gt;, Uint&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Reset the active skill program to a new ID and update the score threshold. Bumps the session nonce to create a clean epoch boundary.
        </p>
        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              New Skill Program ID (Bytes&lt;32&gt;)
            </label>
            <input type="text" id="newSkillId" value={skillId} onChange={e => setSkillId(e.target.value)}
              placeholder="skill_advanced_zk_architect_2026" />
          </div>
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "0.4rem" }}>
              New Score Threshold: <span style={{ color: "#f59e0b" }}>{resetThreshold}/100</span>
            </label>
            <input type="range" min={0} max={100} value={resetThreshold}
              onChange={e => setResetThreshold(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#f59e0b" }} />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} id="resetBtn"
            style={{ background: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.4)" }}>
            {loadingReset ? <><span className="spinner" /> Resetting...</> : "Reset Certification Program"}
          </button>
        </form>
      </div>

      {/* ── Panel 4: Increment Session ── */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.25rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.75rem" }}>
          🔒 Panel 4 — incrementSession()
        </div>
        <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Bumps the <code>activeSession</code> counter to invalidate all pending stale proofs (replay protection). Use after a security incident.
        </p>
        <button onClick={handleIncrement} className="btn-secondary" disabled={isLoading} id="sessionBtn">
          {loadingSession ? <><span className="spinner" /> Bumping Session...</> : "Increment Session Nonce"}
        </button>
      </div>

      {/* ── Activity Log ── */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Activity Log</div>
          <div className="log-box">
            {logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.msg}</div>)}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>✅ Transaction Confirmed</p>
          {Object.entries(result).map(([k, v]) => v !== undefined && (
            <div key={k} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", minWidth: 140 }}>{k}:</span>
              <span style={{ fontSize: "0.8rem", color: "#f1f5f9", fontFamily: "monospace", wordBreak: "break-all" }}>{String(v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Link href="/" className="btn-secondary">Back to Dashboard</Link>
            <Link href="/explorer" className="btn-secondary">View on Explorer</Link>
          </div>
        </div>
      )}
    </div>
  );
}