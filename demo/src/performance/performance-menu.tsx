import { useRouter } from 'expo-router';
import { Button, I18nManager, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { performanceScenarios } from '@/performance/catalogue';

export function PerformanceMenu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.menu}>
        <Button title="Catalogue" onPress={() => router.replace('/')} />
        <Text style={styles.title}>Performance scenarios</Text>
        <Text>Expo Go workload preview · release timing invalid</Text>
        <Text>
          {Platform.OS} {Platform.Version} · {I18nManager.isRTL ? 'RTL' : 'LTR'}
        </Text>
        {performanceScenarios.map((item) => (
          <Button
            key={item.id}
            title={item.label}
            testID={`performance-${item.id}`}
            onPress={() => router.replace(item.href)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const backgroundColor = '#ffffff';

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor },
  menu: { padding: 20, gap: 8 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 12 },
});
