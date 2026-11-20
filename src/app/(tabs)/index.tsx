import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/BrandMark';
import { EmptyState } from '@/components/EmptyState';
import { LiveStatusCard } from '@/components/LiveStatusCard';
import { MessageCard } from '@/components/MessageCard';
import { ReviewSheet } from '@/components/ReviewSheet';
import { SimulateSheet } from '@/components/SimulateSheet';
import { Toast } from '@/components/Toast';
import { useNotificationAccess } from '@/hooks/useNotificationAccess';
import { useToast } from '@/hooks/useToast';
import { successFeedback, tapFeedback, warnFeedback } from '@/lib/haptics';
import { useStore } from '@/store/useStore';
import { categoryMeta, colors, fonts, radius } from '@/theme';

export default function ShieldScreen() {
  const router = useRouter();
  const messages = useStore((state) => state.messages);
  const evidence = useStore((state) => state.evidence);
  const corrections = useStore((state) => state.corrections);
  const disguisedMode = useStore((state) => state.disguisedMode);
  const liveMode = useStore((state) => state.liveMode);
  const addScenario = useStore((state) => state.addScenario);
  const markSafe = useStore((state) => state.markSafe);
  const { available, granted } = useNotificationAccess();

  const live = available && granted && liveMode;

  const [simulateOpen, setSimulateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const { toast, show } = useToast();

  const shielded = messages.filter((message) => message.hidden && !message.correctedTo);
  const flagged = messages.filter(
    (message) => message.category !== 'safe' && message.correctedTo !== 'safe',
  );
  const selected = messages.find((message) => message.id === selectedId) ?? null;
  const selectedEvidence = selected
    ? evidence.find((item) => item.messageId === selected.id)
    : undefined;

  const evidenceByMessage = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of evidence) map.set(item.messageId, item.sha256);
    return map;
  }, [evidence]);

  async function handlePick(scenarioId: string) {
    try {
      const message = await addScenario(scenarioId);
      setSimulateOpen(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });

      if (!message) return;
      if (message.category === 'safe') {
        successFeedback();
        show('Safe message passed · hidden from the harmful feed', 'success');
      } else {
        warnFeedback();
        show(`${categoryMeta[message.category].label} shielded · evidence sealed`, 'warning');
      }
    } catch {
      setSimulateOpen(false);
      show('Could not seal the evidence. Please try again.', 'warning');
    }
  }

  function handleMarkSafe() {
    if (!selected) return;
    markSafe(selected.id);
    successFeedback();
    show('Correction saved — future training label', 'success');
    setSelectedId(null);
  }

  function handleOpenEvidence() {
    if (!selectedEvidence) return;
    setSelectedId(null);
    router.push({ pathname: '/vault/[id]', params: { id: selectedEvidence.id } });
  }

  const appName = disguisedMode ? 'Notes' : 'Mehfooz';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topBar}>
        <BrandMark size={40} />
        <View style={styles.brandText}>
          <Text style={styles.brandName}>{appName}</Text>
          <Text style={styles.brandSub}>
            {disguisedMode ? 'ALL NOTES' : 'HIFAZAT LABS · PROTOTYPE'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Help and rights"
          onPress={() => router.push('/help')}
          style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
          <Ionicons name="help-circle-outline" size={20} color={colors.inkSoft} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#155043', '#0B2F27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shieldCard}>
          <Ionicons
            name="shield-checkmark"
            size={170}
            color={colors.sand}
            style={styles.watermark}
          />

          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SHIELD ACTIVE</Text>
            <View style={styles.demoPill}>
              <Text style={styles.demoText}>{live ? 'LIVE' : 'DEMO'}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Protection is active</Text>
          <Text style={styles.heroBody}>
            {live
              ? 'Screening live message notifications and the demo feed in Urdu, Roman Urdu and Pashto.'
              : 'Screening this demo feed for harassment in Urdu, Roman Urdu and Pashto.'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{shielded.length}</Text>
              <Text style={styles.statLabel}>Shielded</Text>
            </View>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={styles.statValue}>{evidence.length}</Text>
              <Text style={styles.statLabel}>Evidence</Text>
            </View>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={styles.statValue}>{corrections.length}</Text>
              <Text style={styles.statLabel}>Corrections</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View shielded messages"
            onPress={() => {
              tapFeedback();
              router.push('/shielded');
            }}
            style={({ pressed }) => [styles.folderRow, pressed && styles.folderPressed]}>
            <Ionicons name="lock-closed" size={13} color={colors.sand} />
            <Text style={styles.folderText}>View shielded messages</Text>
            <View style={styles.folderCount}>
              <Text style={styles.folderCountText}>{shielded.length}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="rgba(244, 239, 230, 0.7)" />
          </Pressable>
        </LinearGradient>

        <LiveStatusCard />

        <View style={styles.sectionRow}>
          <View>
            <Text style={styles.sectionTitle}>Flagged inbox</Text>
            <Text style={styles.sectionSub}>
              {flagged.length} flagged · safe messages are hidden
            </Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{live ? 'LIVE + DEMO' : 'SCRIPTED'}</Text>
          </View>
        </View>

        {flagged.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title="No harmful messages"
            body="The shield is passing safe messages. Simulate a threat or a harmful message to see one flagged and sealed."
            actionLabel="Simulate a harmful message"
            onAction={() => setSimulateOpen(true)}
          />
        ) : (
          flagged.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              sealedHash={evidenceByMessage.get(message.id)}
              onPress={() => {
                tapFeedback();
                setSelectedId(message.id);
              }}
            />
          ))
        )}

        <View style={styles.footnote}>
          <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
          <Text style={styles.footnoteText}>
            Only flagged messages appear here. OCR and the notification prefilter stay on this
            phone. When Gemini is configured, message text is sent to Google; images stay local.
          </Text>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulate an incoming message"
        onPress={() => {
          tapFeedback();
          setSimulateOpen(true);
        }}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <View style={styles.fabIcon}>
          <Ionicons name="add" size={18} color={colors.pine} />
        </View>
        <Text style={styles.fabText}>Simulate incoming message</Text>
      </Pressable>

      <Toast toast={toast} bottom={84} />

      <SimulateSheet
        visible={simulateOpen}
        onClose={() => setSimulateOpen(false)}
        onPick={(scenarioId) => {
          void handlePick(scenarioId);
        }}
      />

      <ReviewSheet
        visible={Boolean(selected)}
        message={selected}
        evidence={selectedEvidence}
        onClose={() => setSelectedId(null)}
        onMarkSafe={handleMarkSafe}
        onOpenEvidence={handleOpenEvidence}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 13,
  },
  brandText: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontFamily: fonts.extraBold,
    fontSize: 19,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  brandSub: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: 1.35,
    color: colors.muted,
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  shieldCard: {
    borderRadius: radius.xl,
    padding: 18,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -26,
    bottom: -34,
    opacity: 0.06,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#79D3A8',
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#BFE1D1',
  },
  demoPill: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  demoText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.2,
    color: 'rgba(244, 239, 230, 0.62)',
  },
  heroTitle: {
    marginTop: 13,
    fontFamily: fonts.extraBold,
    fontSize: 23,
    letterSpacing: -0.4,
    color: colors.sand,
  },
  heroBody: {
    marginTop: 5,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: 'rgba(244, 239, 230, 0.64)',
    maxWidth: 290,
  },
  statsRow: {
    marginTop: 17,
    flexDirection: 'row',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 239, 230, 0.12)',
  },
  stat: {
    flex: 1,
    gap: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(244, 239, 230, 0.12)',
    paddingLeft: 14,
  },
  statValue: {
    fontFamily: fonts.extraBold,
    fontSize: 21,
    letterSpacing: -0.3,
    color: colors.sand,
  },
  statLabel: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(244, 239, 230, 0.5)',
  },
  folderRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(244, 239, 230, 0.08)',
    borderRadius: radius.md,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  folderPressed: {
    backgroundColor: 'rgba(244, 239, 230, 0.14)',
  },
  folderText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: 'rgba(244, 239, 230, 0.85)',
  },
  folderCount: {
    minWidth: 19,
    height: 19,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(244, 239, 230, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  folderCountText: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    color: colors.sand,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: colors.muted,
    marginTop: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.safe,
  },
  liveText: {
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 1,
    color: colors.mutedDark,
  },
  footnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  footnoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  fab: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 14,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.pine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    elevation: 6,
    shadowColor: colors.pineDeep,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.sand,
  },
});
