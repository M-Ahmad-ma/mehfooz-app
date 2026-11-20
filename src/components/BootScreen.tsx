import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { colors, fonts } from '@/theme';

export function BootScreen() {
  return (
    <LinearGradient colors={[colors.pine, colors.pineDeep]} style={styles.root}>
      <BrandMark size={58} tone="sand" />
      <Text style={styles.title}>Mehfooz</Text>
      <Text style={styles.subtitle}>Preparing the shield</Text>
      <ActivityIndicator color={colors.sand} style={styles.spinner} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    marginTop: 8,
    fontFamily: fonts.extraBold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.sand,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(244, 239, 230, 0.55)',
  },
  spinner: {
    marginTop: 18,
  },
});
