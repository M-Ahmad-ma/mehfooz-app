import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionLabel } from '@/components/SectionLabel';
import { helpCopy, support, type HelpLanguage } from '@/data/complaint';
import { tapFeedback } from '@/lib/haptics';
import { callNumber, openWeb } from '@/lib/links';
import { colors, fonts, radius } from '@/theme';

const LANGUAGES: HelpLanguage[] = ['en', 'ur', 'ps'];

function languageTextStyle(language: HelpLanguage) {
  if (language === 'ur') {
    return {
      fontFamily: fonts.urdu,
      fontSize: 14,
      lineHeight: 31,
      textAlign: 'right' as const,
      writingDirection: 'rtl' as const,
    };
  }
  if (language === 'ps') {
    return {
      fontFamily: fonts.pashto,
      fontSize: 13.5,
      lineHeight: 25,
      textAlign: 'right' as const,
      writingDirection: 'rtl' as const,
    };
  }
  return {};
}

export default function HelpScreen() {
  const [language, setLanguage] = useState<HelpLanguage>('en');
  const copy = helpCopy[language];
  const bodyStyle = languageTextStyle(language);
  const rtl = language !== 'en';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        eyebrow="Support"
        title="Help & rights"
        subtitle="Guidance in her language"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.languageRow}>
          {LANGUAGES.map((item) => {
            const active = item === language;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  tapFeedback();
                  setLanguage(item);
                }}
                style={[
                  styles.languagePill,
                  active && styles.languagePillActive,
                  item === 'ur' && styles.languagePillTall,
                ]}>
                <Text
                  style={[
                    styles.languageLabel,
                    item === 'ur' && styles.urduLabel,
                    item === 'ps' && styles.pashtoLabel,
                    active && styles.languageLabelActive,
                  ]}>
                  {helpCopy[item].tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.introCard}>
          <Text style={[styles.introTitle, bodyStyle, rtl && styles.rtlBlock]}>{copy.title}</Text>
          <Text style={[styles.introBody, bodyStyle, rtl && styles.rtlBlock]}>{copy.intro}</Text>
        </View>

        <LinearGradient
          colors={['#155043', '#0B2F27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.helplineCard}>
          <View style={styles.helplineTop}>
            <View>
              <Text style={styles.helplineLabel}>DRF HELPLINE</Text>
              <Text style={styles.helplineNumber}>{support.drfNumber}</Text>
            </View>
            <View style={styles.helplineIcon}>
              <Ionicons name="call-outline" size={20} color={colors.sand} />
            </View>
          </View>
          <Text style={[styles.helplineNote, rtl && styles.rtlBlock, rtl && bodyStyle]}>
            {copy.helplineNote}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call the DRF helpline"
            onPress={() => callNumber(support.drfDial)}
            style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}>
            <Ionicons name="call" size={15} color={colors.pine} />
            <Text style={styles.callButtonText}>Call now</Text>
          </Pressable>
        </LinearGradient>

        <SectionLabel>What to do</SectionLabel>
        <View style={styles.card}>
          {copy.steps.map((step, index) => (
            <View
              key={`${language}-${index}`}
              style={[
                styles.step,
                rtl && styles.stepRtl,
                index < copy.steps.length - 1 && styles.divider,
              ]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepText, bodyStyle, rtl && styles.rtlBlock]}>{step}</Text>
            </View>
          ))}
        </View>

        <SectionLabel>NCCIA complaint</SectionLabel>
        <View style={styles.card}>
          <View style={styles.ncciaHeader}>
            <View style={styles.ncciaIcon}>
              <Ionicons name="business-outline" size={18} color={colors.pine} />
            </View>
            <View style={styles.ncciaHeaderText}>
              <Text style={styles.ncciaTitle}>National Cyber Crime Investigation Agency</Text>
              <Text style={styles.ncciaSub}>PECA 2016 · amended 2025</Text>
            </View>
          </View>
          <Text style={[styles.ncciaBody, bodyStyle, rtl && styles.rtlBlock]}>{copy.ncciaNote}</Text>
          <View style={styles.ncciaActions}>
            <Button
              label="Portal"
              icon="globe-outline"
              variant="secondary"
              compact
              onPress={() =>
                openWeb(
                  support.ncciaPortal,
                  'Open complaint.nccia.gov.pk in a browser to file a complaint.',
                )
              }
              style={styles.actionButton}
            />
            <Button
              label="Call 1799"
              icon="call-outline"
              compact
              onPress={() => callNumber(support.ncciaHelpline)}
              style={styles.actionButton}
            />
          </View>
        </View>

        <SectionLabel>Your rights</SectionLabel>
        <View style={styles.rightsCard}>
          <View style={styles.rightsIcon}>
            <Ionicons name="shield-checkmark-outline" size={19} color={colors.pine} />
          </View>
          <Text style={[styles.rightsText, bodyStyle, rtl && styles.rtlBlock]}>{copy.rights}</Text>
        </View>

        <View style={styles.voiceCard}>
          <Ionicons name="volume-medium-outline" size={17} color={colors.muted} />
          <Text style={styles.voiceText}>
            Text-only in this prototype. Urdu and Pashto voice guidance is the next milestone.
          </Text>
        </View>

        <Text style={styles.verified}>
          NCCIA portal, helpline and DRF details verified in {support.verified}. Confirm current
          requirements before filing.
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
    paddingBottom: 30,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
  },
  languagePill: {
    minWidth: 48,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languagePillTall: {
    height: 40,
  },
  languagePillActive: {
    backgroundColor: colors.pine,
    borderColor: colors.pine,
  },
  languageLabel: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 0.7,
    color: colors.mutedDark,
  },
  urduLabel: {
    fontFamily: fonts.urdu,
    fontSize: 12,
    lineHeight: 26,
    letterSpacing: 0,
  },
  pashtoLabel: {
    fontFamily: fonts.pashto,
    fontSize: 13,
    letterSpacing: 0,
  },
  languageLabelActive: {
    color: colors.sand,
  },
  introCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 15,
    gap: 7,
  },
  introTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  introBody: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.mutedDark,
  },
  rtlBlock: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  helplineCard: {
    marginTop: 14,
    borderRadius: radius.xl,
    padding: 16,
    overflow: 'hidden',
  },
  helplineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helplineLabel: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.7,
    color: 'rgba(244, 239, 230, 0.58)',
  },
  helplineNumber: {
    marginTop: 3,
    fontFamily: fonts.extraBold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.sand,
  },
  helplineIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(244, 239, 230, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helplineNote: {
    marginTop: 7,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: 'rgba(244, 239, 230, 0.66)',
  },
  callButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.sand,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pressed: {
    opacity: 0.8,
  },
  callButtonText: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: colors.pine,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
  },
  stepRtl: {
    flexDirection: 'row-reverse',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.pine,
  },
  stepText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.inkSoft,
    paddingTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  ncciaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    paddingBottom: 8,
  },
  ncciaIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ncciaHeaderText: {
    flex: 1,
    gap: 2,
  },
  ncciaTitle: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.ink,
  },
  ncciaSub: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    color: colors.muted,
  },
  ncciaBody: {
    paddingHorizontal: 13,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.mutedDark,
  },
  ncciaActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 13,
    paddingTop: 11,
  },
  actionButton: {
    flex: 1,
  },
  rightsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 13,
  },
  rightsIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.safeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightsText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.mutedDark,
    paddingTop: 1,
  },
  voiceCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 11,
  },
  voiceText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  verified: {
    marginTop: 14,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13.5,
    color: colors.muted,
    textAlign: 'center',
  },
});
