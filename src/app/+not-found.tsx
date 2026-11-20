import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader back title="Not found" subtitle="This screen does not exist." />
      <EmptyState
        icon="compass-outline"
        title="Nothing here"
        body="The prototype only has the shield, vault, screenshot check, report and help screens."
        actionLabel="Back to the shield"
        onAction={() => router.navigate('/')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
});
