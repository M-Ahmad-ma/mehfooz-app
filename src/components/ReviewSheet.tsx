import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { CategoryChip } from '@/components/CategoryChip';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { HashSeal } from '@/components/HashSeal';
import { classifierSourceLabel, formatDateTime, sourceLabel } from '@/lib/format';
import { colors, fonts, languageLabels, radius, scriptTextStyle } from '@/theme';
import type { Evidence, Message } from '@/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  visible: boolean;
  message: Message | null;
  evidence?: Evidence;
  onClose: () => void;
  onMarkSafe: () => void;
  onOpenEvidence: () => void;
};

function MetaRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaIcon}>
        <Ionicons name={icon} size={13} color={colors.pine} />
      </View>
      <View style={styles.metaText}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

export function ReviewSheet({
  visible,
  message,
  evidence,
  onClose,
  onMarkSafe,
  onOpenEvidence,
}: Props) {
  if (!message) return null;

  const corrected = message.correctedTo === 'safe';
  const originallySafe = message.category === 'safe';
  const safe = originallySafe || corrected;
  const title = corrected
    ? 'Marked safe'
    : originallySafe
      ? 'Message passed'
      : 'Why this was flagged';
  const subtitle = corrected
    ? 'You corrected the original classification.'
    : originallySafe
      ? 'The shield left this message untouched.'
      : 'Only you can see the original message.';

  const footer = (
    <View style={styles.footerStack}>
      {safe ? (
        <Button label="Close" onPress={onClose} />
      ) : (
        <>
          <Button label="Keep shielded" onPress={onClose} />
          <Button
            label="This was a mistake — mark safe"
            variant="secondary"
            onPress={onMarkSafe}
          />
          <Text style={styles.footerNote}>
            Corrections are stored locally as a future training label. The original evidence record
            keeps its hash.
          </Text>
        </>
      )}
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={footer}>
      <View style={styles.messageCard}>
        <Text style={[styles.messageText, scriptTextStyle(message.language)]}>
          {message.text}
        </Text>
      </View>

      <View style={styles.chipRow}>
        <CategoryChip category={message.category} confidence={message.confidence} />
        {corrected ? (
          <View style={styles.correctionPill}>
            <Ionicons name="checkmark-circle" size={12} color={colors.safe} />
            <Text style={styles.correctionText}>Correction saved</Text>
          </View>
        ) : null}
      </View>

      <ConfidenceBar category={message.category} confidence={message.confidence} />

      <View style={styles.reasonsCard}>
        <Text style={styles.sectionLabel}>
          {corrected ? 'Original signals' : 'Signals'}
        </Text>
        {message.reasons.map((reason, index) => (
          <View key={`${reason}-${index}`} style={styles.reasonRow}>
            <Ionicons
              name={originallySafe ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={originallySafe ? colors.safe : colors.harm}
            />
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metaGrid}>
        <MetaRow icon="person-outline" label="Sender" value={message.sender} />
        <MetaRow
          icon="language-outline"
          label="Language"
          value={languageLabels[message.language]}
        />
        <MetaRow
          icon="time-outline"
          label="Received"
          value={formatDateTime(message.receivedAt)}
        />
        <MetaRow icon="phone-portrait-outline" label="Source" value={sourceLabel(message.source, message.appLabel)} />
        <MetaRow
          icon="sparkles-outline"
          label="Classifier"
          value={classifierSourceLabel(message.classifierSource, message.modelVersion)}
        />
      </View>

      {evidence ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open evidence record"
          onPress={onOpenEvidence}
          style={({ pressed }) => [styles.evidenceRow, pressed && styles.pressed]}>
          <HashSeal hash={evidence.sha256} compact />
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  messageCard: {
    backgroundColor: colors.sand,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  messageText: {
    fontFamily: fonts.medium,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  correctionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  correctionText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    color: colors.safe,
  },
  reasonsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 12,
    marginTop: 14,
    gap: 7,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  reasonText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.inkSoft,
  },
  metaGrid: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    paddingTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  metaIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    flex: 1,
    gap: 1,
  },
  metaLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  metaValue: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.ink,
  },
  evidenceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.sand,
    borderRadius: radius.md,
    padding: 10,
  },
  pressed: {
    opacity: 0.72,
  },
  footerStack: {
    gap: 8,
  },
  footerNote: {
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14.5,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
