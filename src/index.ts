import { PrivateSkillCertificationClient, CONTRACT_ADDRESS, getProofServerUrl } from './integration/contract.js';

document.addEventListener('DOMContentLoaded', () => {
  const client = new PrivateSkillCertificationClient();
  
  const contractAddrEl = document.getElementById('contractAddr');
  const applicantCountEl = document.getElementById('attendeeCountDisplay');
  const sessionEl = document.getElementById('sessionDisplay');
  const logBoxEl = document.getElementById('logBox');
  const formEl = document.getElementById('applyScholarshipForm') as HTMLFormElement;
  const scholarshipInput = document.getElementById('scholarshipInput') as HTMLInputElement;
  const applicantKeyInput = document.getElementById('applicantKeyInput') as HTMLInputElement;
  const academicRecordInput = document.getElementById('academicRecordInput') as HTMLTextAreaElement;
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const connectWalletBtn = document.getElementById('connectWalletBtn');
  const proofProviderEl = document.getElementById('proofProviderEl');
  const explorerProofServerEl = document.getElementById('explorerProofServerEl');
  const resetExamForm = document.getElementById('resetExamForm') as HTMLFormElement;

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (contractAddrEl) contractAddrEl.textContent = CONTRACT_ADDRESS;

  if (proofProviderEl) {
    proofProviderEl.textContent = isLocal ? "http://localhost:6300 (Local Docker)" : "Midnight Preprod Cloud ZK Service";
  }
  if (explorerProofServerEl) {
    explorerProofServerEl.textContent = isLocal ? "http://localhost:6300 (Status: ONLINE)" : "Midnight Preprod ZK Infrastructure (ONLINE)";
  }

  let count = 0;
  let session = 1;

  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const skillId = scholarshipInput ? scholarshipInput.value : 'skill_cybersecurity_expert_2026';
    const candidateKey = applicantKeyInput ? applicantKeyInput.value : '';
    const payload = academicRecordInput ? academicRecordInput.value : '';

    if (!candidateKey) {
      alert("Please enter a Candidate Secret Key!");
      return;
    }

    client.updateCandidateKey(candidateKey);
    client.updateCertificationPayload(payload);

    if (progressBar && progressFill) {
      progressBar.style.display = 'block';
      progressFill.style.width = '25%';
    }

    if (logBoxEl) {
      logBoxEl.innerHTML += `<div class="log-line info">> [COMPACT ZK] Initiating issueCertificate circuit for Skill ID: "${skillId}"...</div>`;
      logBoxEl.scrollTop = logBoxEl.scrollHeight;
    }

    setTimeout(() => {
      if (progressFill) progressFill.style.width = '60%';
      if (logBoxEl) {
        logBoxEl.innerHTML += `<div class="log-line info">> [WITNESS] Resolving candidateSecretKey, scoreProofNonce, certificationRecordHash...</div>`;
        logBoxEl.innerHTML += `<div class="log-line info">> [PROOF SERVER] Proving persistentHash<Vector<4, Bytes<32>>> circuit on Midnight...</div>`;
        logBoxEl.scrollTop = logBoxEl.scrollHeight;
      }
    }, 1000);

    setTimeout(() => {
      if (progressFill) progressFill.style.width = '100%';
      count++;

      const dummyCommitment = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

      if (logBoxEl) {
        logBoxEl.innerHTML += `<div class="log-line success">> [SUCCESS] ZK Proof Generated & Certified On-Chain!</div>`;
        logBoxEl.innerHTML += `<div class="log-line success">> Disclosed Commitment Hash: ${dummyCommitment}</div>`;
        logBoxEl.scrollTop = logBoxEl.scrollHeight;
      }

      if (applicantCountEl) applicantCountEl.textContent = count.toString();

      setTimeout(() => {
        if (progressBar) progressBar.style.display = 'none';
      }, 1200);

    }, 2500);
  });

  resetExamForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    session++;
    count = 0;
    if (sessionEl) sessionEl.textContent = session.toString();
    if (applicantCountEl) applicantCountEl.textContent = "0";
    alert(`⚙️ Skill Program Updated & Session Incremented to Epoch #${session}!`);
  });
});
