"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getClient, CONTRACT_ADDRESS, NETWORK_CONFIG } from "../lib/contract";
import styles from "./page.module.css";

export default function HomeClient() {
  const [stats, setStats] = useState({ certificateCount: 0, skillId: "—", lastCertificationCommitment: "—", activeSession: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient().fetchPublicState().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}><span>🌕</span><span>Midnight Network — Preview Testnet</span></div>
        <h1 className={styles.heroTitle}>Private Skill<br /><span className={styles.heroGradient}>Certification dApp</span></h1>
        <p className={styles.heroDesc}>Issue and verify professional certifications using <strong>zero-knowledge proofs</strong> on the Midnight Network. Your assessment score and identity stay private — only a commitment is recorded on-chain.</p>
        <div className={styles.heroCTA}>
          <Link href="/submit" className="btn-primary" style={{fontSize:"1rem",padding:"0.75rem 2rem"}}>📜 Issue Certificate →</Link>
          <Link href="/explorer" className="btn-secondary" style={{fontSize:"1rem",padding:"0.75rem 2rem"}}>🔍 View On-Chain State</Link>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <div className="glass-card stat-card fade-in">
          <div className="stat-label">Total Certificates</div>
          <div className="stat-value">{loading ? "…" : stats.certificateCount}</div>
          <div style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>On-chain counter</div>
        </div>
        <div className="glass-card stat-card fade-in">
          <div className="stat-label">Active Session</div>
          <div className="stat-value">{loading ? "…" : stats.activeSession}</div>
          <div style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Epoch counter</div>
        </div>
        <div className="glass-card stat-card fade-in">
          <div className="stat-label">Current Skill ID</div>
          <div style={{fontSize:"1rem",fontWeight:600,color:"#a78bfa",marginTop:"0.25rem",wordBreak:"break-all"}}>{loading ? "…" : stats.skillId}</div>
          <div style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Active skill identifier</div>
        </div>
        <div className="glass-card stat-card fade-in">
          <div className="stat-label">Network</div>
          <div style={{fontSize:"1rem",fontWeight:600,color:"#10b981",marginTop:"0.25rem"}}>Midnight Preview</div>
          <div style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>ZK Testnet</div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className="glass-card" style={{padding:"1.5rem"}}>
          <h2 className="section-title" style={{fontSize:"1.1rem",marginBottom:"1rem"}}>📡 Contract Details</h2>
          <div className={styles.infoGrid}>
            <div>
              <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>Contract Address</div>
              <div style={{fontFamily:"monospace",fontSize:"0.75rem",color:"#a78bfa",wordBreak:"break-all"}}>{CONTRACT_ADDRESS}</div>
            </div>
            <div>
              <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>Explorer</div>
              <a href={NETWORK_CONFIG.explorerUrl} target="_blank" rel="noreferrer" style={{color:"#06b6d4",fontSize:"0.8rem",wordBreak:"break-all"}}>🔍 View on Midnight Preview Explorer ↗</a>
            </div>
            <div>
              <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>Indexer</div>
              <span style={{color:"var(--text-secondary)",fontSize:"0.8rem"}}>{NETWORK_CONFIG.indexerUrl}</span>
            </div>
            <div>
              <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginBottom:"0.25rem",textTransform:"uppercase",letterSpacing:"0.08em"}}>Faucet</div>
              <a href={NETWORK_CONFIG.faucetUrl} target="_blank" rel="noreferrer" style={{color:"#06b6d4",fontSize:"0.8rem"}}>💧 Get Test Tokens ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.navCards}>
        {[
          { href:"/submit", icon:"📜", title:"Issue Certificate", desc:"Anonymously issue skill certificates with ZK proof commitment." },
          { href:"/admin", icon:"⚙️", title:"Admin Panel", desc:"Issuer controls — reset skill ID, increment session counter." },
          { href:"/explorer", icon:"🔭", title:"Chain Explorer", desc:"View real on-chain public ledger state from Midnight indexer." },
          { href:"/inspector", icon:"🔬", title:"Inspector", desc:"Inspect Compact smart contract circuits, ledger schema and witnesses." },
        ].map(card => (
          <Link key={card.href} href={card.href} className={`glass-card ${styles.navCard}`}>
            <div className={styles.navCardIcon}>{card.icon}</div>
            <h3 className={styles.navCardTitle}>{card.title}</h3>
            <p className={styles.navCardDesc}>{card.desc}</p>
            <div className={styles.navCardArrow}>→</div>
          </Link>
        ))}
      </section>
    </div>
  );
}