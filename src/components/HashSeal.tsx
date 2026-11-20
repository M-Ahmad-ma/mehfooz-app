import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { shortHash } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

type Props = {
  hash: string;
  compact?: boolean;
};

export function HashSeal({ hash, compact }: Props) {
  return (
    <View style={[styles.root, compact && styles.compact]}>
      <View style={[styles.icon, compact && styles.compactIcon]}>
        <Ionicons name="finger-print" size={compact ? 15 : 18} color={colors.sand} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>SHA-256 seal</Text>
        <Text style={[styles.hash, compact && styles.compactHash]} numberOfLines={1}>
          {shortHash(hash, compact ? 6 : 10)}
        </Text>
      </View>
      {!compact ? <Ionicons name="shield-checkmark" size={19} color={colors.safe} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compact: {
    flex: 1,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.pine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  hash: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: colors.ink,
  },
  compactHash: {
    fontSize: 11.5,
  },
});
