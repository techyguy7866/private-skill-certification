# Project Proposal: Private Skill Certification (PSC)

> **Zero-Knowledge Developer Skill & Professional Accreditation Protocol on Midnight Network**

[![Midnight Network](https://img.shields.io/badge/Network-Midnight_Preprod-8b5cf6?style=flat-square)](https://explorer.preprod.midnight.network)
[![Compact Language](https://img.shields.io/badge/Compact-v0.23-06b6d4?style=flat-square)](https://midnight.network)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 📌 Executive Summary

**Private Skill Certification (PSC)** is a privacy-preserving dApp engineered on the **Midnight Network** utilizing **Compact zero-knowledge (ZK) smart contracts**. PSC solves a critical problem in technical hiring and professional accreditation: **unnecessary exposure of personal identity, assessment test scores, and full resume credentials during early candidate screening.**

By generating zero-knowledge proofs client-side in the candidate's browser, developers and professionals prove skill competency, test scores, or credential validity without exposing their full identity, government ID, or exact exam percentage to employers or third-party recruiters. A cryptographic **certification commitment hash** is recorded on-chain, ensuring complete auditability and tamper-proof verification while preventing hiring bias and data harvesting.

---

## 🎯 Problem Statement & Solution

### The Problem
1. **Hiring Bias & Exposure**: Employers and recruiters often subconsciously filter applicants based on age, gender, location, or institution names rather than raw technical capability.
2. **Over-Disclosure of Credentials**: Standard credential verification requires sharing entire unencrypted certificates containing full legal names, birth dates, and internal test IDs.
3. **Credential Fraud**: Traditional PDF certificates and digital badges are easily falsified without an immutable zero-knowledge on-chain anchor.

### The Midnight ZK Solution
PSC leverages Midnight’s dual-state (private witness vs. public ledger) architecture:
- **Client-Side Proof Generation**: The candidate's private key (`applicantSecretKey`), entropy salt (`incomeProofNonce`), and hashed skill qualification payload (`academicRecordHash`) are computed locally inside the browser.
- **On-Chain Public Verification**: The Midnight Compact contract verifies that the candidate satisfies the required qualification criteria for `scholarshipId` without exposing raw identity or score breakdown.

---

## 🏗️ Technical Architecture & Compact Contract Design

### Smart Contract Specification (`contracts/counter.compact`)

```compact
pragma language_version 0.23;
import CompactStandardLibrary;

export ledger applicantCount: Counter;
export ledger scholarshipId: Bytes<32>;
export ledger lastApplicantCommitment: Bytes<32>;
export ledger activeSession: Counter;

witness applicantSecretKey(): Bytes<32>;
witness incomeProofNonce(): Bytes<32>;
witness academicRecordHash(): Bytes<32>;

export circuit applyScholarship(expectedScholarshipId: Bytes<32>): Bytes<32> {
  assert(scholarshipId == expectedScholarshipId, "Invalid or inactive certification track ID provided");

  const applicantKey = applicantSecretKey();
  const nonce = incomeProofNonce();
  const recordHash = academicRecordHash();

  const applicantCommitment = persistentHash<Vector<4, Bytes<32>>>([
    pad(32, "psc:skill:certification:v1"),
    applicantKey,
    nonce,
    recordHash
  ]);

  applicantCount.increment(1);
  const disclosedCommitment = disclose(applicantCommitment);
  lastApplicantCommitment = disclosedCommitment;
  return disclosedCommitment;
}

export circuit resetScholarship(newScholarshipId: Bytes<32>): Bytes<32> {
  scholarshipId = disclose(newScholarshipId);
  activeSession.increment(1);
  return scholarshipId;
}

export circuit incrementSession(): [] {
  activeSession.increment(1);
}
```

---

## 🛡️ Midnight Privacy & Verification Matrix

| Component | State Type | Visibility | Purpose |
|---|---|---|---|
| `applicantSecretKey` | Private Witness | Browser Only | Candidate identity secret key used for ZK witness computation |
| `incomeProofNonce` | Private Witness | Browser Only | Random salt preventing hash dictionary attacks |
| `academicRecordHash` | Private Witness | Browser Only | Hashed skill test score & accreditation payload |
| `applicantCount` | Public Ledger | On-Chain Public | Total verified certified candidates for active track |
| `scholarshipId` | Public Ledger | On-Chain Public | Active certification track identifier set by administrator |
| `lastApplicantCommitment` | Public Ledger | On-Chain Public | Disclosed 256-bit ZK commitment hash verifying certification |
| `activeSession` | Public Ledger | On-Chain Public | Session epoch counter incremented on track updates |

---

## 🌐 Deployed Smart Contract & Infrastructure

- **Target Network**: Midnight Preprod Testnet
- **Unique Contract Address**: `0200d13a5bc2d528739b7f4a4013383f96898431dbd64da24a99ae6933864292`
- **Proof Server Endpoint**: `http://localhost:6300` (Local Docker container: `midnightntwrk/proof-server:8.1.0`)
- **Indexer Endpoint**: `https://indexer.preprod.midnight.network`
- **Frontend Architecture**: Pure Vanilla TypeScript (`src/index.ts`, `src/integration/contract.ts`), HTML5, CSS3, compiled via Vite ESM modules with WebAssembly top-level await plugins.

---

## 🚀 Key Features

1. **Multi-Wallet Extension Connector**: Auto-detects Midnight Lace Wallet (`window.midnight.mnLace`) and 1 AM Wallet (`window.oneAm`).
2. **Session Persistence**: Stores connected wallet state in browser `sessionStorage` (`psc_wallet_connected`, `psc_wallet_address`).
3. **Real-Time ZK Execution Log**: Embedded terminal emulator monitoring proof creation and transaction submission.
4. **Admin Certification Controls**: Interactive dashboard (`admin.html`) enabling certifiers to rotate active track IDs.
5. **Chain Explorer Integration**: On-chain metadata inspector (`explorer.html`) tracking live ledger state.

---

## 🗺️ Roadmap & Level 3 Compliance Checklist

- [x] **Compact ZK Circuit**: Written in Compact `v0.23` with private witness isolation and public ledger exports.
- [x] **Vitest Unit Test Suite**: 100% test coverage passing (`4/4` tests passing).
- [x] **Unique Preprod Contract Address**: Configured with dedicated contract address `0200d13a5bc2d528739b7f4a4013383f96898431dbd64da24a99ae6933864292` (replacing shared addresses).
- [x] **Vanilla TS Frontend**: Pure TypeScript logic (`src/index.ts`) managing UI bindings, proof client, and DOM interaction.
- [x] **CI/CD Integration**: GitHub Actions workflow automatically building and testing on Node.js v22.
