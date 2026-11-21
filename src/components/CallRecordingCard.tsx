import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CallPlayer } from '@/components/CallPlayer';
import { formatDateTime, formatDuration, shortHash } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';
import type { CallRecording } from '@/types';

type Props = {
  recording: CallRecording;
  onPress: () => void;
  onToggleInclude: () => void;
};

export function CallRecordingCard({ recording, onPress, onToggleInclude }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Call recording from ${recording.callerNumber}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !recording.includeInReport && styles.excluded,
        pressed && styles.pressed,
      ]}>
      <View style={styles.topRow}>
        <View style={styles.kindPill}>
          <Ionicons name="call" size={11} color={colors.pine} />
          <Text style={styles.kindText}>CALL</Text>
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: recording.includeInReport }}
          accessibilityLabel="Include call recording in report"
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onToggleInclude();
          }}
          style={({ pressed }) => pressed && styles.checkPressed}>
          <Ionicons
            name={recording.includeInReport ? 'checkbox' : 'square-outline'}
            size={22}
            color={recording.includeInReport ? colors.pine : colors.muted}
          />
        </Pressable>
      </View>

      <View style={styles.numberRow}>
        <View style={styles.avatar}>
          <Ionicons name="call-outline" size={17} color={colors.pine} />
        </View>
        <View style={styles.numberText}>
          <Text style={styles.number} numberOfLines={1}>
            {recording.callerNumber}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {formatDateTime(recording.startedAt)} · {formatDuration(recording.durationMs)}
          </Text>
        </View>
        {!recording.includeInReport ? <Text style={styles.excludedText}>Excluded</Text> : null}
      </View>

      <CallPlayer path={recording.audioPath} durationMs={recording.durationMs} compact />

      <View style={styles.footer}>
        <View style={styles.hashRow}>
          <Ionicons name="finger-print" size={12} color={colors.muted} />
          <Text style={styles.hash}>{shortHash(recording.sha256, 6)}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.local}>LOCAL</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.muted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 13,
    marginBottom: 10,
    gap: 10,
  },
  excluded: {
    opacity: 0.62,
  },
  pressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kindPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.safeSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  kindText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1,
    color: colors.pine,
  },
  checkPressed: {
    opacity: 0.6,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    flex: 1,
    gap: 1,
  },
  number: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hash: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: colors.muted,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  local: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 1,
    color: colors.muted,
  },
  excludedText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.muted,
  },
});
