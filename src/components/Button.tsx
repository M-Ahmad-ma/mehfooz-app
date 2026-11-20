import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radius } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  compact,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  const colorsForVariant = {
    primary: {
      background: colors.pine,
      border: colors.pine,
      text: colors.sand,
      icon: colors.sand,
      spinner: colors.sand,
    },
    secondary: {
      background: 'transparent',
      border: colors.pine,
      text: colors.pine,
      icon: colors.pine,
      spinner: colors.pine,
    },
    ghost: {
      background: 'transparent',
      border: 'transparent',
      text: colors.mutedDark,
      icon: colors.mutedDark,
      spinner: colors.mutedDark,
    },
    danger: {
      background: 'transparent',
      border: colors.harm,
      text: colors.harm,
      icon: colors.harm,
      spinner: colors.harm,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: colorsForVariant.background,
          borderColor: colorsForVariant.border,
        },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={colorsForVariant.spinner} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={compact ? 15 : 18} color={colorsForVariant.icon} /> : null}
          <Text
            style={[
              styles.label,
              compact && styles.compactLabel,
              { color: colorsForVariant.text },
            ]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  compact: {
    minHeight: 40,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  compactLabel: {
    fontSize: 12.5,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
  disabled: {
    opacity: 0.42,
  },
});
