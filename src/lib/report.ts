import { ncciaSteps, pecaNote, support } from '../data/complaint';
import { categoryMeta } from '../theme';
import type { Evidence } from '../types';

import { canonicalEvidenceString } from './canonical';
import { formatDate, formatDateRange, formatDateTime, shortHash } from './format';

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

export function reportCaseRef(items: Evidence[]): string {
  const year = new Date().getFullYear();
  const earliest = [...items].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  )[0];
  const marker = earliest?.sha256.slice(0, 6).toUpperCase() ?? 'DEMO';
  return `MHF-${year}-${marker}`;
}

export function reportSummary(items: Evidence[]) {
  const senders = Array.from(new Set(items.map((item) => item.sender)));
  const categories = Array.from(new Set(items.map((item) => item.category)));
  return {
    count: items.length,
    senders,
    categories,
    range: formatDateRange(items),
    caseRef: reportCaseRef(items),
  };
}

export function buildReportHtml(items: Evidence[]): string {
  const sorted = [...items].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  );
  const summary = reportSummary(sorted);
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
            <span><strong>Source:</strong> ${item.source === 'screenshot' ? 'Shared screenshot' : 'Demo message feed'}</span>
            <span><strong>Confidence:</strong> ${Math.round(item.confidence * 100)}%</span>
          </div>
          <div class="${languageClass(item)}" dir="auto">${escapeHtml(item.text)}</div>
          <div class="hash-label">SHA-256 · sealed ${escapeHtml(formatDateTime(item.addedAt))}</div>
          <div class="hash">${escapeHtml(item.sha256)}</div>
          <div class="canonical">Canonical string: <code>${escapeHtml(canonical)}</code></div>
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
  .muted { color: #6E7A72; font-size: 9px; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 4px 18px; color: #4B5B53; font-size: 9.5px; margin-bottom: 7px; }
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
      <div><div class="label">Evidence items</div><div class="value">${summary.count}</div></div>
      <div><div class="label">Categories</div><div class="value">${escapeHtml(categoryList || 'None')}</div></div>
    </div>
  </div>

  <h2>Incident summary</h2>
  <div class="summary">
    ${summary.count} ${summary.count === 1 ? 'message was' : 'messages were'} recorded between
    ${escapeHtml(summary.range)}. Sender${summary.senders.length === 1 ? '' : 's'}:
    ${escapeHtml(summary.senders.join(', '))}. Each record below includes the original text, sender,
    timestamp, automated category and a SHA-256 digest computed on the device at the time of capture.
  </div>

  <h2>Evidence records</h2>
  ${evidenceHtml || '<p>No evidence selected.</p>'}

  <h2>How to file a complaint</h2>
  <ol class="steps">${stepHtml}</ol>

  <h2>Support and reporting</h2>
  <div class="contact">
    <div class="contact-card">
      <div class="label">NCCIA</div>
      <p><strong>Online:</strong> ${escapeHtml(support.ncciaPortal)}<br/>
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
    Each SHA-256 digest is computed over the canonical string shown under the record
    (<code>mehfooz:v1|record id|sender|timestamp|category|message text</code>).
    Changing any character in the record changes the digest. The Mehfooz app can recompute
    and compare the digest in the evidence vault.
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

export function reportTitle(items: Evidence[]): string {
  return `Mehfooz evidence pack · ${reportSummary(items).caseRef}`;
}

export { formatDate };
