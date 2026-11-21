import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import { isNativeAvailable, mehfoozNative } from '../native/mehfoozNative';
import type { CallRecording, Evidence } from '../types';

import { buildReportHtml, type ReportImages } from './report';

async function collectImages(items: Evidence[]): Promise<ReportImages> {
  const images: ReportImages = {};
  if (!isNativeAvailable || !mehfoozNative) return images;

  for (const item of items) {
    if (!item.imagePath) continue;
    try {
      const payload = await mehfoozNative.getImagePayload(item.imagePath);
      if (payload?.base64) {
        images[item.id] = {
          base64: payload.base64,
          mimeType: payload.mimeType || 'image/jpeg',
        };
      }
    } catch {
      // A missing image must not block the rest of the evidence pack.
    }
  }

  return images;
}

/**
 * Generates the temporary PDF file. On web, falls back to the browser print
 * dialog and returns no file URI.
 */
export async function generateReportFile(
  items: Evidence[],
  calls: CallRecording[] = [],
): Promise<{ uri?: string }> {
  const images = await collectImages(items);
  const html = buildReportHtml(items, images, calls);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return {};
  }

  const { uri } = await Print.printToFileAsync({ html });
  return { uri };
}

/**
 * Generates the PDF and opens the share sheet. On web, falls back to the
 * browser print dialog. Returns the temporary file URI when one exists.
 */
export async function generateAndShareReport(
  items: Evidence[],
  calls: CallRecording[] = [],
): Promise<{ uri?: string }> {
  const { uri } = await generateReportFile(items, calls);
  if (!uri) return {};

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
