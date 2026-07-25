import { Contract, type Ledger, type Witnesses } from '../../managed/contract/index.js';

/**
 * ============================================================================
 * PRIVATE SKILL CERTIFICATION (PSC) INTEGRATION CONFIG - BROWSER WALLET
 * ============================================================================
 * Connected smart contract address on Midnight Preprod Testnet.
 * Deploy locally via WSL: npx tsx src/integration/deploy.ts
 */
export const CONTRACT_ADDRESS = "0xc7d85c17abdd4f53371cbf7410b607383c663ec0";

export const getProofServerUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return "https://indexer.preprod.midnight.network";
  }
  return "http://localhost:6300";
};

export const NETWORK_CONFIG = {
  networkId: "preprod",
  indexerUrl: "https://indexer.preprod.midnight.network",
  proofServerUrl: getProofServerUrl(),
  nodeUrl: "https://rpc.preprod.midnight.network",
  faucetUrl: "https://faucet.preprod.midnight.network"
};

export interface CandidatePrivateState {
  candidateSecretKey: Uint8Array;
  scoreProofNonce: Uint8Array;
  certificationRecordHash: Uint8Array;
}

export type PSCWitnesses = Witnesses<CandidatePrivateState>;

export function createPrivateWitnesses(state: CandidatePrivateState): PSCWitnesses {
  return {
    candidateSecretKey: (context) => [state, state.candidateSecretKey],
    scoreProofNonce: (context) => [state, state.scoreProofNonce],
    certificationRecordHash: (context) => [state, state.certificationRecordHash]
  };
}

export class PrivateSkillCertificationClient {
  private contract: Contract<CandidatePrivateState>;
  private privateState: CandidatePrivateState;

  constructor(initialState?: Partial<CandidatePrivateState>) {
    this.privateState = {
      candidateSecretKey: initialState?.candidateSecretKey || new Uint8Array(32).fill(1),
      scoreProofNonce: initialState?.scoreProofNonce || new Uint8Array(32).fill(2),
      certificationRecordHash: initialState?.certificationRecordHash || new Uint8Array(32).fill(3)
    };

    const witnesses = createPrivateWitnesses(this.privateState);
    this.contract = new Contract(witnesses);
  }

  public updateCandidateKey(secretKeyHex: string): void {
    const bytes = new TextEncoder().encode(secretKeyHex.padEnd(32, '0').slice(0, 32));
    this.privateState.candidateSecretKey = bytes;
  }

  public updateCertificationPayload(payload: string): void {
    const bytes = new TextEncoder().encode(payload.padEnd(32, '0').slice(0, 32));
    this.privateState.certificationRecordHash = bytes;
  }

  public getPrivateState(): CandidatePrivateState {
    return { ...this.privateState };
  }

  public getContract(): Contract<CandidatePrivateState> {
    return this.contract;
  }

  public formatBytes32(str: string): Uint8Array {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    const result = new Uint8Array(32);
    result.set(encoded.slice(0, 32));
    return result;
  }

  public bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
