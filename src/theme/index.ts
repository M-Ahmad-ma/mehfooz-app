import type { TextStyle } from 'react-native';

import type { Category, Language } from '../types';

export const colors = {
  ink: '#10231D',
  inkSoft: '#33463E',
  pine: '#0F3D33',
  pineDeep: '#082A23',
  pineLight: '#1D5A4B',
  sand: '#F4EFE6',
  sandDeep: '#E9E0D0',
  card: '#FFFDF8',
  line: '#DED5C4',
  lineSoft: '#EAE3D6',
  muted: '#718078',
  mutedDark: '#4B5B53',
  white: '#FFFFFF',
  harm: '#A4485A',
  harmDeep: '#8C2F3F',
  blackmail: '#6E3A5C',
  amber: '#8A5A1F',
  amberSoft: '#F6EBD8',
  safe: '#2F6B57',
  safeSoft: '#E3F0EA',
  overlay: 'rgba(8, 24, 19, 0.55)',
  redacted: 'rgba(244, 239, 230, 0.20)',
  scrim: 'rgba(15, 61, 51, 0.72)',
};

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
  urdu: 'NotoNastaliqUrdu_400Regular',
  urduBold: 'NotoNastaliqUrdu_700Bold',
  pashto: 'NotoNaskhArabic_400Regular',
  pashtoBold: 'NotoNaskhArabic_700Bold',
};

export const categoryMeta: Record<
  Category,
  { label: string; fg: string; bg: string; description: string }
> = {
  safe: {
    label: 'Safe',
    fg: colors.safe,
    bg: colors.safeSoft,
    description: 'No harmful intent detected',
  },
  abusive: {
    label: 'Abusive',
    fg: colors.amber,
    bg: colors.amberSoft,
    description: 'Insults or degrading language',
  },
  sexual: {
    label: 'Sexual',
    fg: colors.harm,
    bg: '#F8E4E9',
    description: 'Unwanted sexual content',
  },
  threat: {
    label: 'Threat',
    fg: colors.harmDeep,
    bg: '#F7DFE3',
    description: 'Threat of harm or intimidation',
  },
  blackmail: {
    label: 'Blackmail',
    fg: colors.blackmail,
    bg: '#F0E1EC',
    description: 'Coercion or threat to expose',
  },
};

export const languageLabels: Record<Language, string> = {
  ur: 'Urdu',
  'roman-ur': 'Roman Urdu',
  ps: 'Pashto',
  en: 'English',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const layout = {
  screenPadding: 20,
  tabBarHeight: 64,
  maxWidth: 560,
};

export function scriptTextStyle(language: Language): TextStyle {
  if (language === 'ur') {
    return {
      fontFamily: fonts.urdu,
      fontSize: 17,
      lineHeight: 38,
      textAlign: 'right',
      writingDirection: 'rtl',
    };
  }

  if (language === 'ps') {
    return {
      fontFamily: fonts.pashto,
      fontSize: 16,
      lineHeight: 30,
      textAlign: 'right',
      writingDirection: 'rtl',
    };
  }

  return {};
}
