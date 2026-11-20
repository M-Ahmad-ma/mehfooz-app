import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { EvidenceCard } from '@/components/EvidenceCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useStore } from '@/store/useStore';
import { colors, fonts, radius } from '@/theme';

export default function VaultScreen() {
  const router = useRouter();
  const evidence = useStore((state) => state.evidence);
  const corrections = useStore((state) => state.corrections);
  const toggleInclude = useStore((state) => state.toggleInclude);

  const included = evidence.filter((item) => item.includeInReport);
  const correctedMessageIds = new Set(corrections.map((correction) => correction.messageId));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader
        eyebrow="Tamper-evident"
        title="Evidence vault"
        subtitle="Sealed on this phone"
        right={
          <View style={styles.iconBadge}>
            <Ionicons name="finger-print" size={19} color={colors.pine} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="shield-checkmark" size={21} color={colors.sand} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryValue}>
              {evidence.length} {evidence.length === 1 ? 'record' : 'records'} sealed
            </Text>
            <Text style={styles.summaryBody}>
              Sender, timestamp, original text and a SHA-256 digest are stored together.
            </Text>
          </View>
          <View style={styles.localPill}>
            <Text style={styles.localText}>LOCAL</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Evidence records</Text>
          <Text style={styles.sectionMeta}>
            {included.length} of {evidence.length} selected
          </Text>
        </View>

        {evidence.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="The vault is empty"
            body="Harmful messages are sealed here automatically when they are detected."
            actionLabel="Open the demo feed"
            onAction={() => router.navigate('/')}
          />
        ) : (
          evidence.map((item) => (
            <EvidenceCard
              key={item.id}
              evidence={item}
              corrected={correctedMessageIds.has(item.messageId)}
              onPress={() => router.push({ pathname: '/vault/[id]', params: { id: item.id } })}
              onToggleInclude={() => toggleInclude(item.id)}
            />
          ))
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
          <Text style={styles.noteText}>
            Tap a record to verify its hash. Uncheck anything you do not want in the report.
          </Text>
        </View>
      </ScrollView>

      {evidence.length > 0 ? (
        <View style={styles.footer}>
          <Button
            label={
              included.length > 0
                ? `Build evidence pack · ${included.length}`
                : 'Select evidence to continue'
            }
            icon="document-text-outline"
            disabled={included.length === 0}
            onPress={() => router.push('/report')}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.pine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  summaryValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  summaryBody: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
  },
  localPill: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  localText: {
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 1.1,
    color: colors.muted,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
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
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 8,
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
