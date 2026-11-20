import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fonts, radius } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, body, actionLabel, onAction }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={26} color={colors.pine} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          compact
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  button: {
    marginTop: 16,
  },
});
