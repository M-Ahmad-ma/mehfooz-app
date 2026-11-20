import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useAlertNotificationPermission } from '@/hooks/useAlertNotificationPermission';
import { useNotificationAccess } from '@/hooks/useNotificationAccess';
import { tapFeedback } from '@/lib/haptics';
import { useStore } from '@/store/useStore';
import { colors, fonts, radius } from '@/theme';

export function LiveStatusCard() {
  const { available, granted, openSettings } = useNotificationAccess();
  const { granted: alertsGranted, request: requestAlerts } = useAlertNotificationPermission();
  const liveMode = useStore((state) => state.liveMode);
  const setLiveMode = useStore((state) => state.setLiveMode);

  if (!available) {
    return (
      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name="phone-portrait-outline" size={18} color={colors.pine} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Demo feed is active</Text>
          <Text style={styles.body}>
            Live notification capture and real OCR run in the installed Android build, not Expo Go.
          </Text>
        </View>
      </View>
    );
  }

  if (!granted) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enable notification access"
        onPress={openSettings}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={[styles.icon, { backgroundColor: colors.amberSoft }]}>
          <Ionicons name="notifications-outline" size={18} color={colors.amber} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Enable notification access</Text>
          <Text style={styles.body}>
            Read message notifications with your permission. Android opens the special access
            screen.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: liveMode ? colors.safeSoft : colors.sand }]}>
        <Ionicons
          name={liveMode ? 'notifications' : 'notifications-off-outline'}
          size={18}
          color={liveMode ? colors.safe : colors.muted}
        />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Live capture {liveMode ? 'on' : 'paused'}</Text>
        <Text style={styles.body}>
          {liveMode
            ? 'WhatsApp, Instagram, Facebook, Messenger and TikTok notifications are screened on this phone.'
            : 'Turn on to screen message notifications as they arrive.'}
        </Text>
      </View>
      <Switch
        value={liveMode}
        onValueChange={(value) => {
          tapFeedback();
          setLiveMode(value);
          if (value && !alertsGranted) requestAlerts();
        }}
        trackColor={{ false: colors.sandDeep, true: colors.pine }}
        thumbColor={colors.sand}
        ios_backgroundColor={colors.sandDeep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 12,
    marginTop: 10,
  },
  pressed: {
    opacity: 0.78,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14.5,
    color: colors.muted,
  },
});
