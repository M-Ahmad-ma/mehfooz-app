import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  divider?: boolean;
};

export function SettingsRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  destructive,
  divider,
}: Props) {
  const content = (
    <>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: destructive ? '#F8E4E9' : colors.sand,
          },
        ]}>
        <Ionicons name={icon} size={17} color={destructive ? colors.harm : colors.pine} />
      </View>

      <View style={styles.text}>
        <Text style={[styles.title, destructive && { color: colors.harm }]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null)}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          divider && styles.divider,
          pressed && styles.pressed,
        ]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, divider && styles.divider]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  pressed: {
    backgroundColor: colors.sand,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
  },
});
