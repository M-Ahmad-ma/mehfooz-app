import { Alert, Linking } from 'react-native';

export async function openUrl(url: string, fallbackMessage: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Link unavailable', fallbackMessage);
  }
}

export function callNumber(number: string): void {
  void openUrl(`tel:${number}`, `Dial ${number} from your phone.`);
}

export function openWeb(url: string, fallbackMessage: string): void {
  void openUrl(url, fallbackMessage);
}
