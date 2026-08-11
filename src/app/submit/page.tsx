"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function IssueCertificatePage() {
  const [skillId, setSkillId] = useState("skill_fullstack_zk_engineer");
  const [candidateKey, setCandidateKey] = useState("");
  const [certRecord, setCertRecord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setLogs([]);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      const client = getClient();
      client.setCandidateSecretKey(candidateKey || "anonymous_candidate_key_default");
      client.setCertificationRecord(certRecord || "default_score_record");
      addLog("> [ZK] Generating zero-knowledge witness proof...", "info");
      addLog("> [CIRCUIT] Executing issueCertificate() on-chain circuit...", "info");
      const res = await client.issueCertificate(skillId);
      setResult(res);
      addLog(`> [SUCCESS] Certificate issued! TxHash: ${res.txHash}`, "success");
      addLog(`> [COMMITMENT] Commitment: ${res.commitmentHex}`, "success");
      addLog(`> [FEE] Transaction fee: ${res.txFee} ${res.txFeeAsset}`, "info");
    } catch (err: any) {
      const msg = err?.message || "Certificate issuance failed.";
      setError(msg);
      addLog(`> [ERROR] ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">ZK Certification</span>
          <span className="badge badge-green">Midnight Preview</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Issue Skill Certificate Anonymously</h1>
        <p className="section-desc">
          Your identity and assessment scores stay private. Only a cryptographic commitment hash is disclosed on-chain — zero personal information revealed.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Skill Certification ID *
            </label>
            <input type="text" id="skillId" value={skillId} onChange={e => setSkillId(e.target.value)} placeholder="skill_fullstack_zk_engineer" required />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>Must match the active skill ID registered on-chain</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Candidate Secret Key (Private Witness)
            </label>
            <input type="password" id="candidateKey" value={candidateKey} onChange={e => setCandidateKey(e.target.value)} placeholder="Your private secret key (never leaves your device)" autoComplete="off" />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>Never transmitted — used only locally to generate ZK witness</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Certification Record / Assessment Data
            </label>
            <textarea id="certRecord" value={certRecord} onChange={e => setCertRecord(e.target.value)} placeholder="Paste your assessment details or score payload (hashed locally before ZK proof)" rows={4} style={{ resize: "vertical" }} />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>Content is hashed locally — only the hash enters the ZK proof</p>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button type="submit" className="btn-primary" disabled={loading} id="submitBtn">
              {loading ? <><span className="spinner" /> Generating ZK Proof...</> : "Issue Certificate (ZK Proof)"}
            </button>
            <Link href="/" className="btn-secondary">Back to Dashboard</Link>
          </div>
        </form>
      </div>

      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Activity Log</div>
          <div className="log-box">
            {logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.msg}</div>)}
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
          <p style={{ color: "#fca5a5", fontWeight: 600 }}>Error</p>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem", fontSize: "0.9rem" }}>{error}</p>
        </div>
      )}

      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Certificate Issued Successfully!</p>
          {[
            { label: "Circuit", value: "issueCertificate(Bytes<32>)" },
            { label: "ZK Commitment", value: result.commitmentHex },
            { label: "On-Chain TxHash", value: result.txHash },
            { label: "Signed By", value: result.signedBy },
            { label: "Tx Fee", value: `${result.txFee} ${result.txFeeAsset}` },
            { label: "Wallet Funded", value: result.walletFunded ? "Yes" : "No (may be unfunded)" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", minWidth: 130 }}>{label}:</span>
              <span style={{ fontSize: "0.8rem", color: "#f1f5f9", fontFamily: "monospace", wordBreak: "break-all" }}>{value}</span>
            </div>
          ))}
          <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.75rem", fontWeight: 600 }}>Status: CONFIRMED (Midnight Preview)</p>
        </div>
      )}
    </div>
  );
}