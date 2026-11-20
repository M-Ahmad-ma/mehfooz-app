import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import {
  acknowledgeNativeNotifications,
  cancelNativeNotification,
  getPendingShare,
  isNativeAvailable,
  mehfoozNative,
  setLiveCaptureEnabled,
} from '@/native/mehfoozNative';
import { useStore } from '@/store/useStore';
import type { IncomingNotification, PendingShare } from '@/types';

/**
 * Lives at the root of the app. Drains the native notification queue, reacts
 * to live listener events and routes shared screenshots into the review screen.
 */
export function IncomingBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const liveMode = useStore((state) => state.liveMode);
  const addIncoming = useStore((state) => state.addIncoming);
  const setPendingShare = useStore((state) => state.setPendingShare);
  const processing = useRef(new Set<string>());

  useEffect(() => {
    if (isNativeAvailable) {
      setLiveCaptureEnabled(liveMode);
    }
  }, [liveMode]);

  useEffect(() => {
    if (!isNativeAvailable || !mehfoozNative) return;

    const native = mehfoozNative;
    let cancelled = false;

    async function process(payload: IncomingNotification) {
      if (!payload?.id || processing.current.has(payload.id)) return;
      processing.current.add(payload.id);

      try {
        const message = await addIncoming(payload);
        if (message && message.category !== 'safe') {
          cancelNativeNotification(payload.key);
        }
        acknowledgeNativeNotifications([payload.id]);
      } catch {
        // Leave the queue entry in place so the next foreground retry can
        // process it. Deduplication in the store makes retries safe.
      } finally {
        processing.current.delete(payload.id);
      }
    }

    async function drain() {
      try {
        const pending = await native.getPendingNotifications();
        for (const item of pending) {
          if (cancelled) return;
          await process(item);
        }
      } catch {
        // The queue is best-effort; the next foreground pass will retry.
      }
    }

    async function checkShare() {
      try {
        const share = await getPendingShare();
        if (!share || cancelled) return;

        const current = useStore.getState().pendingShare;
        if (!current || current.path !== share.path) {
          setPendingShare(share);
          if (pathnameRef.current !== '/shared-screenshot') {
            router.push('/shared-screenshot');
          }
        }
      } catch {
        // Ignore malformed pending shares.
      }
    }

    void drain();
    void checkShare();

    const notificationSubscription = native.addListener('onNotification', (payload) => {
      void process(payload);
    });

    const shareSubscription = native.addListener('onShare', (share: PendingShare) => {
      if (!share?.path || cancelled) return;
      setPendingShare(share);
      if (pathnameRef.current !== '/shared-screenshot') {
        router.push('/shared-screenshot');
      }
    });

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void drain();
        void checkShare();
      }
    });

    return () => {
      cancelled = true;
      notificationSubscription.remove();
      shareSubscription.remove();
      appStateSubscription.remove();
    };
  }, [addIncoming, router, setPendingShare]);

  return null;
}
