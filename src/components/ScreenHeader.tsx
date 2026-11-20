import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout, radius } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, eyebrow, back, right }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
      ) : null}

      <View style={styles.textColumn}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  textColumn: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 3,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.mutedDark,
    marginTop: 4,
  },
  right: {
    alignSelf: 'center',
  },
});
