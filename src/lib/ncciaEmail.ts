import * as MailComposer from 'expo-mail-composer';
import { Linking, Platform } from 'react-native';

import { support } from '@/data/complaint';
import { fileUri } from '@/lib/format';
import { categoryMeta } from '@/theme';
import type { CallRecording, Evidence } from '@/types';

import { generateReportFile } from './pdf';
import { reportSummary } from './report';

export function buildNcciaEmail(
  items: Evidence[],
  calls: CallRecording[] = [],
): { subject: string; body: string } {
  const summary = reportSummary(items, calls);
  const categories = summary.categories
    .map((category) => categoryMeta[category].label)
    .join(', ');

  const subject = `Cyber harassment complaint · ${summary.caseRef}`;
  const body = [
    'To the NCCIA Helpdesk,',
    '',
    'Please find attached an evidence pack prepared with Mehfooz for a cyber harassment complaint.',
    '',
    `Case reference: ${summary.caseRef}`,
    `Evidence records: ${summary.count}`,
    `Call recordings: ${summary.callCount}`,
    `Date range: ${summary.range}`,
    `Categories: ${categories || 'Not available'}`,
    '',
    'The PDF contains the original message text, sender names, timestamps, classifier confidence and SHA-256 integrity hashes. Screenshots are included where available. Selected call recordings are attached as separate audio files and their metadata and hashes are in the PDF.',
    '',
    'Please confirm receipt and share the complaint number and any next steps.',
    '',
    'Regards,',
    '',
  ].join('\n');

  return { subject, body };
}

/**
 * Opens the device email composer with the NCCIA address, a prefilled
 * complaint summary and the generated PDF attached. It never sends the email;
 * the user reviews and taps send in their own mail app.
 */
export async function emailNcciaReport(
  items: Evidence[],
  calls: CallRecording[] = [],
): Promise<void> {
  const { subject, body } = buildNcciaEmail(items, calls);

  if (Platform.OS === 'web') {
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    await Linking.openURL(`mailto:${support.ncciaEmail}?${query}`);
    return;
  }

  if (!(await MailComposer.isAvailableAsync())) {
    throw new Error('No email app is available.');
  }

  const { uri } = await generateReportFile(items, calls);
  if (!uri) {
    throw new Error('The PDF file was not created.');
  }

  await MailComposer.composeAsync({
    recipients: [support.ncciaEmail],
    subject,
    body,
    attachments: [uri, ...calls.map((call) => fileUri(call.audioPath))],
  });
}
