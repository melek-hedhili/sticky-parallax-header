import { useRouter } from 'expo-router';
import { Button, I18nManager, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { validationCases } from '@/validation/catalogue';

export function ValidationMenu() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.fill}>
      <ScrollView contentContainerStyle={styles.menu}>
        <Button title="Catalogue" onPress={() => router.replace('/')} />
        <Text style={styles.title}>Validation cases</Text>
        <Text>Expo Go · {I18nManager.isRTL ? 'RTL' : 'LTR'}</Text>
        {validationCases.map((item) => (
          <Button
            key={item.id}
            title={item.label}
            testID={`case-${item.id}`}
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
