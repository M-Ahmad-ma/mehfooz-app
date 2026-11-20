import type { Category, Language } from '../types';

export type ScreenshotSample = {
  id: string;
  platform: string;
  username: string;
  handle: string;
  timeLabel: string;
  text: string;
  language: Language;
  pinned: { label: Category; confidence: number; reasons: string[] };
};

export const screenshotSamples: ScreenshotSample[] = [
  {
    id: 'shot-blackmail',
    platform: 'Facebook comment',
    username: 'R. Khan',
    handle: '@r.khan.92',
    timeLabel: '2h',
    text: 'Screenshot mere paas hain. Warna main sab ko bhej dunga.',
    language: 'roman-ur',
    pinned: {
      label: 'blackmail',
      confidence: 0.93,
      reasons: ['Blackmail phrase: “sab ko bhej dunga”', 'References a screenshot as leverage'],
    },
  },
  {
    id: 'shot-pashto',
    platform: 'Instagram DM',
    username: 'Unknown account',
    handle: '@user_8291',
    timeLabel: '5h',
    text: 'ته ډیره بې شرمه یې، دا عکس به ټولو ته ولېږم.',
    language: 'ps',
    pinned: {
      label: 'blackmail',
      confidence: 0.91,
      reasons: ['Threat to share a photo', 'Insult + distribution threat'],
    },
  },
  {
    id: 'shot-safe',
    platform: 'X reply',
    username: 'Hamza',
    handle: '@hamza_reads',
    timeLabel: '1d',
    text: 'This thread is really helpful. Thank you for sharing!',
    language: 'en',
    pinned: {
      label: 'safe',
      confidence: 0.97,
      reasons: ['No harmful signals found', 'Supportive reply'],
    },
  },
];

export function getScreenshotSample(id: string): ScreenshotSample | undefined {
  return screenshotSamples.find((sample) => sample.id === id);
}
