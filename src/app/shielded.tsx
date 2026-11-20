import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { MessageCard } from '@/components/MessageCard';
import { ReviewSheet } from '@/components/ReviewSheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { successFeedback } from '@/lib/haptics';
import { useStore } from '@/store/useStore';
import { colors, fonts, radius } from '@/theme';
import { useRouter } from 'expo-router';

export default function ShieldedScreen() {
  const router = useRouter();
  const messages = useStore((state) => state.messages);
  const evidence = useStore((state) => state.evidence);
  const markSafe = useStore((state) => state.markSafe);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast, show } = useToast();

  const shielded = messages.filter((message) => message.hidden && !message.correctedTo);
  const selected = messages.find((message) => message.id === selectedId) ?? null;
  const selectedEvidence = selected
    ? evidence.find((item) => item.messageId === selected.id)
    : undefined;

  const evidenceByMessage = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of evidence) map.set(item.messageId, item.sha256);
    return map;
  }, [evidence]);

  function handleMarkSafe() {
    if (!selected) return;
    markSafe(selected.id);
    successFeedback();
    show('Correction saved — future training label', 'success');
    setSelectedId(null);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        eyebrow="Privacy folder"
        title="Shielded messages"
        subtitle="Held back before she reads them"
        right={
          <View style={styles.countPill}>
            <Text style={styles.countText}>{shielded.length}</Text>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.note}>
          <Ionicons name="lock-closed" size={15} color={colors.pine} />
          <Text style={styles.noteText}>
            Nothing is deleted. Tap a message to review the original. If the shield got it wrong,
            mark it safe and the correction is saved locally.
          </Text>
        </View>

        {shielded.length === 0 ? (
          <EmptyState
            icon="lock-open-outline"
            title="Nothing is shielded"
            body="Harmful messages will stay sealed here until she reviews them."
            actionLabel="Back to the shield"
            onAction={() => router.navigate('/')}
          />
        ) : (
          shielded.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              sealedHash={evidenceByMessage.get(message.id)}
              onPress={() => setSelectedId(message.id)}
            />
          ))
        )}

        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
          <Text style={styles.footerText}>
            The original evidence record keeps its SHA-256 hash even after a correction, so the
            capture history stays intact.
          </Text>
        </View>
      </ScrollView>

      <Toast toast={toast} bottom={18} />

      <ReviewSheet
        visible={Boolean(selected)}
        message={selected}
        evidence={selectedEvidence}
        onClose={() => setSelectedId(null)}
        onMarkSafe={handleMarkSafe}
        onOpenEvidence={() => {
          if (!selectedEvidence) return;
          setSelectedId(null);
          router.push({ pathname: '/vault/[id]', params: { id: selectedEvidence.id } });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  countPill: {
    minWidth: 30,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.pine,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.mutedDark,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 12,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
});
