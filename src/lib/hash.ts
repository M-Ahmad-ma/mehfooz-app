import * as Crypto from 'expo-crypto';

import type { CallRecording, Evidence } from '../types';

import {
  canonicalCallString,
  canonicalEvidenceString,
  type HashableCall,
  type HashableEvidence,
} from './canonical';

export { canonicalCallString, canonicalEvidenceString } from './canonical';
export type { HashableCall, HashableEvidence } from './canonical';

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


export async function sealCallRecording(call: HashableCall): Promise<string> {
  return sha256Hex(canonicalCallString(call));
}

export async function verifyCallRecording(call: CallRecording): Promise<boolean> {
  return (await sealCallRecording(call)) === call.sha256;
}
