import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FocusedScene } from '@/components/focused-scene';
import { RouteError } from '@/components/route-error';
import { validationCases } from '@/validation/catalogue';
import { ValidationFixture } from '@/validation/validation-fixture';

export default function ValidationCaseRoute() {
  const { case: caseId } = useLocalSearchParams<{ case: string | string[] }>();
  const router = useRouter();
  const selected = validationCases.find((item) => item.id === caseId);

  if (!selected) {
    return <RouteError message="Unknown validation case." href="/validation" />;
  }

  return (
    <FocusedScene>
      <SafeAreaView style={styles.fill}>
        <Button
          title="All cases"
          testID="all-cases"
          onPress={() => router.replace('/validation')}
        />
        <ValidationFixture key={selected.id} name={selected.label} />
      </SafeAreaView>
    </FocusedScene>
  );
}

const backgroundColor = '#ffffff';

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor },
});
