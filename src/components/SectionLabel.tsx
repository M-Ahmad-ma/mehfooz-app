import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  children: ReactNode;
  right?: ReactNode;
};

export function SectionLabel({ children, right }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{children}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
});
