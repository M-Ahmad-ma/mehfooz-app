import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';

import { isNativeAvailable, mehfoozNative } from '@/native/mehfoozNative';
import { useStore } from '@/store/useStore';
import type { CallPermissions } from '@/types';

const EMPTY_PERMISSIONS: CallPermissions = {
  microphone: false,
  phoneState: false,
  callLog: false,
};

function allGranted(permissions: CallPermissions): boolean {
  return permissions.microphone && permissions.phoneState && permissions.callLog;
}

export function useCallProtection() {
  const enabled = useStore((state) => state.callProtectionEnabled);
  const setEnabled = useStore((state) => state.setCallProtectionEnabled);
  const watchlist = useStore((state) => state.watchlist);
  const [permissions, setPermissions] = useState<CallPermissions>(EMPTY_PERMISSIONS);

  const refresh = useCallback(async () => {
    if (!isNativeAvailable || !mehfoozNative) {
      setPermissions(EMPTY_PERMISSIONS);
      return;
    }

    try {
      const [nextPermissions, nativeEnabled] = await Promise.all([
        mehfoozNative.hasCallPermissions(),
        mehfoozNative.isCallProtectionEnabled(),
      ]);
      setPermissions(nextPermissions);
      setEnabled(nativeEnabled);
    } catch {
      setPermissions(EMPTY_PERMISSIONS);
    }
  }, [setEnabled]);

  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const requestPermissions = useCallback(() => {
    if (!isNativeAvailable || !mehfoozNative) return;
    try {
      mehfoozNative.requestCallPermissions();
      mehfoozNative.requestAlertNotificationPermission();
    } catch {
      // Permission handlers are best-effort.
    }
    setTimeout(() => {
      void refresh();
    }, 1200);
  }, [refresh]);

  const enable = useCallback(async () => {
    if (!isNativeAvailable || !mehfoozNative) {
      Alert.alert(
        'Android build required',
        'Call recording needs the installed Android APK. Expo Go and the web preview cannot use it.',
      );
      return;
    }

    if (watchlist.length === 0) {
      Alert.alert('Add a number first', 'Add at least one number to the call watchlist.');
      return;
    }

    let current = permissions;
    if (!allGranted(current)) {
      requestPermissions();
      for (let attempt = 0; attempt < 8 && !allGranted(current); attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
          current = await mehfoozNative.hasCallPermissions();
          setPermissions(current);
        } catch {
          current = EMPTY_PERMISSIONS;
        }
      }
    }

    if (!allGranted(current)) {
      Alert.alert(
        'Permissions needed',
        'Mehfooz needs microphone, phone state, call log and notification access to match and record watchlisted calls.',
      );
      return;
    }

    try {
      mehfoozNative.requestAlertNotificationPermission();
      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          if (await mehfoozNative.hasAlertNotificationPermission()) break;
        } catch {
          // Keep polling; the permission dialog may be open.
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const started = mehfoozNative.startCallProtection();
      if (!started) {
        Alert.alert(
          'Could not start call protection',
          'Check that the microphone and phone permissions are allowed, then try again.',
        );
        return;
      }
      setEnabled(true);
    } catch {
      Alert.alert('Could not start call protection', 'Please try again.');
    }
  }, [permissions, requestPermissions, setEnabled, watchlist.length]);

  const disable = useCallback(() => {
    try {
      mehfoozNative?.stopCallProtection();
    } catch {
      // Ignore native shutdown errors.
    }
    setEnabled(false);
  }, [setEnabled]);

  const toggle = useCallback(
    (value: boolean) => {
      if (value) {
        void enable();
      } else {
        disable();
      }
    },
    [disable, enable],
  );

  return {
    available: isNativeAvailable,
    enabled,
    permissions,
    permissionsGranted: allGranted(permissions),
    requestPermissions,
    toggle,
    refresh,
  };
}
