"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function IssueCertificatePage() {
  const [skillId, setSkillId] = useState("skill_fullstack_zk_engineer");
  const [candidateKey, setCandidateKey] = useState("");
  const [certRecord, setCertRecord] = useState("");
  const [candidateScore, setCandidateScore] = useState(80);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [claimedCommitment, setClaimedCommitment] = useState("");
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
      client.setCandidateScore(candidateScore);
      addLog(`> [ZK WITNESS] candidateSecretKey — private, never leaves device`, "info");
      addLog(`> [ZK WITNESS] scoreProofNonce — entropy binding generated`, "info");
      addLog(`> [ZK WITNESS] certificationRecordHash — SHA-256 of assessment data`, "info");
      addLog(`> [ZK WITNESS] candidateScoreProof — score ${candidateScore} checked privately vs. threshold`, "info");
      addLog(`> [ZK THRESHOLD] Verifying score >= certificationThreshold (private ZK assertion)...`, "info");
      addLog("> [CIRCUIT] Executing issueCertificate(Bytes<32>) on-chain circuit...", "info");
      const res = await client.issueCertificate(skillId);
      setResult(res);
      addLog(`> [SUCCESS] Certificate issued! TxHash: ${res.txHash}`, "success");
      addLog(`> [COMMITMENT] ZK Commitment: ${res.commitmentHex}`, "success");
      addLog(`> [PRIVACY] Score, identity, record — NEVER disclosed on-chain`, "success");
      addLog(`> [FEE] Transaction fee: ${res.txFee} ${res.txFeeAsset}`, "info");
    } catch (err: any) {
      const msg = err?.message || "Certificate issuance failed.";
      setError(msg);
      addLog(`> [ERROR] ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true); setVerifyResult(null);
    try {
      addLog("> [CIRCUIT] Executing verifyCertificate(Bytes<32>) on-chain...", "info");
      const res = await getClient().verifyCertificate(claimedCommitment);
      setVerifyResult(res);
      addLog(res.matches
        ? "> [VERIFIED] Commitment matches on-chain record — credential is VALID"
        : "> [MISMATCH] Commitment does NOT match — credential may be invalid or revoked",
        res.matches ? "success" : "error");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message}`, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-purple">ZK Certification</span>
          <span className="badge badge-green">Midnight Preview</span>
          <span className="badge badge-amber">Score Threshold</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Issue Skill Certificate Anonymously</h1>
        <p className="section-desc">
          Your identity, exam score, and assessment records stay fully private on your device. A ZK proof verifies your score meets the threshold — only a cryptographic commitment hash is disclosed on-chain.
        </p>
      </div>

      {/* ── ZK Architecture Info ── */}
      <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem", borderLeft: "3px solid #8b5cf6" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ZK Circuit Architecture — issueCertificate(Bytes&lt;32&gt;)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "candidateSecretKey()", desc: "Private identity witness", color: "#ef4444" },
            { label: "scoreProofNonce()", desc: "Entropy/replay binding", color: "#f59e0b" },
            { label: "certificationRecordHash()", desc: "Hashed assessment record", color: "#06b6d4" },
            { label: "candidateScoreProof()", desc: "Private score ≥ threshold", color: "#10b981" },
          ].map(w => (
            <div key={w.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "0.75rem", border: `1px solid ${w.color}33` }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: w.color, marginBottom: "0.25rem" }}>{w.label}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Issue Certificate Form ── */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Skill Certification ID *
            </label>
            <input type="text" id="skillId" value={skillId} onChange={e => setSkillId(e.target.value)}
              placeholder="skill_fullstack_zk_engineer" required />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>Must match the active skill ID registered on-chain by the issuer</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Candidate Secret Key — Private Witness
            </label>
            <input type="password" id="candidateKey" value={candidateKey} onChange={e => setCandidateKey(e.target.value)}
              placeholder="Your private secret key (never leaves your device)" autoComplete="off" />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Used locally to generate <code>candidateSecretKey()</code> ZK witness — never transmitted
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Exam Score — Private Threshold Witness
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input type="range" id="candidateScore" min={0} max={100} value={candidateScore}
                onChange={e => setCandidateScore(Number(e.target.value))}
                style={{ flex: 1, accentColor: candidateScore >= 70 ? "#10b981" : "#ef4444" }} />
              <span style={{
                fontFamily: "monospace", fontWeight: 700, fontSize: "1.1rem",
                color: candidateScore >= 70 ? "#10b981" : "#ef4444", minWidth: "3rem"
              }}>{candidateScore}</span>
              <span style={{
                fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "99px",
                background: candidateScore >= 70 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: candidateScore >= 70 ? "#10b981" : "#ef4444"
              }}>
                {candidateScore >= 70 ? "PASSES" : "FAILS"} threshold
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Compared privately via <code>candidateScoreProof()</code> ZK witness — score never disclosed on-chain
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Certification Record / Assessment Data
            </label>
            <textarea id="certRecord" value={certRecord} onChange={e => setCertRecord(e.target.value)}
              placeholder="Paste your assessment details (hashed locally via certificationRecordHash() before ZK proof)"
              rows={4} style={{ resize: "vertical" }} />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Content is hashed locally — only the hash enters the <code>certificationRecordHash()</code> ZK proof
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button type="submit" className="btn-primary" disabled={loading} id="submitCertBtn">
              {loading ? <><span className="spinner" /> Generating ZK Proof...</> : "Issue Certificate (ZK Proof)"}
            </button>
            <Link href="/" className="btn-secondary">Back to Dashboard</Link>
          </div>
        </form>
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

      {/* ── Error ── */}
      {error && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
          <p style={{ color: "#fca5a5", fontWeight: 600 }}>Error</p>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem", fontSize: "0.9rem" }}>{error}</p>
        </div>
      )}

      {/* ── Success Result ── */}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>✅ Certificate Issued Successfully!</p>
          {[
            { label: "Circuit", value: "issueCertificate(Bytes<32>)" },
            { label: "ZK Commitment", value: result.commitmentHex },
            { label: "On-Chain TxHash", value: result.txHash },
            { label: "Score Threshold", value: result.scoreThresholdMet ? "✅ Met (private)" : "❌ Not Met" },
            { label: "Signed By", value: result.signedBy },
            { label: "Tx Fee", value: `${result.txFee} ${result.txFeeAsset}` },
            { label: "Wallet Funded", value: result.walletFunded ? "Yes" : "No (may be unfunded)" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", minWidth: 140 }}>{label}:</span>
              <span style={{ fontSize: "0.8rem", color: "#f1f5f9", fontFamily: "monospace", wordBreak: "break-all" }}>{value as string}</span>
            </div>
          ))}
          <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.75rem", fontWeight: 600 }}>Status: CONFIRMED (Midnight Preview)</p>
        </div>
      )}

      {/* ── Verify Certificate Section ── */}
      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Verify Certificate — verifyCertificate(Bytes&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>
          Publicly verify whether a claimed ZK commitment matches the most recent on-chain certified commitment.
        </p>
        <form onSubmit={handleVerify} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input type="text" id="claimedCommitment" value={claimedCommitment}
            onChange={e => setClaimedCommitment(e.target.value)}
            placeholder="0x... claimed commitment hash"
            style={{ flex: 1, minWidth: "200px" }} />
          <button type="submit" className="btn-secondary" disabled={verifyLoading} id="verifyBtn" style={{ whiteSpace: "nowrap" }}>
            {verifyLoading ? <><span className="spinner" /> Verifying...</> : "Verify On-Chain"}
          </button>
        </form>
        {verifyResult && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px",
            background: verifyResult.matches ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${verifyResult.matches ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
            <p style={{ color: verifyResult.matches ? "#6ee7b7" : "#fca5a5", fontWeight: 700, marginBottom: "0.5rem" }}>
              {verifyResult.matches ? "✅ VALID — Commitment Verified On-Chain" : "❌ INVALID — Commitment Mismatch"}
            </p>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>TxHash: <span style={{ color: "#f1f5f9", fontFamily: "monospace" }}>{verifyResult.txHash}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}