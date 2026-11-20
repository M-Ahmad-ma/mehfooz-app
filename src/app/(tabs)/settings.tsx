import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsRow } from '@/components/SettingsRow';
import { geminiModel, isGeminiConfigured } from '@/engine/geminiClassifier';
import { useAlertNotificationPermission } from '@/hooks/useAlertNotificationPermission';
import { useNotificationAccess } from '@/hooks/useNotificationAccess';
import { formatDateTime } from '@/lib/format';
import { tapFeedback } from '@/lib/haptics';
import { resetNativeCaptureState, setLiveCaptureEnabled } from '@/native/mehfoozNative';
import { useStore } from '@/store/useStore';
import { categoryMeta, colors, fonts, radius } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const disguisedMode = useStore((state) => state.disguisedMode);
  const setDisguisedMode = useStore((state) => state.setDisguisedMode);
  const liveMode = useStore((state) => state.liveMode);
  const setLiveMode = useStore((state) => state.setLiveMode);
  const corrections = useStore((state) => state.corrections);
  const resetDemo = useStore((state) => state.resetDemo);
  const { available, granted, openSettings } = useNotificationAccess();
  const { granted: alertsGranted, request: requestAlerts } = useAlertNotificationPermission();

  const recentCorrections = corrections.slice(0, 3);

  function confirmReset() {
    tapFeedback();
    const performReset = () => {
      resetNativeCaptureState();
      resetDemo();
    };

    if (Platform.OS === 'web') {
      performReset();
      return;
    }

    Alert.alert(
      'Reset demo?',
      'This clears every message, evidence record and correction on this device. The onboarding screen will return.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: performReset },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader
        eyebrow="Prototype build"
        title="Settings"
        subtitle="Local-only demo configuration"
        right={<BrandMark size={38} />}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.sand} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Mehfooz · 0.1.0</Text>
            <Text style={styles.heroBody}>
              Harassment shield for Urdu, Roman Urdu and Pashto. Built for the KP AI Innovation
              Challenge 2026.
            </Text>
          </View>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>DEMO</Text>
          </View>
        </View>

        <SectionLabel>Live protection</SectionLabel>
        <View style={styles.card}>
          <SettingsRow
            icon="notifications-outline"
            title="Notification access"
            subtitle={
              available
                ? granted
                  ? 'Android notification access is on.'
                  : 'Required for live message capture.'
                : 'Live capture requires the installed Android APK.'
            }
            right={
              <Text style={[styles.accessStatus, granted && styles.accessOn]}>
                {available ? (granted ? 'ON' : 'OFF') : 'N/A'}
              </Text>
            }
            onPress={available ? openSettings : undefined}
            divider
          />
          <SettingsRow
            icon="notifications-outline"
            title="Alert notifications"
            subtitle={
              alertsGranted
                ? 'Mehfooz can alert you when it shields a message.'
                : 'Allow Android notifications for background alerts.'
            }
            right={
              <Text style={[styles.accessStatus, alertsGranted && styles.accessOn]}>
                {alertsGranted ? 'ON' : 'OFF'}
              </Text>
            }
            onPress={alertsGranted ? undefined : requestAlerts}
            divider
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Live capture"
            subtitle={
              available
                ? granted
                  ? 'Screen message notifications as they arrive.'
                  : 'Enable notification access first.'
                : 'Expo Go runs the demo feed only.'
            }
            right={
              <Switch
                value={liveMode}
                disabled={!available}
                onValueChange={(value) => {
                  tapFeedback();
                  setLiveMode(value);
                  setLiveCaptureEnabled(value);
                  if (value && !alertsGranted) requestAlerts();
                }}
                trackColor={{ false: colors.sandDeep, true: colors.pine }}
                thumbColor={colors.sand}
                ios_backgroundColor={colors.sandDeep}
              />
            }
            divider
          />
          <SettingsRow
            icon="scan-outline"
            title="Screenshot OCR"
            subtitle="ML Kit Latin · Tesseract Urdu/Pashto"
            divider
          />
          <SettingsRow
            icon="sparkles-outline"
            title="AI classification"
            subtitle={
              isGeminiConfigured
                ? `Gemini · ${geminiModel} · text only`
                : 'No Gemini key in this build · local rules'
            }
            right={
              <Text style={[styles.accessStatus, isGeminiConfigured && styles.accessOn]}>
                {isGeminiConfigured ? 'ON' : 'LOCAL'}
              </Text>
            }
            divider
          />
          <SettingsRow
            icon="apps-outline"
            title="Monitored apps"
            subtitle="WhatsApp, Instagram, Facebook, Messenger, TikTok"
          />
        </View>
        <Text style={styles.smallNote}>
          Android asks for Notification access in a special settings screen. Only message-like
          notifications are read; screenshots are shared manually. Background alerts use Gemini
          for captured notification text when configured and online; the static prefilter is the
          offline fallback. The app reclassifies when it opens. When Gemini is configured, live and
          background message text plus screenshot transcripts are sent to Google; images and OCR
          stay on the phone.
        </Text>

        <SectionLabel>Privacy</SectionLabel>
        <View style={styles.card}>
          <SettingsRow
            icon="lock-closed-outline"
            title="Local first"
            subtitle="OCR, notification prefilter and rules run on the phone."
            divider
          />
          <SettingsRow
            icon="phone-portrait-outline"
            title="Demo + live capture"
            subtitle="Demo feed by default; live notifications with permission."
            divider
          />
          <SettingsRow
            icon="server-outline"
            title="Direct API"
            subtitle="No Mehfooz backend; Gemini is called directly when configured."
          />
        </View>

        <SectionLabel>Disguise</SectionLabel>
        <View style={styles.card}>
          <SettingsRow
            icon="eye-off-outline"
            title="Disguised mode"
            subtitle="Show the app chrome as “Notes”."
            right={
              <Switch
                value={disguisedMode}
                onValueChange={(value) => {
                  tapFeedback();
                  setDisguisedMode(value);
                }}
                trackColor={{ false: colors.sandDeep, true: colors.pine }}
                thumbColor={colors.sand}
                ios_backgroundColor={colors.sandDeep}
              />
            }
          />
        </View>
        <Text style={styles.smallNote}>
          Launcher icon and app-name changes are a production feature. This toggle previews the idea
          inside the app only.
        </Text>

        <SectionLabel
          right={
            <Text style={styles.sectionCount}>
              {corrections.length} saved
            </Text>
          }>
          Corrections
        </SectionLabel>
        <View style={styles.card}>
          {recentCorrections.length === 0 ? (
            <View style={styles.emptyCorrection}>
              <View style={styles.emptyIcon}>
                <Ionicons name="checkmark-circle-outline" size={17} color={colors.safe} />
              </View>
              <Text style={styles.emptyText}>
                No corrections yet. Open a flagged message and choose “This was a mistake — mark
                safe” to add one.
              </Text>
            </View>
          ) : (
            recentCorrections.map((correction, index) => (
              <View
                key={correction.id}
                style={[styles.correctionRow, index < recentCorrections.length - 1 && styles.divider]}>
                <View style={styles.correctionIcon}>
                  <Ionicons name="checkmark" size={14} color={colors.safe} />
                </View>
                <View style={styles.correctionText}>
                  <Text style={styles.correctionMessage} numberOfLines={1}>
                    {categoryMeta[correction.from].label} message marked safe
                  </Text>
                  <Text style={styles.correctionMeta}>{formatDateTime(correction.at)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
        <Text style={styles.smallNote}>
          Each correction is a labeled example for the next model iteration.
        </Text>

        <SectionLabel>Prototype limits</SectionLabel>
        <View style={styles.card}>
          <SettingsRow
            icon="notifications-outline"
            title="Live message capture"
            subtitle="Notification content only; previews can be hidden by the app."
            divider
          />
          <SettingsRow
            icon="analytics-outline"
            title="Gemini + local rules"
            subtitle="Live text uses Gemini when configured; rules are the offline fallback."
            divider
          />
          <SettingsRow
            icon="finger-print"
            title="Hash-sealed local store"
            subtitle="Encryption and chain-of-custody are next."
            divider
          />
          <SettingsRow
            icon="scan-outline"
            title="Urdu/Pashto OCR"
            subtitle="Tesseract is experimental; edit the transcript before sealing."
            divider
          />
          <SettingsRow
            icon="volume-medium-outline"
            title="Text-only help"
            subtitle="Urdu and Pashto voice guidance is next."
          />
        </View>

        <SectionLabel>Support</SectionLabel>
        <View style={styles.card}>
          <SettingsRow
            icon="help-circle-outline"
            title="Help & rights"
            subtitle="Guidance in Urdu, Pashto and English"
            onPress={() => router.push('/help')}
          />
        </View>

        <SectionLabel>Demo</SectionLabel>
        <View style={styles.card}>
          <SettingsRow
            icon="refresh-outline"
            title="Reset demo"
            subtitle="Clear messages, evidence and corrections."
            destructive
            onPress={confirmReset}
          />
        </View>

        <Text style={styles.version}>
          Mehfooz prototype 0.1.0 · Hifazat Labs · Built to be shown, not shipped.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.pine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
  heroBody: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14.5,
    color: colors.muted,
  },
  heroPill: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  heroPillText: {
    fontFamily: fonts.bold,
    fontSize: 7,
    letterSpacing: 1.1,
    color: colors.muted,
  },
  accessStatus: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.muted,
  },
  accessOn: {
    color: colors.safe,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  smallNote: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
    paddingHorizontal: 4,
    paddingTop: 7,
  },
  sectionCount: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  emptyCorrection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
  },
  emptyIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.safeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15.5,
    color: colors.muted,
  },
  correctionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  correctionIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.safeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctionText: {
    flex: 1,
    gap: 2,
  },
  correctionMessage: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.inkSoft,
  },
  correctionMeta: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: colors.muted,
  },
  version: {
    marginTop: 24,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: colors.muted,
  },
});
