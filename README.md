# Mehfooz — prototype

**An AI shield that understands Urdu, Roman Urdu and Pashto.**
This repo is the small, demo-focused prototype for the Hifazat Labs pitch: a message arrives,
the app classifies it, hides harmful content, seals the evidence with SHA-256, and builds a
complaint-ready PDF.

It is deliberately not a production product. The whole demo runs offline on one Android phone.

---

## What is real vs simulated

| Area | In this prototype | Production path |
|---|---|---|
| Message source | Scripted demo feed (12 scenarios) | Android notification listener + share sheet, with permission |
| Classifier | Local rules + lexicon + context guards | Fine-tuned multilingual XLM-RoBERTa on RUHSOLD / ORUD / Pashto data |
| Shield | Harmful content not rendered; redacted card + review sheet | Same, plus platform-specific handling |
| Evidence store | Local AsyncStorage, SHA-256 sealed | Encrypted SQLite, chain-of-custody export |
| Screenshot check | Simulated OCR over 3 bundled samples | Google ML Kit text recognition on shared images |
| Disguise | In-app header changes to “Notes” | Native launcher icon/name change |
| Voice guide | Text help in Urdu, Pashto and English | Recorded/neural Urdu + Pashto audio |
| Legal status | “Tamper-evident evidence pack” | Admissibility decided by NCCIA/courts |

The classifier code is behind `src/engine/classify.ts`, so a real model can replace it without
touching a screen.

---

## Quick start

Requirements: Node 20+, npm, and Expo Go on an Android phone (or an emulator).

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go. There are **no custom native modules** in this build, so Expo Go
works for rehearsal. Expo Go still needs the Metro dev server at launch, so **build the release APK
for the offline pitch**.

Web fallback:

```bash
npm run web
```

### Building an APK (recommended for the pitch phone)

```bash
npx expo prebuild -p android
cd android
./gradlew assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/`. The repository does not include
a prebuilt `android/` directory.

---

## 60-second demo flow

| Time | Tap | Say |
|---|---|---|
| 0:00 | Home screen | “This is her phone. Mehfooz screens messages in the background.” |
| 0:05 | **Simulate incoming message → Threat** | “It classifies the message and hides it before she reads it.” |
| 0:15 | **Friendly context** scenario | “It also knows context: ‘pagal’ in a joke is not abuse.” |
| 0:22 | **View shielded messages → tap the message → Mark safe** | “Nothing is deleted. If it gets it wrong, she corrects it; that becomes a training label.” |
| 0:31 | **Simulate incoming message → Blackmail** | “A real threat still gets sealed while the false positive is excluded from the report.” |
| 0:38 | **Vault → tap the blackmail record → Verify hash** | “The evidence is sealed with a SHA-256 digest on the phone.” |
| 0:47 | **Build evidence pack → Generate PDF** | “One tap produces the complaint pack: messages, hashes, NCCIA steps.” |
| 0:57 | Close / optional **Scan → Pashto sample** | “Shared screenshots go through OCR, then the same pipeline.” |

If you skip the correction, the original threat record stays included and the report works with
one message. If you demonstrate the correction, add the blackmail message before opening the
vault so the report has an included record.

A longer cue sheet with fallbacks is in [`DEMO.md`](./DEMO.md).

---

## Project map

```
src/app/                 expo-router screens and the tab shell
  (tabs)/index.tsx       Shield inbox + simulate sheet + review sheet
  (tabs)/vault.tsx       Evidence list and report selection
  (tabs)/screenshot.tsx  Simulated OCR flow
  (tabs)/settings.tsx    Disguise, corrections, limitations, reset
  vault/[id].tsx         Evidence detail, hash verification
  report.tsx             PDF preview + generation
  help.tsx               Urdu / Pashto / English rights guidance
src/engine/              normalizer, lexicon, classifier, eval script
src/data/                demo scenarios, screenshot samples, eval set, complaint copy
src/store/useStore.ts    Zustand store + AsyncStorage persistence
src/lib/                 hash, PDF, report HTML, formatting, links, haptics
src/components/          UI primitives and sheets
```

---

## Classifier

`classify(text)` returns `{ label, confidence, reasons, scores }` with five labels:
`safe`, `abusive`, `sexual`, `threat`, `blackmail`.

- Normalization handles Roman Urdu leetspeak, repeated characters, Arabic-script variants,
  diacritics and punctuation.
- Weighted terms and multi-word phrases are matched; threat/blackmail signals take precedence.
- A context guard discounts insults when a friendly signal is present and there is no threat,
  blackmail or sexual signal.
- Demo-critical moments are **pinned** so the pitch is deterministic. Everything else runs the
  real engine.
- Two messages in the demo are deliberately pinned: the Roman Urdu threat and the friendly
  context test.

Run the held-out sanity evaluation:

```bash
npm run eval
```

This prints accuracy, per-category precision/recall/F1, per-language accuracy, and a confusion
matrix. It is a **curated sanity set**, not an annotated test set. Report the numbers as such.
Pashto is a low-resource language; do not claim otherwise.

> **Do not quote the eval script's score as model accuracy.** The lexicon and this sanity set
> were written together, so the script currently returns 100%. That proves the wiring works, not
> that the classifier generalises. The pitch number must come from the ML lead's independently
> annotated held-out set.

Corrections made with “This was a mistake — mark safe” are stored in the app and shown in
Settings. They are the seed of the retraining loop.

---

## Report and support details

The PDF is generated locally with `expo-print` and shared with `expo-sharing`. It contains:

- incident summary, sender list and date range;
- every selected message with sender, timestamp, category and confidence;
- full SHA-256 digest and canonical string per record;
- NCCIA complaint steps and portal;
- DRF helpline;
- integrity, PECA and legal notes.

Verified in **November 2026**:

- NCCIA complaint portal: <https://complaint.nccia.gov.pk>
- NCCIA helpline: **1799**
- NCCIA website: <https://www.nccia.gov.pk>
- DRF helpline: **0800-39393** (free, confidential, daily 9am–5pm)
- PECA 2016 (amended 2025), Section 29(1) authorises NCCIA.

Re-confirm these before the final pitch. The app labels the pack as prototype output, not legal
advice.

---

## Reset and demo reliability

- **Settings → Reset demo** clears messages, evidence and corrections and returns to onboarding.
- App logic is local: the classifier, vault and PDF generation have no network dependency.
- A **release APK** runs fully offline and is the recommended pitch build. Expo Go still fetches
  the JS bundle from Metro at launch, so it is not a true airplane-mode demo.
- If you change the demo scenarios, run `npm run eval` and walk the full 60-second flow twice.

---

## Notes for the team

- The Pashto UI strings and demo messages should be reviewed by a native Pashto speaker before
  the pitch. They are deliberately short and non-graphic, but wording matters.
- `src/engine/eval.ts` is a Node script; it imports only the engine and data, so it does not need
  a running app.
- The classifier is intentionally conservative about threats and blackmail, which can produce
  false positives in casual conversation. The review sheet and correction flow exist for that
  reason. Do not hide the false-positive story from judges; it is one of the stronger parts of
  the design.
- The app does **not** read WhatsApp in this build. Say “demo feed” and “Android notification
  access is the production path”, not “it reads your WhatsApp”.
