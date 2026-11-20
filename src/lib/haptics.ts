import * as Haptics from 'expo-haptics';

export function tapFeedback(): void {
  void Haptics.selectionAsync().catch(() => undefined);
}

export function warnFeedback(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}

export function successFeedback(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function impactFeedback(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}
