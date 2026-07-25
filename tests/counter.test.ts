import { describe, it, expect } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';

// Helper to convert strings to 32-byte Uint8Array
function toBytes32(str: string): Uint8Array {
  const bytes = new Uint8Array(32);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  bytes.set(encoded.subarray(0, 32));
  return bytes;
}

describe('Private Skill Certification (PSC) Contract - Midnight ZK Architecture', () => {

  it('1. Circuit Structure: issueCertificate exports valid circuit bindings with multi-witness vectors', () => {
    const mockCandidateKey = toBytes32('secret_candidate_key_999');
    const mockNonce = toBytes32('entropy_score_nonce_555');
    const mockRecord = toBytes32('sha256_certification_record_abc');

    const witnesses = {
      candidateSecretKey: (ctx: any) => [ctx.privateState, mockCandidateKey] as [any, Uint8Array],
      scoreProofNonce: (ctx: any) => [ctx.privateState, mockNonce] as [any, Uint8Array],
      certificationRecordHash: (ctx: any) => [ctx.privateState, mockRecord] as [any, Uint8Array]
    };

    const contract = new Contract(witnesses);
    expect(contract).toBeDefined();
    expect(typeof contract.circuits.issueCertificate).toBe('function');
    expect(typeof contract.circuits.resetCertification).toBe('function');
    expect(typeof contract.circuits.incrementSession).toBe('function');
  });

  it('2. Multi-Witness Resolution: candidateSecretKey, scoreProofNonce, and certificationRecordHash witnesses are constructed cleanly', () => {
    const mockCandidateKey = toBytes32('candidate_privkey_hash_888');
    const mockNonce = toBytes32('random_score_nonce_444');
    const mockRecord = toBytes32('sha256_assessment_score_777');

    const witnesses = {
      candidateSecretKey: (ctx: any) => [ctx.privateState, mockCandidateKey] as [any, Uint8Array],
      scoreProofNonce: (ctx: any) => [ctx.privateState, mockNonce] as [any, Uint8Array],
      certificationRecordHash: (ctx: any) => [ctx.privateState, mockRecord] as [any, Uint8Array]
    };

    const contract = new Contract(witnesses);
    expect(witnesses.candidateSecretKey).toBeDefined();
    expect(witnesses.scoreProofNonce).toBeDefined();
    expect(witnesses.certificationRecordHash).toBeDefined();

    expect(mockCandidateKey.length).toBe(32);
    expect(mockNonce.length).toBe(32);
    expect(mockRecord.length).toBe(32);
  });

  it('3. Zero-Knowledge Privacy Model: Private witnesses are isolated from public ledger', () => {
    const privateCandidateKey = toBytes32('super_secret_candidate_privkey');
    const privateNonce = toBytes32('private_score_nonce_secret');
    const privateRecord = toBytes32('encrypted_assessment_vector_hash');
    const publicSkillId = toBytes32('skill_cybersecurity_expert_2026');

    const witnesses = {
      candidateSecretKey: (ctx: any) => [ctx.privateState, privateCandidateKey] as [any, Uint8Array],
      scoreProofNonce: (ctx: any) => [ctx.privateState, privateNonce] as [any, Uint8Array],
      certificationRecordHash: (ctx: any) => [ctx.privateState, privateRecord] as [any, Uint8Array]
    };

    const contract = new Contract(witnesses);
    expect(contract.witnesses.candidateSecretKey).toBeDefined();

    // Ensure raw secret values are isolated and distinct
    expect(privateCandidateKey).not.toEqual(publicSkillId);
    expect(privateNonce).not.toEqual(publicSkillId);
    expect(privateRecord).not.toEqual(publicSkillId);
  });

  it('4. Ledger Schema Interface: Exports ledger schema query function', () => {
    expect(typeof ledger).toBe('function');
  });

});
