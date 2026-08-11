"use client";
import Link from "next/link";
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from "../../lib/contract";

export default function InspectorPage() {
  const circuits = [
    { name: "issueCertificate", params: "expectedSkillId: Bytes<32>", returns: "Bytes<32>", privacy: "Anonymous", desc: "Submits candidate skill certification commitment. Generates ZK proof using private witnesses (candidate key, nonce, record hash)." },
    { name: "resetCertification", params: "newSkillId: Bytes<32>", returns: "Bytes<32>", privacy: "Issuer", desc: "Updates the on-chain skill identifier. Only callable by the issuer deployer wallet." },
    { name: "incrementSession", params: "(none)", returns: "[]", privacy: "Issuer", desc: "Increments the activeSession epoch counter, rotating the certification window." },
  ];

  const witnesses = [
    { name: "candidateSecretKey()", type: "Bytes<32>", desc: "Private candidate identity key — never leaves the device" },
    { name: "scoreProofNonce()", type: "Bytes<32>", desc: "Random nonce for certification uniqueness" },
    { name: "certificationRecordHash()", type: "Bytes<32>", desc: "Local hash of assessment score record" },
  ];

  const ledger = [
    { name: "certificateCount", type: "Counter", visibility: "Public" },
    { name: "skillId", type: "Bytes<32>", visibility: "Public" },
    { name: "lastCertificationCommitment", type: "Bytes<32>", visibility: "Public" },
    { name: "activeSession", type: "Counter", visibility: "Public" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Inspector</span>
          <span className="badge badge-amber">Compact v0.23</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Contract Inspector</h1>
        <p className="section-desc">Inspect the Private Skill Certification Compact smart contract — circuits, ledger state, and ZK witness functions.</p>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Contract", value: "Private Skill Certification" },
            { label: "Language", value: "Compact v0.23" },
            { label: "Network", value: "Midnight Preview" },
            { label: "Address", value: String(CONTRACT_ADDRESS).substring(0, 20) + "..." },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>{label}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f1f5f9", fontFamily: "monospace" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "0", marginBottom: "1.5rem" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 700 }}>Exported Circuits</div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {circuits.map(c => (
            <div key={c.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                <code style={{ fontFamily: "monospace", fontWeight: 700, color: "#a78bfa" }}>{c.name}({c.params})</code>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>-&gt; {c.returns}</span>
                <span className={`badge ${c.privacy === "Anonymous" ? "badge-green" : "badge-amber"}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{c.privacy}</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "0", marginBottom: "1.5rem" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 700 }}>Private ZK Witnesses</div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {witnesses.map(w => (
            <div key={w.name} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <code style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#06b6d4", flexShrink: 0, minWidth: 200 }}>{w.name}</code>
              <span style={{ fontSize: "0.75rem", color: "#a78bfa", background: "rgba(139,92,246,0.1)", padding: "0.1rem 0.5rem", borderRadius: 6, flexShrink: 0 }}>{w.type}</span>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{w.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "0", marginBottom: "1.5rem" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 700 }}>Ledger State Fields</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Field", "Type", "Visibility"].map(h => <th key={h} style={{ padding: "0.75rem 1.5rem", textAlign: "left", color: "#64748b", fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {ledger.map((row, i) => (
                <tr key={row.name} style={{ borderBottom: i < ledger.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td style={{ padding: "0.75rem 1.5rem", fontFamily: "monospace", color: "#a78bfa" }}>{row.name}</td>
                  <td style={{ padding: "0.75rem 1.5rem", fontFamily: "monospace", color: "#f1f5f9" }}>{row.type}</td>
                  <td style={{ padding: "0.75rem 1.5rem" }}><span className="badge badge-green" style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{row.visibility}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <a href={NETWORK_CONFIG.explorerUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: "0.85rem" }}>View on Midnight Explorer</a>
        <Link href="/" className="btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
}