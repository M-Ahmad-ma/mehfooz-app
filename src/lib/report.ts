import { ncciaSteps, pecaNote, support } from '../data/complaint';
import { categoryMeta } from '../theme';
import type { CallRecording, Evidence } from '../types';

import { canonicalCallString, canonicalEvidenceString } from './canonical';
import {
  classifierSourceLabel,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDuration,
  shortHash,
  sourceLabel,
} from './format';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function languageClass(evidence: Evidence): string {
  if (evidence.language === 'ur') return 'script script-urdu';
  if (evidence.language === 'ps') return 'script script-pashto';
  return 'script';
}

export function reportCaseRef(items: Evidence[], calls: CallRecording[] = []): string {
  const year = new Date().getFullYear();
  const candidates = [
    ...items.map((item) => ({ at: new Date(item.receivedAt).getTime(), marker: item.sha256 })),
    ...calls.map((call) => ({ at: new Date(call.startedAt).getTime(), marker: call.sha256 })),
  ].sort((a, b) => a.at - b.at);
  const marker = candidates[0]?.marker.slice(0, 6).toUpperCase() ?? 'DEMO';
  return `MHF-${year}-${marker}`;
}

export function reportSummary(items: Evidence[], calls: CallRecording[] = []) {
  const senders = Array.from(new Set(items.map((item) => item.sender)));
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const rangeItems = [
    ...items.map((item) => ({ receivedAt: item.receivedAt })),
    ...calls.map((call) => ({ receivedAt: call.startedAt })),
  ];
  return {
    count: items.length,
    callCount: calls.length,
    senders,
    categories,
    range: formatDateRange(rangeItems),
    caseRef: reportCaseRef(items, calls),
  };
}

export type ReportImage = { base64: string; mimeType: string };
export type ReportImages = Record<string, ReportImage>;

export function buildReportHtml(
  items: Evidence[],
  images: ReportImages = {},
  calls: CallRecording[] = [],
): string {
  const sorted = [...items].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  );
  const sortedCalls = [...calls].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );
  const summary = reportSummary(sorted, sortedCalls);
  const generatedAt = formatDateTime(new Date().toISOString());
  const categoryList = summary.categories
    .map((category) => categoryMeta[category].label)
    .join(', ');

  const evidenceHtml = sorted
    .map((item, index) => {
      const meta = categoryMeta[item.category];
      const canonical = canonicalEvidenceString(item);
      return `
        <section class="evidence">
          <div class="evidence-head">
            <div>
              <span class="record">Record ${String(index + 1).padStart(2, '0')}</span>
              <span class="badge" style="color:${meta.fg};background:${meta.bg};">${escapeHtml(meta.label)}</span>
            </div>
            <span class="muted">${escapeHtml(formatDateTime(item.receivedAt))}</span>
          </div>
          <div class="meta-row">
            <span><strong>Sender:</strong> ${escapeHtml(item.sender)}</span>
            <span><strong>Source:</strong> ${escapeHtml(sourceLabel(item.source, item.appLabel))}</span>
            <span><strong>Classifier:</strong> ${escapeHtml(classifierSourceLabel(item.classifierSource, item.modelVersion))}</span>
            <span><strong>Confidence:</strong> ${Math.round(item.confidence * 100)}%</span>
          </div>
          ${images[item.id] ? `<img class="evidence-image" src="data:${images[item.id].mimeType};base64,${images[item.id].base64}" alt="Shared screenshot evidence" />` : ''}
          <div class="${languageClass(item)}" dir="auto">${escapeHtml(item.text)}</div>
          <div class="hash-label">Text SHA-256 · sealed ${escapeHtml(formatDateTime(item.addedAt))}</div>
          <div class="hash">${escapeHtml(item.sha256)}</div>
          ${item.imageSha256 ? `<div class="hash-label">Image SHA-256</div><div class="hash">${escapeHtml(item.imageSha256)}</div>` : ''}
          <div class="canonical">Canonical string: <code>${escapeHtml(canonical)}</code></div>
        </section>`;
    })
    .join('');

  const callsHtml = sortedCalls
    .map((call, index) => {
      const canonical = canonicalCallString(call);
      return `
        <section class="evidence">
          <div class="evidence-head">
            <div>
              <span class="record">Call ${String(index + 1).padStart(2, '0')}</span>
              <span class="badge badge-call">CALL</span>
            </div>
            <span class="muted">${escapeHtml(formatDateTime(call.startedAt))}</span>
          </div>
          <div class="meta-row">
            <span><strong>Caller:</strong> ${escapeHtml(call.callerNumber)}</span>
            <span><strong>Duration:</strong> ${escapeHtml(formatDuration(call.durationMs))}</span>
            <span><strong>Source:</strong> Watchlisted incoming call</span>
          </div>
          <div class="hash-label">Vault SHA-256 · sealed ${escapeHtml(formatDateTime(call.addedAt))}</div>
          <div class="hash">${escapeHtml(call.sha256)}</div>
          <div class="hash-label">Audio file SHA-256</div>
          <div class="hash">${escapeHtml(call.audioSha256)}</div>
          <div class="canonical">Canonical string: <code>${escapeHtml(canonical)}</code></div>
          <p class="muted">Audio is stored on the phone as a separate file. This PDF records its
          metadata and hashes; it does not embed the audio.</p>
        </section>`;
    })
    .join('');

  const stepHtml = ncciaSteps
    .map(
      (step, index) => `
        <li>
          <div class="step-title">${index + 1}. ${escapeHtml(step.title)}</div>
          <div>${escapeHtml(step.body)}</div>
        </li>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Mehfooz Evidence Pack — ${escapeHtml(summary.caseRef)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    color: #10231D;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Naskh Arabic", "Noto Nastaliq Urdu", sans-serif;
    font-size: 10.5px;
    line-height: 1.55;
  }
  .brand { color: #6E7A72; font-size: 9px; letter-spacing: 2.4px; text-transform: uppercase; }
  h1 { color: #0F3D33; font-size: 26px; line-height: 1.15; margin: 6px 0 4px; }
  h2 { color: #0F3D33; font-size: 13px; margin: 22px 0 8px; letter-spacing: 0.2px; }
  .subtitle { color: #4B5B53; font-size: 11px; margin: 0 0 14px; }
  .cover {
    border: 1px solid #DED5C4;
    border-radius: 12px;
    padding: 16px 18px;
    background: #FFFDF8;
    margin-bottom: 14px;
  }
  .cover-grid { display: flex; flex-wrap: wrap; gap: 8px 26px; margin-top: 10px; }
  .cover-grid div { min-width: 140px; }
  .label { color: #6E7A72; font-size: 8.5px; letter-spacing: 1.2px; text-transform: uppercase; }
  .value { font-weight: 600; color: #10231D; }
  .summary { background: #F4EFE6; border-radius: 10px; padding: 12px 14px; margin: 10px 0 16px; }
  .evidence {
    border: 1px solid #DED5C4;
    border-radius: 10px;
    padding: 12px 14px;
    margin: 0 0 10px;
    page-break-inside: avoid;
    background: #FFFDF8;
  }
  .evidence-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 6px; }
  .record { font-weight: 700; font-size: 11px; margin-right: 6px; }
  .badge { display: inline-block; border-radius: 999px; padding: 2px 8px; font-size: 8.5px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .badge-call { color: #0F3D33; background: #E3F0EA; }
  .muted { color: #6E7A72; font-size: 9px; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 4px 18px; color: #4B5B53; font-size: 9.5px; margin-bottom: 7px; }
  .evidence-image { display: block; max-width: 100%; max-height: 190px; border-radius: 8px; border: 1px solid #DED5C4; margin: 7px 0; object-fit: contain; }
  .script { border-left: 2px solid #E9E0D0; padding: 2px 0 2px 10px; margin: 7px 0 9px; font-size: 11px; }
  .script-urdu { font-family: "Noto Nastaliq Urdu", "Noto Naskh Arabic", serif; font-size: 12px; line-height: 2.1; }
  .script-pashto { font-family: "Noto Naskh Arabic", "Noto Nastaliq Urdu", serif; font-size: 11.5px; line-height: 1.9; }
  .hash-label { color: #6E7A72; font-size: 8px; letter-spacing: 1px; text-transform: uppercase; margin-top: 8px; }
  .hash { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: 8.5px; color: #0F3D33; word-break: break-all; background: #F4EFE6; padding: 5px 7px; border-radius: 5px; margin-top: 2px; }
  .canonical { color: #6E7A72; font-size: 7.5px; margin-top: 4px; word-break: break-all; }
  .canonical code { font-family: "SFMono-Regular", Consolas, monospace; }
  .steps { padding-left: 0; list-style: none; }
  .steps li { margin: 0 0 9px; padding-left: 12px; border-left: 2px solid #DED5C4; }
  .step-title { font-weight: 700; color: #10231D; }
  .contact { display: flex; flex-wrap: wrap; gap: 10px; }
  .contact-card { flex: 1 1 46%; border: 1px solid #DED5C4; border-radius: 9px; padding: 10px 12px; background: #FFFDF8; }
  .contact-card strong { color: #0F3D33; }
  .note { background: #F6EBD8; border-radius: 9px; padding: 10px 12px; color: #4B5B53; font-size: 9px; }
  .footer { margin-top: 20px; padding-top: 9px; border-top: 1px solid #DED5C4; color: #6E7A72; font-size: 8px; }
</style>
</head>
<body>
  <div class="brand">MEHFOOZ · HIFAZAT LABS</div>
  <h1>Evidence pack</h1>
  <p class="subtitle">Prepared for a cyber harassment complaint · Prototype build</p>

  <div class="cover">
    <div class="cover-grid">
      <div><div class="label">Case reference</div><div class="value">${escapeHtml(summary.caseRef)}</div></div>
      <div><div class="label">Generated</div><div class="value">${escapeHtml(generatedAt)}</div></div>
      <div><div class="label">Message records</div><div class="value">${summary.count}</div></div>
      <div><div class="label">Call recordings</div><div class="value">${summary.callCount}</div></div>
      <div><div class="label">Categories</div><div class="value">${escapeHtml(categoryList || 'None')}</div></div>
    </div>
  </div>

  <h2>Incident summary</h2>
  <div class="summary">
    ${summary.count} ${summary.count === 1 ? 'message' : 'messages'} and
    ${summary.callCount} ${summary.callCount === 1 ? 'call recording' : 'call recordings'} were
    recorded between ${escapeHtml(summary.range)}.
    ${summary.senders.length > 0
      ? `Sender${summary.senders.length === 1 ? '' : 's'}: ${escapeHtml(summary.senders.join(', '))}.`
      : 'No message senders were included.'}
    Each message includes the original text, sender, timestamp, automated category and a SHA-256
    digest computed on the device at the time of capture. Call recordings include the caller
    number, timestamp, duration and separate file hash.
  </div>

  <h2>Message records</h2>
  ${evidenceHtml || '<p>No message records selected.</p>'}

  ${sortedCalls.length > 0 ? `<h2>Call recordings</h2>${callsHtml}` : ''}

  <h2>How to file a complaint</h2>
  <ol class="steps">${stepHtml}</ol>

  <h2>Support and reporting</h2>
  <div class="contact">
    <div class="contact-card">
      <div class="label">NCCIA</div>
      <p><strong>Online:</strong> ${escapeHtml(support.ncciaPortal)}<br/>
      <strong>Email:</strong> ${escapeHtml(support.ncciaEmail)}<br/>
      <strong>Helpline:</strong> ${escapeHtml(support.ncciaHelpline)}<br/>
      <strong>Website:</strong> ${escapeHtml(support.ncciaWebsite)}</p>
      <p>You can also submit the NCCIA complaint proforma at the nearest NCCIA office with this evidence pack.</p>
    </div>
    <div class="contact-card">
      <div class="label">DRF helpline</div>
      <p><strong>${escapeHtml(support.drfNumber)}</strong><br/>Free and confidential support for digital security and online harassment.</p>
      <p>Open daily, 9am–5pm. Ask for help preparing or following up on a complaint.</p>
    </div>
  </div>

  <h2>Integrity note</h2>
  <p>
    The text digest is computed over the canonical string shown under each record
    (<code>mehfooz:v1|record id|sender|timestamp|category|message text</code>).
    Changing any character in the record changes the digest. For shared screenshots, the image
    digest is the SHA-256 of the original image file, and the PDF also contains a thumbnail.
    For call recordings, the vault digest is computed over the canonical call string shown under
    each call, and the audio file has its own SHA-256. The Mehfooz app can recompute and compare
    these digests in the evidence vault.
  </p>

  <h2>Legal note</h2>
  <div class="note">
    ${escapeHtml(pecaNote)} Automated categories are a signal, not a legal determination.
    This is not legal advice. Admissibility of evidence is decided by the relevant authority or court.
    Reporting details were verified in ${escapeHtml(support.verified)}; confirm current NCCIA
    requirements before filing.
  </div>

  <div class="footer">
    Generated by the Mehfooz prototype · Hifazat Labs · KP AI Innovation Challenge 2026.
    Prototype build: evidence is stored locally and hash-sealed; encryption and formal chain-of-custody
    are next milestones.
  </div>
</body>
</html>`;
}

export function reportPreviewHashes(items: Evidence[]): string[] {
  return items.slice(0, 3).map((item) => shortHash(item.sha256));
}

export function reportTitle(items: Evidence[], calls: CallRecording[] = []): string {
  return `Mehfooz evidence pack · ${reportSummary(items, calls).caseRef}`;
}

export { formatDate };
