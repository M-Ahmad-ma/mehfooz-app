import Ionicons from '@expo/vector-icons/Ionicons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fileUri } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

type Props = {
  path: string;
  durationMs: number;
  compact?: boolean;
};

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minute = Math.floor(seconds / 60);
  const second = Math.floor(seconds % 60);
  return `${minute}:${String(second).padStart(2, '0')}`;
}

export function CallPlayer({ path, durationMs, compact }: Props) {
  const player = useAudioPlayer({ uri: fileUri(path) });
  const status = useAudioPlayerStatus(player);
  const duration = status.duration || durationMs / 1000;
  const progress = duration > 0 ? Math.min(1, status.currentTime / duration) : 0;

  async function toggle() {
    if (status.playing) {
      player.pause();
      return;
    }

    if (status.didJustFinish || (duration > 0 && status.currentTime >= duration - 0.25)) {
      await player.seekTo(0);
    }
    player.play();
  }

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pause recording' : 'Play recording'}
        onPress={(event) => {
          event.stopPropagation();
          void toggle();
        }}
        style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}>
        <Ionicons
          name={status.playing ? 'pause' : 'play'}
          size={compact ? 16 : 19}
          color={colors.sand}
        />
      </Pressable>

      <View style={styles.trackArea}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{clock(status.currentTime)}</Text>
          <Text style={styles.time}>{clock(duration)}</Text>
        </View>
      </View>

      {status.error ? <Text style={styles.error}>Playback failed</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.sandDeep,
    borderRadius: radius.md,
    padding: 10,
  },
  compactCard: {
    paddingVertical: 8,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.pine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  trackArea: {
    flex: 1,
    gap: 4,
  },
  track: {
    height: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.pine,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.muted,
  },
  error: {
    position: 'absolute',
    right: 10,
    bottom: 2,
    fontFamily: fonts.regular,
    fontSize: 8,
    color: colors.harm,
  },
});
