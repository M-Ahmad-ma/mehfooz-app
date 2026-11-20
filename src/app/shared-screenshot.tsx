import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CategoryChip } from '@/components/CategoryChip';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { classify } from '@/engine/classify';
import { fileUri } from '@/lib/format';
import { successFeedback, tapFeedback, warnFeedback } from '@/lib/haptics';
import { getPendingShare, mehfoozNative } from '@/native/mehfoozNative';
import { useStore } from '@/store/useStore';
import { colors, fonts, radius, scriptTextStyle } from '@/theme';
import type { Language } from '@/types';

type OcrLanguage = 'latin' | 'urdu' | 'pashto';

const OCR_OPTIONS: { key: OcrLanguage; label: string; font?: string }[] = [
  { key: 'latin', label: 'Roman Urdu / English' },
  { key: 'urdu', label: 'اردو', font: fonts.urdu },
  { key: 'pashto', label: 'پښتو', font: fonts.pashto },
];

function evidenceLanguage(language: OcrLanguage): Language {
  if (language === 'urdu') return 'ur';
  if (language === 'pashto') return 'ps';
  return 'roman-ur';
}

function scriptLanguage(language: OcrLanguage): Language {
  return evidenceLanguage(language);
}

export default function SharedScreenshotScreen() {
  const router = useRouter();
  const pendingShare = useStore((state) => state.pendingShare);
  const setPendingShare = useStore((state) => state.setPendingShare);
  const clearPendingShare = useStore((state) => state.clearPendingShare);
  const addSharedScreenshot = useStore((state) => state.addSharedScreenshot);

  const [language, setLanguage] = useState<OcrLanguage>('latin');
  const [ocrState, setOcrState] = useState<'idle' | 'reading' | 'done' | 'error'>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pendingShare) return;
    let cancelled = false;

    void getPendingShare().then((share) => {
      if (!cancelled && share) setPendingShare(share);
    });

    return () => {
      cancelled = true;
    };
  }, [pendingShare, setPendingShare]);

  useEffect(() => {
    setText('');
    setOcrState('idle');
    setError('');
  }, [pendingShare?.path]);

  const result = useMemo(() => (text.trim() ? classify(text) : null), [text]);
  const script = scriptTextStyle(scriptLanguage(language));

  async function handleRead() {
    if (!pendingShare || !mehfoozNative) {
      setError('On-device OCR is not available in this build.');
      return;
    }

    setOcrState('reading');
    setError('');

    try {
      const ocr = await mehfoozNative.recognizeText(pendingShare.path, language);
      setText(ocr.text.trim());
      setOcrState('done');
      successFeedback();

      if (!ocr.text.trim()) {
        setError('No text was found. Type or paste the message below.');
      }
    } catch {
      setOcrState('error');
      setError('OCR could not read this image. Type or paste the text below.');
      warnFeedback();
    }
  }

  async function handleSeal() {
    if (!pendingShare || !result || result.label === 'safe' || saving) return;

    if (!mehfoozNative) {
      setError('Sealing a screenshot requires the installed Android build.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const image = await mehfoozNative.getImagePayload(pendingShare.path);
      await addSharedScreenshot({
        text: text.trim(),
        language: evidenceLanguage(language),
        imagePath: pendingShare.path,
        imageSha256: image.sha256,
        imageMimeType: pendingShare.mimeType || image.mimeType,
        imageWidth: image.width,
        imageHeight: image.height,
      });

      await mehfoozNative.clearPendingShare();
      clearPendingShare();
      successFeedback();
      router.replace('/vault');
    } catch {
      setError('Could not seal the screenshot. Please try again.');
      warnFeedback();
    } finally {
      setSaving(false);
    }
  }

  async function handleDiscard() {
    try {
      await mehfoozNative?.clearPendingShare();
    } catch {
      // Ignore native cleanup errors.
    }
    clearPendingShare();
    router.replace('/screenshot');
  }

  if (!pendingShare) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScreenHeader
          back
          eyebrow="Screenshot intake"
          title="Shared screenshot"
          subtitle="Read, check and seal"
        />
        <EmptyState
          icon="image-outline"
          title="No screenshot shared"
          body="Share an image to Mehfooz from WhatsApp, Instagram or your gallery. The installed Android build receives it through the share sheet."
          actionLabel="Open screenshot check"
          onAction={() => router.navigate('/screenshot')}
        />
      </SafeAreaView>
    );
  }

  const safe = result?.label === 'safe';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        eyebrow="Screenshot intake"
        title="Shared screenshot"
        subtitle="On-device OCR · edit before sealing"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: fileUri(pendingShare.path) }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.imageNote}>
          Original image stored locally. The evidence pack keeps a thumbnail and an image SHA-256.
        </Text>

        <Text style={styles.sectionLabel}>OCR language</Text>
        <View style={styles.languageRow}>
          {OCR_OPTIONS.map((option) => {
            const active = option.key === language;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  tapFeedback();
                  setLanguage(option.key);
                }}
                style={[styles.languagePill, active && styles.languagePillActive]}>
                <Text
                  style={[
                    styles.languageText,
                    option.font ? { fontFamily: option.font } : null,
                    active && styles.languageTextActive,
                  ]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.languageNote}>
          {language === 'latin'
            ? 'ML Kit reads Latin script. This is the most reliable path for Roman Urdu and English.'
            : 'Tesseract reads this script on-device. Accuracy varies, especially with Nastaliq; correct the text before sealing.'}
        </Text>

        <Button
          label={
            ocrState === 'reading'
              ? 'Reading text…'
              : language === 'latin'
                ? 'Read text with ML Kit'
                : 'Read text with Tesseract'
          }
          icon="scan-outline"
          loading={ocrState === 'reading'}
          onPress={() => {
            void handleRead();
          }}
          style={styles.readButton}
        />

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={15} color={colors.amber} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Extracted text · edit before sealing</Text>
        <TextInput
          value={text}
          onChangeText={(value) => {
            setText(value);
            setError('');
          }}
          multiline
          placeholder="Tap Read text, or type/paste the message manually."
          placeholderTextColor={colors.muted}
          style={[styles.input, script]}
          textAlignVertical="top"
        />
        <Text style={styles.inputNote}>
          OCR is imperfect. The final text is what gets classified, hashed and included in the
          complaint pack.
        </Text>

        {result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <CategoryChip category={result.label} confidence={result.confidence} />
              <Text style={styles.resultEngine}>
                {safe ? 'No harmful intent detected' : 'Would be sealed as evidence'}
              </Text>
            </View>
            <ConfidenceBar category={result.label} confidence={result.confidence} />
            <View style={styles.reasonList}>
              {result.reasons.map((reason, index) => (
                <View key={`${reason}-${index}`} style={styles.reasonRow}>
                  <Ionicons
                    name={safe ? 'checkmark-circle' : 'alert-circle'}
                    size={13}
                    color={safe ? colors.safe : colors.harm}
                  />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {safe ? (
          <View style={styles.safeCard}>
            <Ionicons name="checkmark-circle" size={17} color={colors.safe} />
            <Text style={styles.safeText}>
              No harmful content found. Nothing will be sealed; discard the screenshot when you are
              done.
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {result && !safe ? (
            <Button
              label="Seal to evidence"
              icon="shield-checkmark-outline"
              loading={saving}
              onPress={() => {
                void handleSeal();
              }}
            />
          ) : null}
          <Button
            label={safe ? 'Discard & close' : 'Discard screenshot'}
            variant="ghost"
            onPress={() => {
              void handleDiscard();
            }}
          />
        </View>

        <View style={styles.note}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
          <Text style={styles.noteText}>
            OCR and classification run on this phone. The image hash and the text hash are both
            shown in the evidence record.
          </Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  imageCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 260,
    backgroundColor: colors.sandDeep,
  },
  imageNote: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
    marginTop: 6,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 7,
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 6,
  },
  languagePill: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languagePillActive: {
    backgroundColor: colors.pine,
    borderColor: colors.pine,
  },
  languageText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    textAlign: 'center',
    color: colors.mutedDark,
  },
  languageTextActive: {
    color: colors.sand,
  },
  languageNote: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  readButton: {
    marginTop: 12,
  },
  errorCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.md,
    padding: 10,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14.5,
    color: colors.amber,
  },
  input: {
    minHeight: 110,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  inputNote: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  resultCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 13,
    gap: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultEngine: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.muted,
  },
  reasonList: {
    gap: 5,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  reasonText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14.5,
    color: colors.inkSoft,
  },
  safeCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.safeSoft,
    borderRadius: radius.md,
    padding: 11,
  },
  safeText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15.5,
    color: colors.safe,
  },
  actions: {
    marginTop: 18,
    gap: 6,
  },
  note: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
});
