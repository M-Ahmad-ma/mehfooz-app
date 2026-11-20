import { NativeModule, requireNativeModule } from 'expo';

import type {
  ImagePayload,
  IncomingNotification,
  OcrResult,
  PendingShare,
} from '@/types';

type MehfoozNativeModuleEvents = {
  onNotification: (payload: IncomingNotification) => void;
  onShare: (payload: PendingShare) => void;
};

declare class MehfoozNativeModule extends NativeModule<MehfoozNativeModuleEvents> {
  isNativeAvailable(): boolean;
  hasNotificationAccess(): Promise<boolean>;
  openNotificationAccessSettings(): boolean;
  hasAlertNotificationPermission(): Promise<boolean>;
  requestAlertNotificationPermission(): boolean;
  setLiveCaptureEnabled(enabled: boolean): void;
  setBackgroundGeminiConfig(apiKey: string, model: string): void;
  isLiveCaptureEnabled(): boolean;
  setAllowedPackages(packages: string[]): void;
  getAllowedPackages(): string[];
  getPendingNotifications(): Promise<IncomingNotification[]>;
  acknowledgeNotifications(ids: string[]): void;
  cancelNotification(key: string): boolean;
  getPendingShare(): Promise<PendingShare | null>;
  clearPendingShare(): void;
  resetCaptureState(): void;
  recognizeText(
    path: string,
    language: 'latin' | 'urdu' | 'pashto',
  ): Promise<OcrResult>;
  getImagePayload(path: string): Promise<ImagePayload>;
}

let nativeModule: MehfoozNativeModule | null = null;

try {
  nativeModule = requireNativeModule<MehfoozNativeModule>('MehfoozNative');
} catch {
  // Expo Go and web do not contain the custom native module. The demo feed
  // remains available and the live UI shows an installation prompt.
  nativeModule = null;
}

export const isNativeAvailable = nativeModule !== null;

export const mehfoozNative = nativeModule;

export async function getPendingShare(): Promise<PendingShare | null> {
  if (!nativeModule) return null;
  try {
    const share = await nativeModule.getPendingShare();
    if (!share || !share.path) return null;
    return share;
  } catch {
    return null;
  }
}

export function setLiveCaptureEnabled(enabled: boolean): void {
  try {
    nativeModule?.setLiveCaptureEnabled(enabled);
  } catch {
    // Native errors must never break the demo feed.
  }
}

export function cancelNativeNotification(key: string): void {
  try {
    nativeModule?.cancelNotification(key);
  } catch {
    // Ignore missing service state.
  }
}

export function acknowledgeNativeNotifications(ids: string[]): void {
  try {
    nativeModule?.acknowledgeNotifications(ids);
  } catch {
    // Ignore queue cleanup errors.
  }
}

export function resetNativeCaptureState(): void {
  try {
    nativeModule?.resetCaptureState();
  } catch {
    // Ignore native state cleanup errors.
  }
}
