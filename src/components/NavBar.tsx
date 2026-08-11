"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./NavBar.module.css";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/submit", label: "Issue Certificate" },
  { href: "/admin", label: "Admin" },
  { href: "/explorer", label: "Explorer" },
  { href: "/inspector", label: "Inspector" },
];

export default function NavBar({ walletAddress, onConnect, onDisconnect, connecting }: {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const shortAddr = walletAddress ? `${walletAddress.substring(0, 12)}...${walletAddress.slice(-6)}` : null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📜</span>
          <span className={styles.logoText}>PSC<span className={styles.logoSub}>dApp</span></span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`${styles.navLink} ${pathname === l.href ? styles.active : ""}`} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.netPill}>
            <span className={styles.netDot} />
            <span>Preview</span>
          </div>
          {walletAddress ? (
            <button className="btn-secondary" onClick={onDisconnect} title={walletAddress}>
              🔗 {shortAddr}
            </button>
          ) : (
            <button className="btn-primary" onClick={onConnect} disabled={connecting}>
              {connecting ? <><span className="spinner" /> Connecting...</> : "Connect Wallet"}
            </button>
          )}
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}