import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import type { ScreenshotSample } from '@/data/screenshots';
import { initials, timeAgo } from '@/lib/format';
import { colors, fonts, radius, scriptTextStyle } from '@/theme';

type Props = {
  sample: ScreenshotSample;
};

export function ScreenshotPreview({ sample }: Props) {
  return (
    <View style={styles.frame}>
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>9:41</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={10} color={colors.inkSoft} />
          <Ionicons name="wifi" size={10} color={colors.inkSoft} />
          <Ionicons name="battery-full" size={12} color={colors.inkSoft} />
        </View>
      </View>

      <View style={styles.appBar}>
        <View style={styles.appBarText}>
          <Text style={styles.platform}>{sample.platform}</Text>
          <Text style={styles.platformSub}>Captured screenshot</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={14} color={colors.muted} />
      </View>

      <View style={styles.post}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(sample.username)}</Text>
          </View>
          <View style={styles.postHeaderText}>
            <Text style={styles.username} numberOfLines={1}>
              {sample.username}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              {sample.handle} · {sample.timeLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.text, scriptTextStyle(sample.language)]}>{sample.text}</Text>

        <View style={styles.actions}>
          <View style={styles.action}>
            <Ionicons name="heart-outline" size={12} color={colors.muted} />
            <Text style={styles.actionText}>24</Text>
          </View>
          <View style={styles.action}>
            <Ionicons name="chatbubble-outline" size={11} color={colors.muted} />
            <Text style={styles.actionText}>8</Text>
          </View>
          <View style={styles.action}>
            <Ionicons name="paper-plane-outline" size={11} color={colors.muted} />
          </View>
          <Text style={styles.captured}>Screenshot</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.sand,
  },
  statusTime: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.inkSoft,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  appBarText: {
    gap: 1,
  },
  platform: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: colors.ink,
  },
  platformSub: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
  },
  post: {
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.sandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.pine,
  },
  postHeaderText: {
    flex: 1,
    gap: 1,
  },
  username: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.ink,
  },
  handle: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
  },
  text: {
    marginTop: 9,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.muted,
  },
  captured: {
    marginLeft: 'auto',
    fontFamily: fonts.semibold,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.sandDeep,
  },
});
