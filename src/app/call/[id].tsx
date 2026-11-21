import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CallPlayer } from '@/components/CallPlayer';
import { EmptyState } from '@/components/EmptyState';
import { HashSeal } from '@/components/HashSeal';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingsRow } from '@/components/SettingsRow';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { formatDateTime, formatDuration } from '@/lib/format';
import { canonicalCallString, verifyCallRecording } from '@/lib/hash';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { mehfoozNative } from '@/native/mehfoozNative';
import { useStore } from '@/store/useStore';
import { colors, fonts, radius } from '@/theme';

type VerifyState = 'idle' | 'checking' | 'ok' | 'fail';

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CallRecordingDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const callRecordings = useStore((state) => state.callRecordings);
  const toggleCallInclude = useStore((state) => state.toggleCallInclude);
  const removeCallRecording = useStore((state) => state.removeCallRecording);

  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [showCanonical, setShowCanonical] = useState(false);
  const { toast, show } = useToast();

  const item = callRecordings.find((recording) => recording.id === id);

  async function handleCopy() {
    if (!item) return;
    await Clipboard.setStringAsync(item.sha256);
    successFeedback();
    show('Full SHA-256 copied', 'success');
  }

  async function handleVerify() {
    if (!item) return;
    setVerifyState('checking');
    const valid = await verifyCallRecording(item);
    setVerifyState(valid ? 'ok' : 'fail');
    if (valid) {
      successFeedback();
    } else {
      warnFeedback();
    }
  }

  function handleDelete() {
    if (!item) return;
    Alert.alert(
      'Delete this recording?',
      'The audio file and its vault entry will be removed from this phone. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              mehfoozNative?.deleteCallRecording(item.audioPath);
            } catch {
              // Remove the metadata even if the file is already gone.
            }
            removeCallRecording(item.id);
            router.back();
          },
        },
      ],
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <ScreenHeader back title="Call recording" subtitle="Not found" />
        <EmptyState
          icon="call-outline"
          title="Recording not found"
          body="This call recording is no longer on this device."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        eyebrow="Call evidence"
        title="Recorded call"
        subtitle={formatDateTime(item.startedAt)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="call" size={21} color={colors.sand} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.number}>{item.callerNumber}</Text>
            <Text style={styles.meta}>
              Incoming · {formatDuration(item.durationMs)} · {fileSize(item.fileSize)}
            </Text>
          </View>
          <View style={styles.localPill}>
            <Text style={styles.localText}>LOCAL</Text>
          </View>
        </View>

        <CallPlayer path={item.audioPath} durationMs={item.durationMs} />

        <View style={styles.warning}>
          <Ionicons name="information-circle-outline" size={15} color={colors.amber} />
          <Text style={styles.warningText}>
            This recording comes from the phone microphone. Android may not include the remote
            party’s voice, and the device may block call audio entirely.
          </Text>
        </View>

        <View style={styles.integrityCard}>
          <HashSeal hash={item.sha256} />
          <Text style={styles.integrityBody}>
            The recording file has its own SHA-256. The vault hash also seals the caller number,
            start time and duration.
          </Text>
          <Text style={styles.fullHash} selectable>
            {item.sha256}
          </Text>
          <Text style={styles.audioHashLabel}>AUDIO FILE SHA-256</Text>
          <Text style={styles.audioHash} selectable>
            {item.audioSha256}
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
                Hash matches — the recording metadata has not changed.
              </Text>
            </View>
          ) : null}

          {verifyState === 'fail' ? (
            <View style={[styles.verifyResult, { backgroundColor: '#F7DFE3' }]}>
              <Ionicons name="alert-circle" size={14} color={colors.harmDeep} />
              <Text style={[styles.verifyText, { color: colors.harmDeep }]}>
                Hash mismatch — the record was modified.
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowCanonical((value) => !value)}
            style={({ pressed }) => [styles.canonicalToggle, pressed && styles.pressed]}>
            <Text style={styles.canonicalLabel}>How the vault hash is computed</Text>
            <Ionicons
              name={showCanonical ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.muted}
            />
          </Pressable>
          {showCanonical ? (
            <Text style={styles.canonicalCode} selectable>
              {canonicalCallString(item)}
            </Text>
          ) : null}
        </View>

        <View style={styles.metaCard}>
          <SettingsRow icon="call-outline" title="Caller" subtitle={item.callerNumber} divider />
          <SettingsRow
            icon="time-outline"
            title="Call started"
            subtitle={formatDateTime(item.startedAt)}
            divider
          />
          <SettingsRow
            icon="timer-outline"
            title="Duration"
            subtitle={formatDuration(item.durationMs)}
            divider
          />
          <SettingsRow
            icon="document-outline"
            title="File size"
            subtitle={fileSize(item.fileSize)}
            divider
          />
          <SettingsRow
            icon="finger-print"
            title="Sealed"
            subtitle={formatDateTime(item.addedAt)}
          />
        </View>

        <View style={styles.includeCard}>
          <SettingsRow
            icon="document-text-outline"
            title="Include in report"
            subtitle="Add this call recording to the next evidence pack and email."
            right={
              <Switch
                value={item.includeInReport}
                onValueChange={() => toggleCallInclude(item.id)}
                trackColor={{ false: colors.sandDeep, true: colors.pine }}
                thumbColor={colors.sand}
                ios_backgroundColor={colors.sandDeep}
              />
            }
          />
        </View>

        <Button
          label="Delete recording"
          icon="trash-outline"
          variant="danger"
          onPress={handleDelete}
        />

        <View style={styles.note}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
          <Text style={styles.noteText}>
            Record only calls you are part of. Audio is stored locally; production needs encrypted
            storage and a formal chain-of-custody flow.
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
    paddingBottom: 30,
    gap: 12,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.pine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  number: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: colors.muted,
  },
  localPill: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  localText: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 1.1,
    color: colors.muted,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.sm,
    padding: 10,
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 15,
    color: colors.amber,
  },
  integrityCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
    gap: 8,
  },
  integrityBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.mutedDark,
  },
  fullHash: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 15,
    color: colors.inkSoft,
  },
  audioHashLabel: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.muted,
  },
  audioHash: {
    fontFamily: 'monospace',
    fontSize: 9,
    lineHeight: 14,
    color: colors.mutedDark,
  },
  hashActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  hashButton: {
    flex: 1,
  },
  verifyResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.sm,
    padding: 8,
  },
  verifyText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },
  canonicalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  canonicalLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.mutedDark,
  },
  canonicalCode: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    lineHeight: 13,
    color: colors.muted,
  },
  metaCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  includeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 2,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.7,
  },
});
