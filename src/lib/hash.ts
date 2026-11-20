import * as Crypto from 'expo-crypto';

import type { Evidence } from '../types';

import { canonicalEvidenceString, type HashableEvidence } from './canonical';

export { canonicalEvidenceString } from './canonical';
export type { HashableEvidence } from './canonical';

export async function sha256Hex(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

export async function sealEvidence(evidence: HashableEvidence): Promise<string> {
  return sha256Hex(canonicalEvidenceString(evidence));
}

export async function verifyEvidence(evidence: Evidence): Promise<boolean> {
  const digest = await sealEvidence(evidence);
  return digest === evidence.sha256;
}
