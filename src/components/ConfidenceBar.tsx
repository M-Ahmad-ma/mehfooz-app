import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import type { Category } from '@/types';
import { categoryMeta } from '@/theme';
import { percent } from '@/lib/format';

type Props = {
  category: Category;
  confidence: number;
};

export function ConfidenceBar({ category, confidence }: Props) {
  const meta = categoryMeta[category];
  const width = `${Math.max(4, Math.min(100, Math.round(confidence * 100)))}%` as `${number}%`;

  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Confidence</Text>
        <Text style={[styles.value, { color: meta.fg }]}>{percent(confidence)}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: meta.fg }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.sandDeep,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
