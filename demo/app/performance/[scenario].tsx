import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocusedScene } from '@/components/focused-scene';
import { RouteError } from '@/components/route-error';
import { performanceScenarios } from '@/performance/catalogue';
import { PerformanceScene } from '@/performance/performance-scene';

export default function PerformanceScenarioRoute() {
  const { scenario: scenarioId } = useLocalSearchParams<{ scenario: string | string[] }>();
  const router = useRouter();
  const selected = performanceScenarios.find((item) => item.id === scenarioId);

  if (!selected) {
    return <RouteError message="Unknown performance scenario." href="/performance" />;
  }

  return (
    <FocusedScene>
      <SafeAreaView style={styles.fill}>
        <Button title="All benchmarks" onPress={() => router.replace('/performance')} />
        <Text style={styles.notice}>Expo Go workload preview · release timing invalid</Text>
        <PerformanceScene key={selected.id} scenario={selected.label} />
      </SafeAreaView>
    </FocusedScene>
  );
}

const backgroundColor = '#ffffff';

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor },
  notice: { padding: 4, textAlign: 'center', fontSize: 12 },
});
