import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsRow } from '@/components/SettingsRow';
import { formatDateTime } from '@/lib/format';
import { tapFeedback } from '@/lib/haptics';
import { useStore } from '@/store/useStore';
import { categoryMeta, colors, fonts, radius } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const disguisedMode = useStore((state) => state.disguisedMode);
  const setDisguisedMode = useStore((state) => state.setDisguisedMode);
  const corrections = useStore((state) => state.corrections);
  const resetDemo = useStore((state) => state.resetDemo);

  const recentCorrections = corrections.slice(0, 3);

  function confirmReset() {
    tapFeedback();
    if (Platform.OS === 'web') {
      resetDemo();
      return;
    }
    Alert.alert(
      'Reset demo?',
      'This clears every message, evidence record and correction on this device. The onboarding screen will return.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetDemo },
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

        <SectionLabel>Privacy</SectionLabel>
        <View style={styles.card}>
          <SettingsRow
            icon="lock-closed-outline"
            title="On-device only"
            subtitle="No account, no uploads, no analytics."
            divider
          />
          <SettingsRow
            icon="phone-portrait-outline"
            title="Scripted demo feed"
            subtitle="Production reads Android notifications with permission."
            divider
          />
          <SettingsRow
            icon="server-outline"
            title="No backend"
            subtitle="Nothing leaves this phone in the prototype."
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
            title="Scripted demo feed"
            subtitle="Android notification access is the production path."
            divider
          />
          <SettingsRow
            icon="analytics-outline"
            title="Rules-based classifier"
            subtitle="A fine-tuned multilingual model is the next milestone."
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
            title="Simulated screenshot OCR"
            subtitle="ML Kit text recognition is the integration step."
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
