import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { CategoryChip } from '@/components/CategoryChip';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ScreenshotPreview } from '@/components/ScreenshotPreview';
import { Toast } from '@/components/Toast';
import { screenshotSamples, type ScreenshotSample } from '@/data/screenshots';
import { useToast } from '@/hooks/useToast';
import { successFeedback, tapFeedback } from '@/lib/haptics';
import { useStore } from '@/store/useStore';
import { colors, fonts, radius, scriptTextStyle } from '@/theme';

type Phase = 'scanning' | 'done';

export default function ScreenshotScreen() {
  const addScreenshot = useStore((state) => state.addScreenshot);
  const evidence = useStore((state) => state.evidence);
  const { toast, show } = useToast();

  const [active, setActive] = useState<ScreenshotSample | null>(null);
  const [phase, setPhase] = useState<Phase>('scanning');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function openSample(sample: ScreenshotSample) {
    if (timer.current) clearTimeout(timer.current);
    setActive(sample);
    setPhase('scanning');
    tapFeedback();
    timer.current = setTimeout(() => {
      setPhase('done');
      timer.current = null;
    }, 850);
  }

  function closeSheet() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setActive(null);
    setPhase('scanning');
  }

  const alreadySaved = active
    ? evidence.some((item) => item.text === active.text)
    : false;

  async function handleSave() {
    if (!active || phase !== 'done') return;
    if (alreadySaved) {
      show('This sample is already in the vault', 'neutral');
      closeSheet();
      return;
    }

    try {
      await addScreenshot(active.id);
      successFeedback();
      show('Screenshot sealed to the evidence vault', 'success');
    } catch {
      show('Could not seal the evidence. Please try again.', 'warning');
    }
    closeSheet();
  }

  const footer =
    phase === 'scanning' ? (
      <Button label="Reading text…" loading onPress={() => undefined} />
    ) : active?.pinned.label === 'safe' ? (
      <Button label="Close" onPress={closeSheet} />
    ) : alreadySaved ? (
      <Button label="Already sealed in the vault" disabled onPress={() => undefined} />
    ) : (
      <View style={styles.footerStack}>
        <Button
          label="Seal to evidence"
          icon="shield-checkmark-outline"
          onPress={() => {
            void handleSave();
          }}
        />
        <Button label="Discard" variant="ghost" onPress={closeSheet} />
      </View>
    );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader
        eyebrow="Simulated OCR"
        title="Screenshot check"
        subtitle="Read text inside an image"
        right={
          <View style={styles.iconBadge}>
            <Ionicons name="scan-outline" size={19} color={colors.pine} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="image-outline" size={20} color={colors.pine} />
          </View>
          <View style={styles.introText}>
            <Text style={styles.introTitle}>Abuse often arrives as an image</Text>
            <Text style={styles.introBody}>
              A screenshot goes through OCR, then the same classifier and evidence pipeline.
            </Text>
          </View>
          <View style={styles.simPill}>
            <Text style={styles.simText}>SIMULATED</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Bundled samples</Text>
          <Text style={styles.sectionMeta}>{screenshotSamples.length} images</Text>
        </View>

        {screenshotSamples.map((sample, index) => {
          const saved = evidence.some((item) => item.text === sample.text);
          return (
            <Pressable
              key={sample.id}
              accessibilityRole="button"
              accessibilityLabel={`Check screenshot: ${sample.platform}`}
              onPress={() => openSample(sample)}
              style={({ pressed }) => [styles.sampleCard, pressed && styles.pressed]}>
              <ScreenshotPreview sample={sample} />
              <View style={styles.sampleFooter}>
                <View style={styles.sampleMeta}>
                  <Text style={styles.sampleIndex}>
                    SAMPLE {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Text style={styles.samplePlatform}>{sample.platform}</Text>
                </View>
                {saved ? (
                  <View style={styles.savedPill}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.safe} />
                    <Text style={styles.savedText}>In vault</Text>
                  </View>
                ) : (
                  <View style={styles.checkPill}>
                    <Ionicons name="scan-outline" size={12} color={colors.pine} />
                    <Text style={styles.checkText}>Check</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
          <Text style={styles.noteText}>
            Prototype limitation: OCR is simulated on these bundled samples. Production will run
            ML Kit text recognition on images shared to the app.
          </Text>
        </View>
      </ScrollView>

      <Toast toast={toast} bottom={84} />

      <BottomSheet
        visible={Boolean(active)}
        onClose={closeSheet}
        title="Screenshot check"
        subtitle={active ? `${active.platform} · ${active.username}` : undefined}
        footer={footer}>
        {active ? (
          <>
            <View style={styles.previewWrap}>
              <ScreenshotPreview sample={active} />
              {phase === 'scanning' ? (
                <View style={styles.scanOverlay}>
                  <View style={styles.scanFrame} />
                  <View style={styles.scanBadge}>
                    <ActivityIndicator size="small" color={colors.sand} />
                    <Text style={styles.scanText}>Reading text…</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {phase === 'scanning' ? (
              <View style={styles.scanningNote}>
                <Text style={styles.scanningText}>
                  Simulated OCR pass on the bundled screenshot. In production this is ML Kit text
                  recognition on the shared image.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultLabel}>Extracted text</Text>
                <View style={styles.extractedCard}>
                  <Text
                    selectable
                    style={[styles.extractedText, scriptTextStyle(active.language)]}>
                    {active.text}
                  </Text>
                </View>

                <View style={styles.resultChipRow}>
                  <CategoryChip category={active.pinned.label} confidence={active.pinned.confidence} />
                  <Text style={styles.resultTime}>Posted {active.timeLabel} ago</Text>
                </View>

                <ConfidenceBar
                  category={active.pinned.label}
                  confidence={active.pinned.confidence}
                />

                <View style={styles.reasonsCard}>
                  <Text style={styles.reasonsLabel}>Signals</Text>
                  {active.pinned.reasons.map((reason, index) => (
                    <View key={`${reason}-${index}`} style={styles.reasonRow}>
                      <Ionicons
                        name={active.pinned.label === 'safe' ? 'checkmark-circle' : 'alert-circle'}
                        size={14}
                        color={active.pinned.label === 'safe' ? colors.safe : colors.harm}
                      />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.resultNote}>
                  {active.pinned.label === 'safe'
                    ? 'No harmful content found. Nothing needs to be saved.'
                    : 'A harmful screenshot would be sealed in the evidence vault. It also appears in the demo feed as a shielded message.'}
                </Text>
              </>
            )}
          </>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 13,
  },
  introIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    flex: 1,
    gap: 2,
  },
  introTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ink,
  },
  introBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14.5,
    color: colors.muted,
  },
  simPill: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  simText: {
    fontFamily: fonts.bold,
    fontSize: 7,
    letterSpacing: 1,
    color: colors.muted,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.ink,
  },
  sectionMeta: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  sampleCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 9,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  sampleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    paddingTop: 9,
    paddingBottom: 1,
  },
  sampleMeta: {
    gap: 1,
  },
  sampleIndex: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.1,
    color: colors.muted,
  },
  samplePlatform: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: colors.inkSoft,
  },
  checkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.sand,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  checkText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.pine,
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.safe,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 6,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  footerStack: {
    gap: 4,
  },
  previewWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 42, 35, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  scanFrame: {
    ...StyleSheet.absoluteFill,
    margin: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.55)',
    borderRadius: radius.sm,
    borderStyle: 'dashed',
  },
  scanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8, 42, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  scanText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.sand,
  },
  scanningNote: {
    marginTop: 12,
    backgroundColor: colors.sand,
    borderRadius: radius.md,
    padding: 11,
  },
  scanningText: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    color: colors.mutedDark,
  },
  resultLabel: {
    marginTop: 14,
    marginBottom: 6,
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  extractedCard: {
    backgroundColor: colors.sand,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 12,
  },
  extractedText: {
    fontFamily: fonts.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink,
  },
  resultChipRow: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultTime: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.muted,
  },
  reasonsCard: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 11,
    gap: 6,
  },
  reasonsLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  reasonText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.inkSoft,
  },
  resultNote: {
    marginTop: 11,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
});
