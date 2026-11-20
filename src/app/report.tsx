import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CategoryChip } from '@/components/CategoryChip';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { formatDate } from '@/lib/format';
import { successFeedback, warnFeedback } from '@/lib/haptics';
import { generateAndShareReport } from '@/lib/pdf';
import { reportSummary } from '@/lib/report';
import { useStore } from '@/store/useStore';
import { categoryMeta, colors, fonts, radius } from '@/theme';

const INCLUDED_ITEMS = [
  'Incident summary with date range and senders',
  'Original text, sender and timestamp for every record',
  'Full SHA-256 digest and canonical string per record',
  'NCCIA complaint steps, portal and helpline',
  'Integrity note, PECA reference and legal disclaimer',
];

export default function ReportScreen() {
  const router = useRouter();
  const evidence = useStore((state) => state.evidence);
  const toggleInclude = useStore((state) => state.toggleInclude);

  const [generating, setGenerating] = useState(false);

  const included = evidence.filter((item) => item.includeInReport);
  const summary = reportSummary(included);

  async function handleGenerate() {
    if (included.length === 0 || generating) return;
    setGenerating(true);
    try {
      await generateAndShareReport(included);
      successFeedback();
    } catch (error) {
      warnFeedback();
      Alert.alert(
        'Could not generate the PDF',
        'The evidence pack could not be created. Please try again and check that sharing is available on this device.',
      );
      console.warn('Report generation failed', error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        eyebrow="Complaint pack"
        title="Evidence pack"
        subtitle="Build a complaint-ready PDF"
      />

      {evidence.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Nothing to report yet"
          body="Shielded messages are sealed in the evidence vault. Add one to build a pack."
          actionLabel="Open the demo feed"
          onAction={() => router.navigate('/')}
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={['#123A30', '#08251F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cover}>
              <View style={styles.coverTop}>
                <Text style={styles.coverBrand}>MEHFOOZ · HIFAZAT LABS</Text>
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>PROTOTYPE</Text>
                </View>
              </View>
              <Text style={styles.coverTitle}>Evidence pack</Text>
              <Text style={styles.coverSub}>Prepared for a cyber harassment complaint</Text>

              <View style={styles.coverGrid}>
                <View style={styles.coverCell}>
                  <Text style={styles.coverLabel}>CASE REFERENCE</Text>
                  <Text style={styles.coverValue}>{summary.caseRef}</Text>
                </View>
                <View style={styles.coverCell}>
                  <Text style={styles.coverLabel}>RECORDS</Text>
                  <Text style={styles.coverValue}>{summary.count}</Text>
                </View>
              </View>

              <View style={styles.coverRange}>
                <Text style={styles.coverLabel}>DATE RANGE</Text>
                <Text style={styles.coverRangeValue}>{summary.range}</Text>
              </View>

              <View style={styles.coverFooter}>
                <Ionicons name="finger-print" size={14} color="rgba(244, 239, 230, 0.6)" />
                <Text style={styles.coverFooterText}>
                  Each record is sealed with SHA-256 on this device.
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Included records</Text>
              <Text style={styles.sectionMeta}>
                {included.length} of {evidence.length}
              </Text>
            </View>

            <View style={styles.recordsCard}>
              {evidence.map((item, index) => {
                const meta = categoryMeta[item.category];
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.includeInReport }}
                    accessibilityLabel={`Include ${categoryMeta[item.category].label} record from ${item.sender}`}
                    onPress={() => toggleInclude(item.id)}
                    style={({ pressed }) => [
                      styles.recordRow,
                      index < evidence.length - 1 && styles.divider,
                      pressed && styles.pressed,
                    ]}>
                    <Ionicons
                      name={item.includeInReport ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={item.includeInReport ? colors.pine : colors.muted}
                    />
                    <View style={styles.recordText}>
                      <Text style={styles.recordSender} numberOfLines={1}>
                        {item.sender}
                      </Text>
                      <Text style={styles.recordMeta} numberOfLines={1}>
                        {meta.label} · {formatDate(item.receivedAt)} ·{' '}
                        {item.sha256.slice(0, 8)}…
                      </Text>
                    </View>
                    <CategoryChip category={item.category} compact />
                  </Pressable>
                );
              })}
            </View>

            {included.length === 0 ? (
              <View style={styles.warning}>
                <Ionicons name="alert-circle-outline" size={15} color={colors.amber} />
                <Text style={styles.warningText}>
                  Select at least one record to generate the pack.
                </Text>
              </View>
            ) : null}

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>What the PDF includes</Text>
            </View>

            <View style={styles.checklist}>
              {INCLUDED_ITEMS.map((item) => (
                <View key={item} style={styles.checkRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.safe} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.note}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
              <Text style={styles.noteText}>
                The PDF is generated on this phone. Nothing is uploaded. The prototype output is not
                legal advice; admissibility is decided by the relevant authority.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label={
                generating
                  ? 'Generating PDF…'
                  : `Generate PDF · ${included.length} ${included.length === 1 ? 'record' : 'records'}`
              }
              icon="document-text-outline"
              loading={generating}
              disabled={included.length === 0}
              onPress={() => {
                void handleGenerate();
              }}
            />
          </View>
        </>
      )}
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
    paddingBottom: 108,
  },
  cover: {
    borderRadius: radius.xl,
    padding: 18,
    overflow: 'hidden',
  },
  coverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coverBrand: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.6,
    color: 'rgba(244, 239, 230, 0.58)',
  },
  coverBadge: {
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coverBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 7,
    letterSpacing: 1.1,
    color: 'rgba(244, 239, 230, 0.6)',
  },
  coverTitle: {
    marginTop: 14,
    fontFamily: fonts.extraBold,
    fontSize: 28,
    letterSpacing: -0.7,
    color: colors.sand,
  },
  coverSub: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: 'rgba(244, 239, 230, 0.58)',
  },
  coverGrid: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 239, 230, 0.12)',
  },
  coverCell: {
    flex: 1,
    gap: 4,
  },
  coverLabel: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: 'rgba(244, 239, 230, 0.42)',
  },
  coverValue: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.sand,
  },
  coverRange: {
    marginTop: 12,
    gap: 3,
  },
  coverRangeValue: {
    fontFamily: fonts.medium,
    fontSize: 10.5,
    color: 'rgba(244, 239, 230, 0.8)',
  },
  coverFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coverFooterText: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: 'rgba(244, 239, 230, 0.5)',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 9,
  },
  sectionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.ink,
  },
  sectionMeta: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  recordsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  pressed: {
    backgroundColor: colors.sand,
  },
  recordText: {
    flex: 1,
    gap: 2,
  },
  recordSender: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.ink,
  },
  recordMeta: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
  },
  warning: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.sm,
    padding: 9,
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.amber,
  },
  checklist: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 13,
    gap: 9,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.mutedDark,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 14,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 14,
  },
});
