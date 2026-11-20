import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { isNativeAvailable, mehfoozNative } from '@/native/mehfoozNative';

export function useAlertNotificationPermission() {
  const [granted, setGranted] = useState(false);

  const refresh = useCallback(async () => {
    if (!isNativeAvailable || !mehfoozNative) return;
    try {
      setGranted(await mehfoozNative.hasAlertNotificationPermission());
    } catch {
      setGranted(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  const request = useCallback(() => {
    try {
      mehfoozNative?.requestAlertNotificationPermission();
    } catch {
      // Ignore unavailable native permission handling.
    }
    setTimeout(() => {
      void refresh();
    }, 900);
  }, [refresh]);

  return { granted, refresh, request };
}
