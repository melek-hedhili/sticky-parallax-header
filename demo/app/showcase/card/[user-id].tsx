import { useLocalSearchParams } from 'expo-router';

import { RouteError } from '@/components/route-error';
import { getUser } from '@/showcase/assets/data/cards';
import CardScreen from '@/showcase/screens/card-screen';

export default function CardScreenRoute() {
  const { 'user-id': userId } = useLocalSearchParams<{ 'user-id': string | string[] }>();
  const user = getUser(userId);

  if (!user) {
    return <RouteError message="This quiz author does not exist." />;
  }

  return <CardScreen user={user} />;
}
