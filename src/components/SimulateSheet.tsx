import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { demoScenarios, type DemoScenario } from '@/data/scenarios';
import { colors, fonts, radius } from '@/theme';
import { tapFeedback } from '@/lib/haptics';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (scenarioId: string) => void;
};

const GROUPS: {
  key: DemoScenario['group'];
  label: string;
  note: string;
  icon: 'alert-circle-outline' | 'sparkles-outline' | 'language-outline' | 'checkmark-circle-outline';
  tint: string;
  background: string;
}[] = [
  {
    key: 'harassment',
    label: 'Harassment scenarios',
    note: 'Deliver a harmful message to the demo feed.',
    icon: 'alert-circle-outline',
    tint: colors.harm,
    background: '#F8E4E9',
  },
  {
    key: 'context',
    label: 'Context test',
    note: 'The message contains an insult, but it is playful.',
    icon: 'sparkles-outline',
    tint: colors.safe,
    background: colors.safeSoft,
  },
  {
    key: 'language',
    label: 'Language coverage',
    note: 'The same pipeline across Urdu, Pashto and English.',
    icon: 'language-outline',
    tint: colors.pine,
    background: colors.sandDeep,
  },
  {
    key: 'safe',
    label: 'Safe messages',
    note: 'Routine messages that should pass untouched.',
    icon: 'checkmark-circle-outline',
    tint: colors.safe,
    background: colors.safeSoft,
  },
];

export function SimulateSheet({ visible, onClose, onPick }: Props) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Simulate an incoming message"
      subtitle="Pick a scenario for the demo feed. Nothing is sent to any service.">
      {GROUPS.map((group) => {
        const items = demoScenarios.filter((scenario) => scenario.group === group.key);
        if (items.length === 0) return null;

        return (
          <View key={group.key} style={styles.group}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupIcon, { backgroundColor: group.background }]}>
                <Ionicons name={group.icon} size={14} color={group.tint} />
              </View>
              <View style={styles.groupText}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                <Text style={styles.groupNote}>{group.note}</Text>
              </View>
            </View>

            {items.map((scenario) => (
              <Pressable
                key={scenario.id}
                accessibilityRole="button"
                accessibilityLabel={`Simulate ${scenario.title}, ${scenario.description}`}
                onPress={() => {
                  tapFeedback();
                  onPick(scenario.id);
                  onClose();
                }}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{scenario.title}</Text>
                  <Text style={styles.rowDescription}>{scenario.description}</Text>
                </View>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={18} color={colors.pine} />
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
        <Text style={styles.disclaimerText}>
          Prototype demo feed. Production uses Android notification access and the share sheet,
          with the user’s permission.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 7,
  },
  groupIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupText: {
    flex: 1,
  },
  groupLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ink,
  },
  groupNote: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: colors.muted,
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.sand,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  pressed: {
    opacity: 0.72,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.ink,
  },
  rowDescription: {
    fontFamily: fonts.regular,
    fontSize: 10.5,
    color: colors.muted,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    paddingTop: 4,
    paddingBottom: 6,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
  },
});
