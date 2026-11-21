import type { CallRecording, Evidence } from '../types';

export type HashableEvidence = Pick<
  Evidence,
  'id' | 'sender' | 'receivedAt' | 'category' | 'text'
>;

export type HashableCall = Pick<
  CallRecording,
  'id' | 'callerNumber' | 'startedAt' | 'durationMs' | 'audioSha256'
>;

/**
 * The canonical string is deliberately stable and human-inspectable.
 * Changing any field changes the SHA-256 digest, which is the whole point.
 */
export function canonicalEvidenceString(evidence: HashableEvidence): string {
  return [
    'mehfooz:v1',
    evidence.id,
    evidence.sender,
    evidence.receivedAt,
    evidence.category,
    evidence.text,
  ].join('|');
}

export function canonicalCallString(call: HashableCall): string {
  return [
    'mehfooz:call:v1',
    call.id,
    call.callerNumber,
    call.startedAt,
    String(call.durationMs),
    call.audioSha256,
  ].join('|');
}
