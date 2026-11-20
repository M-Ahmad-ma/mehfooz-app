# Mehfooz — pitch cue sheet

The app is a prototype. The story is real. Keep the two separate.

## Before you walk on stage

1. `npm install` on the demo laptop; build and install the release APK on the demo phone.
   Expo Go works for rehearsal, but it needs Metro at launch, so it is not the offline build.
2. Reset the demo: **Settings → Reset demo → Reset**. Walk through onboarding once.
3. Turn on **airplane mode** and run the full 60 seconds once on the release APK.
4. Confirm the demo phone shows:
   - the Shield tab with the seeded inbox;
   - “Shield active” with 0 shield / 0 evidence / 0 corrections;
   - the Vault empty state;
   - the Urdu Nastaliq and Pashto Naskh text rendering correctly.
5. Record a 60-second screen capture and keep it on the laptop and the phone.
6. Set media volume and brightness; silence notifications from other apps.

## The 60-second run

| Time | Do | Say |
|---|---|---|
| 0:00 | Home | “Every day, women in KP get messages like this — in languages safety tools don’t understand.” |
| 0:06 | Tap **Simulate incoming message → Threat** | “Mehfooz classifies it and hides it before she reads it.” |
| 0:14 | Tap **Friendly context → Simulate** | “It reads meaning, not keywords. ‘Pagal’ in a joke passes.” |
| 0:22 | Tap **View shielded messages → the threat → Mark safe** | “If it gets it wrong, she can correct it. The correction becomes a training label.” |
| 0:30 | Back to the shield → **Simulate incoming message → Blackmail** | “The false positive is excluded from the report; a real threat is still sealed.” |
| 0:38 | **Vault → blackmail record → Verify hash** | “The original text, sender and time are sealed with SHA-256 on her phone.” |
| 0:47 | **Build evidence pack → Generate PDF** | “One tap builds a complaint pack: evidence, hashes and NCCIA steps.” |
| 0:55 | Show the PDF share sheet / page 1 | “From a harmful message to a filable complaint in under two minutes.” |
| 0:59 | **Scan → Pashto sample** (optional/after the pitch) | “Shared screenshots go through OCR, then the same pipeline.” |

If you skip the correction, the original threat record is already included in the report; generate
the PDF directly after the friendly-context beat.

## Fallbacks

| Problem | Recovery |
|---|---|
| PDF share sheet is slow | Show the in-app cover preview and say the PDF is generated on device. |
| Expo Go reloads | Open the backup screen recording; keep talking. |
| A classification looks wrong | Open the review sheet, choose **This was a mistake — mark safe**, and use it: “This is exactly why corrections exist.” |
| Report button says “Select evidence to continue” | Go to **Vault** and check the corrected blackmail record, or simulate another harmful message. |
| Pashto font looks odd | Fall back to the Roman Urdu scenario; do not fake a Pashto number. |
| Wi-Fi is down | On a release APK, nothing to do: the app is offline. On Expo Go, switch to the backup recording; do not troubleshoot on stage. |

## Lines you can defend

- “This prototype uses a rules engine with a context guard. The fine-tuned XLM-R model is in
  development; the datasets are public and the pipeline is already wired.”
- “The demo feed is simulated. Production uses Android notification access and the share sheet,
  with the user’s permission.”
- “The vault is local and hash-sealed. Encrypted storage is the next milestone.”
- “The screenshot OCR is simulated on bundled samples. ML Kit is the integration step.”
- “We call it a tamper-evident evidence pack, not legally valid evidence. NCCIA and the courts
  decide admissibility.”
- “Our eval set is small and curated. We report per-language numbers, and we will report Pashto
  honestly.”
- “The prototype's eval script scores 100% on a set written alongside the lexicon. That is a
  wiring check, not an accuracy claim. The real number will come from an independently annotated
  test set.”

## Questions specific to this build

**Is the AI real?**
> The pipeline is real: normalization, weighted signals, context handling, confidence and a
> correction loop. The demo-critical moments are pinned for reliability. The next step is
> replacing the rules engine with a fine-tuned multilingual model behind the same interface.

**Why not use a hosted LLM?**
> Privacy and latency. The promise is that messages are analysed on her phone. A hosted model
> would also fail in low-connectivity districts, which are exactly the districts we care about.

**Can judges break the friendly-context test?**
> Possibly. The correction flow is the answer: she can mark a false positive as safe, and that
> label goes back into retraining. We show precision and recall per language rather than hiding
> mistakes.

**Does it read WhatsApp?**
> Not in this prototype. The demo feed simulates incoming messages. Android notification access
> and the share sheet are the production integration, and the user grants both.

**What happens if she loses her phone?**
> The evidence is local. Production would add an encrypted backup that she controls. We are not
> claiming that today.

## Numbers to say precisely

- 3,012 new DRF complaints in 2025; 2,586 were cyber harassment.
- 23,032 complaints since the helpline opened in 2016.
- 1,709 of the 3,012 complaints were from women.
- These are helpline figures, not the total number of victims.
- Target: above 0.85 F1 for Urdu and Roman Urdu; report Pashto honestly.
- Target: under 2 minutes from harm to a prepared complaint.

## Do not say

- “It already reads WhatsApp notifications.”
- “The evidence is legally valid.”
- “The model is trained and accurate on Pashto.”
- “The classifier is 100% accurate” — it is a curated sanity set, not a benchmark.
- “It is fully encrypted.”
- “It is available on iPhone.”
