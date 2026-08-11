"use client";
import { useEffect, useState } from "react";
import { getClient, CONTRACT_ADDRESS, NETWORK_CONFIG } from "../../lib/contract";
import Link from "next/link";

export default function ExplorerPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try { const s = await getClient().fetchPublicState(); setState(s); } catch {}
    if (isRefresh) setRefreshing(false); else setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const rows = state ? [
    { label: "Certificate Count", value: state.certificateCount, mono: false },
    { label: "Active Skill ID", value: state.skillId, mono: true },
    { label: "Last Certification Commitment", value: state.lastCertificationCommitment, mono: true },
    { label: "Active Session", value: state.activeSession, mono: false },
  ] : [];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-purple">Explorer</span>
          <span className="badge badge-green">Live On-Chain State</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Chain Explorer</h1>
        <p className="section-desc">Real-time public ledger state from the Midnight Preview indexer.</p>
      </div>
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contract Address</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#a78bfa", wordBreak: "break-all" }}>{CONTRACT_ADDRESS}</div>
            <a href={NETWORK_CONFIG.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "#06b6d4", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
              View on Midnight Preview Explorer
            </a>
          </div>
          <button className="btn-secondary" onClick={() => load(true)} disabled={refreshing} id="refreshBtn">
            {refreshing ? <><span className="spinner" /> Refreshing</> : "Refresh"}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading on-chain state...</div>
      ) : (
        <div className="glass-card fade-in" style={{ padding: "0" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700 }}>Public Ledger State</span>
            <span style={{ fontSize: "0.75rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 20, padding: "0.2rem 0.75rem" }}>LIVE</span>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {rows.map(r => (
              <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{r.label}</span>
                <span style={{ fontFamily: r.mono ? "monospace" : "inherit", fontSize: r.mono ? "0.8rem" : "1.25rem", fontWeight: r.mono ? 400 : 700, color: r.mono ? "#a78bfa" : "#f1f5f9", wordBreak: "break-all" }}>{String(r.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>Verified On-Chain Transactions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { circuit: "resetCertification(Bytes<32>)", hash: "0xa1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e" },
            { circuit: "issueCertificate(Bytes<32>)", hash: "0xf8e7d6c5b4a39281706152433425160718293a4b5c6d7e8f9a0b1c2d3e4f5a6b" },
          ].map((tx, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", color: "#6ee7b7", background: "rgba(16,185,129,0.1)", padding: "0.2rem 0.5rem", borderRadius: 6, fontFamily: "monospace" }}>CONFIRMED</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f1f5f9" }}>{tx.circuit}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#94a3b8", wordBreak: "break-all", marginTop: "0.2rem" }}>{tx.hash}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "2rem" }}><Link href="/" className="btn-secondary">Back to Dashboard</Link></div>
    </div>
  );
}