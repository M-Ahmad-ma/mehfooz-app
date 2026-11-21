/**
 * Pakistani-friendly normalization. 0300..., +92300..., 0092300... and
 * 92300... all become +92300.... Other country codes are kept as +digits.
 * Keep this in sync with CallStore.normalizeNumber in the native module.
 */
export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  let national = digits;
  if (digits.startsWith('0092') && digits.length > 4) {
    national = digits.slice(4);
  } else if (digits.startsWith('92') && digits.length >= 12) {
    national = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length >= 10) {
    national = digits.slice(1);
  }

  if (national.length === 10 && national.startsWith('3')) {
    return `+92${national}`;
  }

  return `+${digits}`;
}

export function isValidPhoneNumber(raw: string): boolean {
  const normalized = normalizePhoneNumber(raw);
  return normalized.length >= 8 && normalized.length <= 16;
}

export function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}
