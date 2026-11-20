import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryChip } from '@/components/CategoryChip';
import { initials, shortHash, timeAgo } from '@/lib/format';
import { colors, fonts, radius, scriptTextStyle } from '@/theme';
import type { Evidence } from '@/types';

type Props = {
  evidence: Evidence;
  corrected?: boolean;
  onPress: () => void;
  onToggleInclude: () => void;
};

export function EvidenceCard({ evidence, corrected, onPress, onToggleInclude }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Evidence from ${evidence.sender}, ${evidence.category}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !evidence.includeInReport && styles.excluded,
        pressed && styles.pressed,
      ]}>
      <View style={styles.topRow}>
        <CategoryChip category={evidence.category} compact />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: evidence.includeInReport }}
          accessibilityLabel="Include in report"
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onToggleInclude();
          }}
          style={({ pressed }) => pressed && styles.checkPressed}>
          <Ionicons
            name={evidence.includeInReport ? 'checkbox' : 'square-outline'}
            size={22}
            color={evidence.includeInReport ? colors.pine : colors.muted}
          />
        </Pressable>
      </View>

      <View style={styles.senderRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(evidence.sender)}</Text>
        </View>
        <View style={styles.senderText}>
          <Text style={styles.sender} numberOfLines={1}>
            {evidence.sender}
          </Text>
          <Text style={styles.meta}>
            {timeAgo(evidence.receivedAt)} · {Math.round(evidence.confidence * 100)}% confidence
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={[styles.excerpt, scriptTextStyle(evidence.language)]}>
        {evidence.text}
      </Text>

      <View style={styles.footer}>
        <View style={styles.hashRow}>
          <Ionicons name="finger-print" size={12} color={colors.muted} />
          <Text style={styles.hash}>{shortHash(evidence.sha256, 6)}</Text>
        </View>
        {corrected ? (
          <View style={styles.correctedPill}>
            <Ionicons name="checkmark-circle" size={11} color={colors.safe} />
            <Text style={styles.correctedText}>Corrected</Text>
          </View>
        ) : !evidence.includeInReport ? (
          <Text style={styles.excludedText}>Excluded</Text>
        ) : (
          <Ionicons name="chevron-forward" size={15} color={colors.muted} />
        )}
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
  checkPressed: {
    opacity: 0.6,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.pine,
  },
  senderText: {
    flex: 1,
    gap: 1,
  },
  sender: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  excerpt: {
    marginTop: 9,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  footer: {
    marginTop: 10,
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
  correctedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  correctedText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.safe,
  },
  excludedText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.muted,
  },
});
