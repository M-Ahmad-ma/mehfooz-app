import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { successFeedback } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

type Props = {
  onDone: () => void;
};

const FEATURES = [
  {
    icon: 'scan-outline' as const,
    title: 'Detect',
    body: 'Five categories across Urdu, Roman Urdu and Pashto — including threat and blackmail.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'Shield',
    body: 'Harmful messages are hidden before she reads them. Nothing leaves the phone.',
  },
  {
    icon: 'document-text-outline' as const,
    title: 'Report',
    body: 'Evidence is sealed with SHA-256 and turned into a complaint pack in one tap.',
  },
];

export function Onboarding({ onDone }: Props) {
  return (
    <LinearGradient colors={[colors.pine, colors.pineDeep]} style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <BrandMark size={38} tone="sand" />
            <Text style={styles.brandName}>MEHFOOZ</Text>
            <View style={styles.prototypeBadge}>
              <Text style={styles.prototypeText}>PROTOTYPE</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={36} color={colors.sand} />
            </View>
            <Text style={styles.title}>A shield that understands her language.</Text>
            <Text style={styles.subtitle}>
              Screens harassment in Urdu, Roman Urdu and Pashto — then turns it into evidence she
              can file.
            </Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((feature) => (
              <View key={feature.title} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={18} color={colors.sand} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureBody}>{feature.body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.consent}>
            <Ionicons name="lock-closed" size={16} color={colors.sand} />
            <View style={styles.consentText}>
              <Text style={styles.consentTitle}>Prototype mode</Text>
              <Text style={styles.consentBody}>
                Starts with a demo feed. On the installed Android build you can enable notification
                access and share screenshots for live screening. No account, no backend, no
                analytics.
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Turn on the shield"
              onPress={() => {
                successFeedback();
                onDone();
              }}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryLabel}>Turn on the shield</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.pine} />
            </Pressable>
            <Text style={styles.credit}>
              Built by Hifazat Labs · KP AI Innovation Challenge 2026
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandName: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    letterSpacing: 3.2,
    color: colors.sand,
  },
  prototypeBadge: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  prototypeText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.3,
    color: 'rgba(244, 239, 230, 0.7)',
  },
  hero: {
    marginTop: 6,
    gap: 12,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 239, 230, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.16)',
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -1,
    color: colors.sand,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(244, 239, 230, 0.7)',
    maxWidth: 340,
  },
  features: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(244, 239, 230, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
    paddingTop: 1,
  },
  featureTitle: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.sand,
  },
  featureBody: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15.5,
    color: 'rgba(244, 239, 230, 0.62)',
  },
  consent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(244, 239, 230, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.12)',
    borderRadius: radius.md,
    padding: 10,
  },
  consentText: {
    flex: 1,
    gap: 2,
  },
  consentTitle: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: colors.sand,
  },
  consentBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: 'rgba(244, 239, 230, 0.6)',
  },
  actions: {
    marginTop: 'auto',
    gap: 14,
  },
  primaryButton: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.sand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pressed: {
    opacity: 0.86,
  },
  primaryLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.pine,
  },
  credit: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: 'rgba(244, 239, 230, 0.4)',
  },
});
