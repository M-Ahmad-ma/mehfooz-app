import type { Evidence } from '../types';

export type HashableEvidence = Pick<
  Evidence,
  'id' | 'sender' | 'receivedAt' | 'category' | 'text'
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
