import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RouteError } from '@/components/route-error';
import { getUser } from '@/showcase/assets/data/cards';
import UserModal from '@/showcase/components/example-components/user-modal';

export default function UserModalRoute() {
  const { 'user-id': userId } = useLocalSearchParams<{ 'user-id': string | string[] }>();
  const user = getUser(userId);

  // Native modal content needs gesture and safe-area roots in its own hierarchy.
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {user ? (
          <UserModal user={user} />
        ) : (
          <RouteError message="This quiz author does not exist." />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
