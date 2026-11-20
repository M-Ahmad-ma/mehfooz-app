import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { useStore } from '@/store/useStore';
import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  const evidenceCount = useStore((state) => state.evidence.length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pine,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 10.5,
          letterSpacing: 0.1,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shield',
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
              size={size}
              color={focused ? colors.pine : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarBadge: evidenceCount > 0 ? evidenceCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.pine,
            color: colors.sand,
            fontFamily: fonts.bold,
            fontSize: 9,
          },
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? 'folder-open' : 'folder-open-outline'}
              size={size}
              color={focused ? colors.pine : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="screenshot"
        options={{
          title: 'Scan',
          tabBarIcon: ({ size, focused }) => (
            <Ionicons name={focused ? 'scan' : 'scan-outline'} size={size} color={focused ? colors.pine : colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={focused ? colors.pine : colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
