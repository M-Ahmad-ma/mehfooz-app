import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type Props = {
  size?: number;
  tone?: 'pine' | 'sand';
};

export function BrandMark({ size = 40, tone = 'pine' }: Props) {
  const background = tone === 'pine' ? colors.pine : colors.sand;
  const foreground = tone === 'pine' ? colors.sand : colors.pine;

  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: background,
        },
      ]}>
      <Ionicons name="shield-checkmark" size={size * 0.52} color={foreground} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
});
