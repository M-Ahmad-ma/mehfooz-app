import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CategoryChip } from '@/components/CategoryChip';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { EmptyState } from '@/components/EmptyState';
import { HashSeal } from '@/components/HashSeal';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingsRow } from '@/components/SettingsRow';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { classifierSourceLabel, fileUri, formatDateTime, sourceLabel } from '@/lib/format';
import { canonicalEvidenceString, verifyEvidence } from '@/lib/hash';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { useStore } from '@/store/useStore';
import { colors, fonts, languageLabels, radius, scriptTextStyle } from '@/theme';

type VerifyState = 'idle' | 'checking' | 'ok' | 'fail';

export default function EvidenceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const evidence = useStore((state) => state.evidence);
  const corrections = useStore((state) => state.corrections);
  const toggleInclude = useStore((state) => state.toggleInclude);

  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [showCanonical, setShowCanonical] = useState(false);
  const { toast, show } = useToast();

  const item = evidence.find((record) => record.id === id);
  const correction = item
    ? corrections.find((entry) => entry.messageId === item.messageId)
    : undefined;

  async function handleCopy() {
    if (!item) return;
    await Clipboard.setStringAsync(item.sha256);
    successFeedback();
    show('Full SHA-256 copied', 'success');
  }

  async function handleVerify() {
    if (!item) return;
    setVerifyState('checking');
    const valid = await verifyEvidence(item);
    setVerifyState(valid ? 'ok' : 'fail');
    if (valid) {
      successFeedback();
    } else {
      warnFeedback();
    }
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScreenHeader back title="Evidence record" subtitle="Not found" />
        <EmptyState
          icon="document-outline"
          title="Record not found"
          body="This evidence record is no longer on this device."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        eyebrow="Evidence record"
        title="Sealed capture"
        subtitle={formatDateTime(item.receivedAt)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          <CategoryChip category={item.category} confidence={item.confidence} />
          <Text style={styles.language}>{languageLabels[item.language]}</Text>
        </View>

        <ConfidenceBar category={item.category} confidence={item.confidence} />

        {item.imagePath ? (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: fileUri(item.imagePath) }}
              style={styles.evidenceImage}
              resizeMode="contain"
            />
            {item.imageSha256 ? (
              <View style={styles.imageHashRow}>
                <Text style={styles.imageHashLabel}>IMAGE SHA-256</Text>
                <Text style={styles.imageHash} selectable>
                  {item.imageSha256}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.messageCard}>
          <Text style={styles.messageLabel}>
            {item.source === 'screenshot' ? 'OCR transcript' : 'Original message'}
          </Text>
          <Text style={[styles.messageText, scriptTextStyle(item.language)]} selectable>
            {item.text}
          </Text>
        </View>

        {correction ? (
          <View style={styles.correctionCard}>
            <Ionicons name="checkmark-circle" size={17} color={colors.safe} />
            <View style={styles.correctionText}>
              <Text style={styles.correctionTitle}>Marked safe by the user</Text>
              <Text style={styles.correctionBody}>
                {formatDateTime(correction.at)} · original record and hash unchanged. Excluded from
                new report drafts.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.integrityCard}>
          <HashSeal hash={item.sha256} />
          <Text style={styles.integrityBody}>
            Computed on this device from the original text, sender, timestamp and category.
            {item.imagePath
              ? ' The screenshot image is sealed separately with its own SHA-256.'
              : ''}
          </Text>
          <Text style={styles.fullHash} selectable>
            {item.sha256}
          </Text>

          <View style={styles.hashActions}>
            <Button
              label="Copy hash"
              icon="copy-outline"
              variant="secondary"
              compact
              onPress={() => {
                void handleCopy();
              }}
              style={styles.hashButton}
            />
            <Button
              label={verifyState === 'ok' ? 'Verified' : 'Verify hash'}
              icon="shield-checkmark-outline"
              compact
              loading={verifyState === 'checking'}
              onPress={() => {
                void handleVerify();
              }}
              style={styles.hashButton}
            />
          </View>

          {verifyState === 'ok' ? (
            <View style={[styles.verifyResult, { backgroundColor: colors.safeSoft }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.safe} />
              <Text style={[styles.verifyText, { color: colors.safe }]}>
                Hash matches — the record has not changed.
              </Text>
            </View>
          ) : null}

          {verifyState === 'fail' ? (
            <View style={[styles.verifyResult, { backgroundColor: '#F7DFE3' }]}>
              <Ionicons name="alert-circle" size={14} color={colors.harmDeep} />
              <Text style={[styles.verifyText, { color: colors.harmDeep }]}>
                Hash mismatch — this record was modified.
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowCanonical((value) => !value)}
            style={({ pressed }) => [styles.canonicalToggle, pressed && styles.pressed]}>
            <Text style={styles.canonicalLabel}>How the hash is computed</Text>
            <Ionicons
              name={showCanonical ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.muted}
            />
          </Pressable>
          {showCanonical ? (
            <Text style={styles.canonicalCode} selectable>
              {canonicalEvidenceString(item)}
            </Text>
          ) : null}
        </View>

        <View style={styles.metaCard}>
          <SettingsRow icon="person-outline" title="Sender" subtitle={item.sender} divider />
          <SettingsRow
            icon="time-outline"
            title="Received"
            subtitle={formatDateTime(item.receivedAt)}
            divider
          />
          <SettingsRow
            icon="finger-print"
            title="Sealed"
            subtitle={formatDateTime(item.addedAt)}
            divider
          />
          <SettingsRow
            icon="phone-portrait-outline"
            title="Source"
            subtitle={sourceLabel(item.source, item.appLabel)}
            divider
          />
          <SettingsRow
            icon="sparkles-outline"
            title="Classifier"
            subtitle={classifierSourceLabel(item.classifierSource, item.modelVersion)}
          />
        </View>

        <View style={styles.includeCard}>
          <SettingsRow
            icon="document-text-outline"
            title="Include in report"
            subtitle="Add this record to the next evidence pack."
            right={
              <Switch
                value={item.includeInReport}
                onValueChange={() => toggleInclude(item.id)}
                trackColor={{ false: colors.sandDeep, true: colors.pine }}
                thumbColor={colors.sand}
                ios_backgroundColor={colors.sandDeep}
              />
            }
          />
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
          <Text style={styles.noteText}>
            Prototype vault: records are stored locally and hash-sealed. Production uses an encrypted
            database and a formal export flow.
          </Text>
        </View>
      </ScrollView>

      <Toast toast={toast} bottom={18} />
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  language: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: colors.muted,
  },
  imageCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  evidenceImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.sandDeep,
  },
  imageHashRow: {
    padding: 11,
    gap: 3,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  imageHashLabel: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: colors.muted,
  },
  imageHash: {
    fontFamily: 'monospace',
    fontSize: 9,
    lineHeight: 14,
    color: colors.mutedDark,
  },
  messageCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 15,
    gap: 7,
  },
  messageLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  messageText: {
    fontFamily: fonts.medium,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink,
  },
  correctionCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: colors.safeSoft,
    borderRadius: radius.md,
    padding: 12,
  },
  correctionText: {
    flex: 1,
    gap: 2,
  },
  correctionTitle: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: colors.safe,
  },
  correctionBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14.5,
    color: colors.mutedDark,
  },
  integrityCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
    gap: 9,
  },
  integrityBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
  },
  fullHash: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 16,
    color: colors.pine,
    backgroundColor: colors.sand,
    borderRadius: radius.sm,
    padding: 9,
  },
  hashActions: {
    flexDirection: 'row',
    gap: 8,
  },
  hashButton: {
    flex: 1,
  },
  verifyResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  verifyText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  canonicalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  canonicalLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: colors.mutedDark,
  },
  pressed: {
    opacity: 0.65,
  },
  canonicalCode: {
    fontFamily: 'monospace',
    fontSize: 9,
    lineHeight: 14,
    color: colors.mutedDark,
    backgroundColor: colors.sand,
    borderRadius: radius.sm,
    padding: 8,
  },
  metaCard: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  includeCard: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 14,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
});
