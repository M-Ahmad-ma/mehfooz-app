import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { tapFeedback, warnFeedback } from '@/lib/haptics';
import { useStore } from '@/store/useStore';
import { colors, fonts, radius } from '@/theme';

export default function CallWatchlistScreen() {
  const router = useRouter();
  const watchlist = useStore((state) => state.watchlist);
  const addWatchlistNumber = useStore((state) => state.addWatchlistNumber);
  const removeWatchlistNumber = useStore((state) => state.removeWatchlistNumber);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    const result = addWatchlistNumber(input);
    if (result === 'added') {
      tapFeedback();
      setInput('');
      setError('');
      return;
    }

    warnFeedback();
    setError(
      result === 'duplicate'
        ? 'That number is already on the watchlist.'
        : 'Enter a valid phone number, for example 0300 1234567.',
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        back
        eyebrow="Call protection"
        title="Call watchlist"
        subtitle="Record incoming calls from these numbers"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="call-outline" size={19} color={colors.pine} />
          </View>
          <Text style={styles.introText}>
            When call protection is on, an incoming call from one of these numbers is recorded
            after you answer. The recording is saved locally and sealed in the evidence vault.
          </Text>
        </View>

        <Text style={styles.label}>Add a number</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={(value) => {
              setInput(value);
              setError('');
            }}
            placeholder="0300 1234567 or +92 300 1234567"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            style={styles.input}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add number to call watchlist"
            onPress={handleAdd}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
            <Ionicons name="add" size={22} color={colors.sand} />
          </Pressable>
        </View>
        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.amber} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <Text style={styles.note}>
          Formats are normalized locally. Private or withheld numbers cannot be matched.
        </Text>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Watched numbers</Text>
          <Text style={styles.sectionMeta}>{watchlist.length}</Text>
        </View>

        {watchlist.length === 0 ? (
          <EmptyState
            icon="call-outline"
            title="No numbers yet"
            body="Add the number that has been harassing you. Only incoming calls from this list are recorded."
          />
        ) : (
          <View style={styles.listCard}>
            {watchlist.map((number, index) => (
              <View
                key={number}
                style={[styles.numberRow, index < watchlist.length - 1 && styles.divider]}>
                <View style={styles.numberIcon}>
                  <Ionicons name="call" size={16} color={colors.pine} />
                </View>
                <View style={styles.numberText}>
                  <Text style={styles.number}>{number}</Text>
                  <Text style={styles.numberSub}>Matched after normalization</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${number}`}
                  hitSlop={10}
                  onPress={() => {
                    tapFeedback();
                    removeWatchlistNumber(number);
                  }}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <Ionicons name="trash-outline" size={18} color={colors.harm} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.legalCard}>
          <Ionicons name="information-circle-outline" size={17} color={colors.amber} />
          <Text style={styles.legalText}>
            Record only calls you are part of, and tell the other person where the law requires it.
            Android may allow only microphone/room audio, not both sides of a cellular call.
          </Text>
        </View>

        <Button
          label="Back to call protection"
          icon="arrow-back-outline"
          variant="secondary"
          onPress={() => router.back()}
        />
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
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: 14,
  },
  introIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.safeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.mutedDark,
  },
  label: {
    marginTop: 22,
    marginBottom: 8,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.pine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 15,
    color: colors.amber,
  },
  note: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.muted,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
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
  listCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  numberIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.safeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    flex: 1,
    gap: 2,
  },
  number: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
  numberSub: {
    fontFamily: fonts.regular,
    fontSize: 9.5,
    color: colors.muted,
  },
  legalCard: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.md,
    padding: 11,
  },
  legalText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
    color: colors.amber,
  },
});
