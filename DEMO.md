# Mehfooz — pitch cue sheet

The app is a prototype. The story is real. Keep the two separate.

## Before you walk on stage

1. Put a low-quota Gemini key in `.env` as `EXPO_PUBLIC_GEMINI_API_KEY` and build the **release
   APK**. Expo Go is rehearsal-only; it cannot use the notification listener, share target or OCR.
2. Open **Settings → Live protection**, tap **Notification access**, enable Mehfooz, enable
   **Alert notifications**, and turn **Live capture** on. Confirm the AI classification row says
   **ON**.
3. Send one WhatsApp message from the second phone and confirm it appears in the shield feed with a
   Gemini or local-fallback classifier badge. Share one screenshot into Mehfooz and confirm OCR +
   text classification work.
4. Open **Evidence pack → Send to NCCIA**. Confirm the mail draft has `helpdesk@nccia.gov.pk`, the
   prefilled complaint summary and the PDF attached. **Cancel the draft**; nothing is sent by the
   app.
5. Reset the demo: **Settings → Reset demo → Reset**, then walk through onboarding once. Re-enable
   live capture if you reset after step 3.
6. With the app killed, send a threat from the second phone. With internet, native Gemini should
   catch it even if the static prefilter does not know the phrase. Confirm the Mehfooz notification
   with the app icon appears; tap it and confirm the flagged feed opens. Then run the full 60
   seconds on Wi-Fi. The demo feed does not need the network; Gemini does.
7. Optional call test: add a watchlisted number, call from the second phone, answer and hang up.
   Confirm the recording appears in **Vault → Call recordings**. Check whether the audio contains
   the remote voice; if not, only mention this feature if a judge asks.
8. Record a 60-second screen capture and keep it on the laptop and the phone.
8. Keep a low-quota key in the build, and rotate it after the pitch. Never commit `.env`.

## The 60-second live run

| Time | Do | Say |
|---|---|---|
| 0:00 | Home, live protection on | “Every day, women in KP get messages like this — in languages safety tools don’t understand.” |
| 0:06 | Teammate sends a Roman Urdu threat on WhatsApp | “Mehfooz classifies the notification — Gemini when online, local rules as fallback — and hides it from the shade.” |
| 0:15 | Tap **Simulate incoming message → Friendly context** | “It reads meaning, not keywords. The toast confirms the safe message; the harmful-only feed stays clean.” |
| 0:23 | Open the shield card / threat | “Nothing is deleted. She can review the original and correct a mistake.” |
| 0:30 | Share a Roman Urdu screenshot into Mehfooz | “Screenshots go through OCR on the phone, then the same classifier.” |
| 0:38 | Seal the screenshot; open the vault | “The text and the image each get a SHA-256 seal.” |
| 0:47 | Verify the hash; build the report → **Send to NCCIA** | “One tap builds the pack and opens her email app with NCCIA’s address and the PDF attached.” |
| 0:56 | Show the mail draft with the attachment; **cancel** | “She reviews it and sends. From harm to a filable complaint in under two minutes.” |

If OCR on the screenshot is slow, skip the screenshot beat. The threat notification and report are
the core story.

Optional call beat, only if it worked in rehearsal: **Settings → Call protection → Call watchlist**
add the second phone, call it, answer/hang up, then show **Vault → Call recordings**. If the
recording is silent or one-sided, say the device limits call audio and skip it.


## Fallback: scripted feed

Use this if notification access, the second phone or the share sheet fails.

| Time | Do | Say |
|---|---|---|
| 0:00 | Home | “This is her phone. Mehfooz screens messages in the background.” |
| 0:06 | **Simulate incoming message → Threat** | “It classifies it and hides it before she reads it.” |
| 0:14 | **Friendly context → Simulate** | “It reads meaning, not keywords. ‘Pagal’ in a joke passes.” |
| 0:22 | **View shielded messages → the threat → Mark safe** | “If it gets it wrong, she corrects it; that becomes a training label.” |
| 0:30 | **Simulate incoming message → Blackmail** | “The false positive is excluded from the report; a real threat is still sealed.” |
| 0:38 | **Vault → blackmail record → Verify hash** | “The text and timestamp are sealed with SHA-256 on her phone.” |
| 0:47 | **Build evidence pack → Generate PDF** (or **Send to NCCIA**) | “One tap builds a complaint pack: evidence, hashes and NCCIA steps.” |
| 0:55 | Show the PDF share sheet / page 1, or the mail draft with the PDF attached | “From harm to a filable complaint in under two minutes.” |
| 0:59 | **Scan → Pashto sample** (optional) | “Shared screenshots go through OCR, then the same pipeline.” |

If you skip the correction, the original threat record stays included; generate the PDF after the
friendly-context beat. If you show the correction, add the blackmail message before the vault.

Safe messages are hidden from the feed. The friendly-context beat is a toast only; say “the safe
message passed” while it is visible. Do not expect a card for it.

## Fallbacks

| Problem | Recovery |
|---|---|
| Notification does not appear in the app | Check Settings → Live protection → Notification access and Live capture. Fall back to the scripted feed; do not troubleshoot on stage. |
| WhatsApp previews are off or the notification says “new message” | Switch to the scripted feed. The listener cannot classify text the app does not receive. |
| The original notification remains visible | It is dismissed just after Android posts it. Close the shade and continue; do not claim pre-display interception. |
| OCR is slow or wrong | Skip the screenshot beat, or show the editable transcript and say “the user corrects OCR before sealing.” |
| PDF share sheet is slow | Show the in-app cover preview and say the PDF is generated on device. |
| App reloads | Open the backup screen recording; keep talking. |
| A classification looks wrong | Open the review sheet, choose **This was a mistake — mark safe**, and use it: “This is exactly why corrections exist.” |
| Report button says “Select evidence to continue” | Go to **Vault** and check the corrected record, or simulate another harmful message. |
| Wi-Fi is down | Gemini cannot run; local rules take over automatically. Use the scripted feed and say “local fallback”; do not troubleshoot on stage. |
| Gemini is slow or refuses | The source badge shows “Local rules · Gemini fallback”; continue with that result. |
| No background alert appears | Check Settings → Alert notifications and internet. If offline, only prefiltered messages alert; otherwise Gemini should classify the captured text. Do not troubleshoot on stage. |

## Lines you can defend

- “The prototype uses a rules engine with a context guard. The fine-tuned XLM-R model is in
  development; the datasets are public and the pipeline is already wired.”
- “It reads **message notifications** with the user’s permission. It does not read the WhatsApp
  database or chat history. Android only.”
- “The notification is dismissed just after it is posted. Android does not let an app intercept it
  before display.”
- “While the app is closed, native Gemini checks captured notifications when online; the static
  prefilter is the offline fallback. The full pipeline runs again when she opens the app.”
- “The vault is local and hash-sealed. Encrypted storage is the next milestone.”
- “The notification prefilter and OCR run on the phone. Gemini receives only text, never the
  screenshot image. Local rules are the fallback.”
- “When the app is closed and a harmful message is found, Mehfooz posts its own alert with the app
  icon. Tap it to open the flagged feed. It shows only the app and category, never the message
  text.”
- “Call recording is an explicit watchlist feature. The user opts in, sees a recording notification,
  and the audio stays local; Android may not expose the remote party’s voice.”
- “The Gemini key is in this prototype APK; we use a low-quota key and rotate it after the pitch.
  Production needs a proxy or an on-device model.”
- “Screenshots are shared explicitly through the Android share sheet. OCR runs on the phone; ML Kit
  handles Roman Urdu and English, Tesseract handles Urdu/Pashto and is experimental.”
- “We call it a tamper-evident evidence pack, not legally valid evidence. NCCIA and the courts decide
  admissibility.”
- “Our v2 test set is 400 balanced messages plus 100 hard-safe stress messages. It includes Roman
  Pashto and implicit cases. The v1 160-message rules baseline was 61.3%; the harder v2 rules
  baseline is 41.8% with 10% false positives on the safe stress set. Gemini is evaluated separately.
  We report per-language, per-script and per-tag slices honestly.”
- “The demo feed is pinned for the stage. The test set is not used in the prompt or for training.”

## Questions specific to this build

**Does it read WhatsApp?**
> It reads message **notifications** with the user’s explicit Notification access. It does not read
> chat history, deleted messages or notifications posted before access was granted. That is the
> Android boundary, not a shortcut.

**What happens when the app is closed?**
> While the app is closed, the native service checks each captured notification with Gemini when
> configured and online. The static prefilter (including Romanized Pashto markers) is the offline
> fallback. Harmful results are queued and posted as a Mehfooz notification with the app icon and
> category. If classification cannot run, the original notification stays so the user has context.

**Is the AI real?**
> The pipeline is real: normalization, weighted signals, context handling, confidence and a
> correction loop. The demo-critical moments are pinned for reliability. The next step is replacing
> the rules engine with the fine-tuned multilingual model behind the same interface.

**Can it record calls?**
> Yes, for numbers the user explicitly adds to a watchlist. It detects the incoming call, records
> locally after she answers, and shows a visible notification. Android may allow only microphone or
> room audio, not both sides of a cellular call; we test on the device and do not claim otherwise.
> Recording is opt-in and must comply with consent and privacy law.

**How does she actually file it?**
> **Evidence pack → Send to NCCIA** opens her own mail app with `helpdesk@nccia.gov.pk`, a case
> reference and the PDF attached. She reviews the draft and sends it herself. The app never emails
> anyone automatically.

**Why use Gemini if privacy matters?**
> It is an accuracy experiment, not the production design. OCR, the notification prefilter and the
> local rules stay on the phone. Gemini sees text only, with consent and a fallback. Production
> would use a proxy plus an on-device model or a strictly consented cloud mode.

**Can judges break the friendly-context test?**
> Possibly. The correction flow is the answer: she can mark a false positive as safe, and that label
> goes back into retraining. We show precision and recall per language rather than hiding mistakes.

**How accurate is screenshot OCR?**
> ML Kit Latin is reliable for Roman Urdu and English. Tesseract Urdu/Pashto is experimental,
> especially with Nastaliq. The transcript is editable before sealing, so OCR is assistive, not
> authoritative.

**How accurate is Gemini?**
> We will report the real number from the 400-message v2 core, per language, category and tag. The
> 100-message hard-safe stress set is reported separately as a false-positive rate. Confidence is
> not calibrated, and Pashto — especially Roman Pashto — remains the weakest slice. If Gemini
> refuses or fails, the local rules result is labelled as fallback.

**What happens if she loses her phone?**
> The evidence is local. Production would add an encrypted backup that she controls. We are not
> claiming that today.

**Why Android only?**
> Android has a notification listener with user consent. iOS does not expose an equivalent; iOS can
> use the share sheet later.

## Numbers to say precisely

- 3,012 new DRF complaints in 2025; 2,586 were cyber harassment.
- 23,032 complaints since the helpline opened in 2016.
- 1,709 of the 3,012 complaints were from women.
- These are helpline figures, not the total number of victims.
- Target: above 0.85 F1 for Urdu and Roman Urdu; report Pashto honestly.
- Target: under 2 minutes from harm to a prepared complaint.

## Do not say

- “It reads WhatsApp chats” — it reads message notifications with permission.
- “It hides the notification before it appears” — it dismisses it after Android posts it.
- “The evidence is legally valid.”
- “The model is trained and accurate on Pashto.”
- “Tesseract Urdu/Pashto is accurate” — it is experimental and the transcript is editable.
- “It emails NCCIA automatically” — it opens a draft with the PDF attached; the user sends it.
- “It records both sides of every call” — Android may block call audio; only watchlisted calls are
  attempted, and the result is device-dependent.
- Any “100% accurate” claim — the v2 rules baseline is 41.8% on 400 core messages, with 10% false positives on 100 hard-safe messages; the Gemini eval is separate. Do not quote the old v1 61.3% as current.
- “Every harmful message alerts with 100% accuracy while closed” — Gemini covers captured notifications when online; the static prefilter is the limited offline fallback.
- “It is fully encrypted.”
- “It is available on iPhone.”
- “Everything runs on-device” — OCR/prefilter/rules are local; Gemini receives text.
- “The Gemini key is safe in the app” — it is in the APK for the prototype; rotate it.
