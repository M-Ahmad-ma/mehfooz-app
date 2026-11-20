import { StyleSheet, Text, View } from 'react-native';

import { categoryMeta, fonts, radius } from '@/theme';
import type { Category } from '@/types';
import { percent } from '@/lib/format';

type Props = {
  category: Category;
  confidence?: number;
  compact?: boolean;
};

export function CategoryChip({ category, confidence, compact }: Props) {
  const meta = categoryMeta[category];
  const label =
    confidence === undefined
      ? meta.label.toUpperCase()
      : `${meta.label.toUpperCase()} · ${percent(confidence)}`;

  return (
    <View style={[styles.chip, { backgroundColor: meta.bg }, compact && styles.compact]}>
      <View style={[styles.dot, { backgroundColor: meta.fg }]} />
      <Text style={[styles.text, { color: meta.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 0.7,
  },
});
