import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { isNativeAvailable, mehfoozNative } from '@/native/mehfoozNative';

export function useNotificationAccess() {
  const [granted, setGranted] = useState(false);
  const [available] = useState(isNativeAvailable);

  const refresh = useCallback(async () => {
    if (!mehfoozNative) return;
    try {
      setGranted(await mehfoozNative.hasNotificationAccess());
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

  const openSettings = useCallback(() => {
    try {
      mehfoozNative?.openNotificationAccessSettings();
    } catch {
      // The settings screen may not exist on every Android distribution.
    }
  }, []);

  return { available, granted, refresh, openSettings };
}
