import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import type { ToastState } from '@/hooks/useToast';
import { colors, fonts, radius } from '@/theme';

type Props = {
  toast: ToastState | null;
  bottom?: number;
};

export function Toast({ toast, bottom = 96 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [toast, opacity, translateY]);

  if (!toast) return null;

  const tone =
    toast.tone === 'warning'
      ? { backgroundColor: colors.harmDeep, icon: 'alert-circle' as const }
      : toast.tone === 'neutral'
        ? { backgroundColor: colors.inkSoft, icon: 'information-circle' as const }
        : { backgroundColor: colors.pine, icon: 'shield-checkmark' as const };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        {
          bottom,
          backgroundColor: tone.backgroundColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <View style={styles.icon}>
        <Ionicons name={tone.icon} size={16} color={colors.sand} />
      </View>
      <Text style={styles.text}>{toast.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    zIndex: 40,
    elevation: 6,
    shadowColor: colors.pineDeep,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(244, 239, 230, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.sand,
  },
});
