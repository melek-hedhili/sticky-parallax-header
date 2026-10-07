import { useLocalSearchParams } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RouteError } from '@/components/route-error';
import { getUser } from '@/showcase/assets/data/cards';
import UserModal from '@/showcase/components/example-components/user-modal';

export default function UserModalRoute() {
  const { 'user-id': userId } = useLocalSearchParams<{ 'user-id': string | string[] }>();
  const user = getUser(userId);

  // A presented native modal needs a provider in its own native view hierarchy.
  return (
    <SafeAreaProvider>
      {user ? <UserModal user={user} /> : <RouteError message="This quiz author does not exist." />}
    </SafeAreaProvider>
  );
}
