import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryChip } from '@/components/CategoryChip';
import { initials, shortHash, timeAgo } from '@/lib/format';
import {
  colors,
  fonts,
  languageLabels,
  radius,
  scriptTextStyle,
} from '@/theme';
import type { Message } from '@/types';

type Props = {
  message: Message;
  sealedHash?: string;
  onPress: () => void;
};

export function MessageCard({ message, sealedHash, onPress }: Props) {
  const hidden = message.hidden && !message.correctedTo;
  const displayCategory = message.correctedTo ?? message.category;
  const corrected = message.correctedTo === 'safe';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Message from ${message.sender}, ${displayCategory}${hidden ? ', shielded' : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(message.sender)}</Text>
        </View>
        <View style={styles.senderColumn}>
          <Text style={styles.sender} numberOfLines={1}>
            {message.sender}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {languageLabels[message.language]} · {timeAgo(message.receivedAt)}
            {message.source === 'screenshot' ? ' · Screenshot' : ''}
          </Text>
        </View>
        <Ionicons
          name={hidden ? 'lock-closed' : 'chevron-forward'}
          size={hidden ? 14 : 16}
          color={hidden ? colors.harm : colors.muted}
        />
      </View>

      {hidden ? (
        <View style={styles.shieldBox}>
          <LinearGradient
            colors={['#143A30', '#0A2822']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons
            name="shield-checkmark"
            size={92}
            color={colors.sand}
            style={styles.watermark}
          />
          <View style={styles.bars}>
            <View style={[styles.bar, { width: '84%' }]} />
            <View style={[styles.bar, { width: '58%' }]} />
            <View style={[styles.bar, { width: '72%' }]} />
          </View>
          <View style={styles.lockRow}>
            <Ionicons name="lock-closed" size={10} color={colors.sand} />
            <Text style={styles.lockText}>Shielded before reading</Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.messageText, scriptTextStyle(message.language)]}>{message.text}</Text>
      )}

      <View style={styles.footer}>
        <CategoryChip category={displayCategory} confidence={message.confidence} compact />
        {corrected ? (
          <View style={styles.corrected}>
            <Ionicons name="checkmark-circle" size={12} color={colors.safe} />
            <Text style={styles.correctedText}>Marked safe</Text>
          </View>
        ) : sealedHash ? (
          <View style={styles.sealed}>
            <Ionicons name="finger-print" size={12} color={colors.muted} />
            <Text style={styles.sealedText}>Sealed · {shortHash(sealedHash, 4)}</Text>
          </View>
        ) : (
          <Text style={styles.reviewHint}>Tap to review</Text>
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
    padding: 14,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.86,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: colors.pine,
  },
  senderColumn: {
    flex: 1,
    gap: 2,
  },
  sender: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.ink,
    letterSpacing: -0.1,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: colors.muted,
  },
  shieldBox: {
    marginTop: 11,
    borderRadius: radius.md,
    minHeight: 88,
    paddingHorizontal: 14,
    paddingVertical: 13,
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 10,
  },
  watermark: {
    position: 'absolute',
    right: -14,
    top: -18,
    opacity: 0.07,
  },
  bars: {
    gap: 7,
    maxWidth: '72%',
  },
  bar: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.redacted,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lockText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: 'rgba(244, 239, 230, 0.66)',
  },
  messageText: {
    marginTop: 11,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sealed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sealedText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.muted,
  },
  corrected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  correctedText: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    color: colors.safe,
  },
  reviewHint: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.muted,
  },
});
