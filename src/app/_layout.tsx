import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_700Bold,
} from '@expo-google-fonts/noto-naskh-arabic';
import {
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_700Bold,
} from '@expo-google-fonts/noto-nastaliq-urdu';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BootScreen } from '@/components/BootScreen';
import { Onboarding } from '@/components/Onboarding';
import { useHydrated, useStore } from '@/store/useStore';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    NotoNastaliqUrdu_400Regular,
    NotoNastaliqUrdu_700Bold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
  });

  const hydrated = useHydrated();
  const hasOnboarded = useStore((state) => state.hasOnboarded);
  const completeOnboarding = useStore((state) => state.completeOnboarding);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!hydrated) return;
    if (useStore.getState().hasOnboarded) {
      useStore.getState().seedInbox();
    }
  }, [hydrated]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={!hydrated || !hasOnboarded ? 'light' : 'dark'} />

      {!hydrated ? (
        <BootScreen />
      ) : !hasOnboarded ? (
        <Onboarding onDone={completeOnboarding} />
      ) : (
        <View style={styles.root}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.sand },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="vault/[id]" />
            <Stack.Screen name="report" />
            <Stack.Screen name="help" />
            <Stack.Screen name="shielded" />
          </Stack>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
});
