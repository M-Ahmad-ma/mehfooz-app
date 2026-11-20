import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import type { Evidence } from '../types';

import { buildReportHtml } from './report';

/**
 * Generates the PDF and opens the share sheet. On web, falls back to the
 * browser print dialog. Returns the temporary file URI when one exists.
 */
export async function generateAndShareReport(items: Evidence[]): Promise<{ uri?: string }> {
  const html = buildReportHtml(items);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return {};
  }

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Mehfooz evidence pack',
      UTI: 'com.adobe.pdf',
    });
  } else {
    Alert.alert(
      'Sharing unavailable',
      'The PDF was generated on this device, but this build cannot open a share sheet.',
    );
  }

  return { uri };
}
