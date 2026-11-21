import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { support } from '@/data/complaint';
import { warnFeedback } from '@/lib/haptics';
import { emailNcciaReport } from '@/lib/ncciaEmail';
import type { CallRecording, Evidence } from '@/types';

export function useNcciaEmail() {
  const [emailing, setEmailing] = useState(false);

  const send = useCallback(
    async (items: Evidence[], calls: CallRecording[] = []) => {
      if ((items.length === 0 && calls.length === 0) || emailing) return;

      setEmailing(true);
      try {
        await emailNcciaReport(items, calls);
      } catch (error) {
        warnFeedback();
        const noEmailApp =
          error instanceof Error && error.message.includes('No email app');

        Alert.alert(
          noEmailApp ? 'No email app found' : 'Could not open email',
          noEmailApp
            ? `Install or set up an email app, then send the evidence pack to ${support.ncciaEmail}.`
            : `The evidence pack could not be attached. Generate the PDF, then email it to ${support.ncciaEmail}.`,
        );
        console.warn('NCCIA email failed', error);
      } finally {
        setEmailing(false);
      }
    },
    [emailing],
  );

  return { emailing, send };
}
