import { useRouter } from 'expo-router';

import { ShowcaseScene } from '@/showcase/components/showcase-scene';
import { TabbedHeaderWithSectionListsExample } from '@/showcase/screens/additional-examples/tabbed-header-with-section-lists';

export default function SectionListsRoute() {
  const router = useRouter();

  if (router.canGoBack()) {
    return <TabbedHeaderWithSectionListsExample />;
  }

  return (
    <ShowcaseScene>
      <TabbedHeaderWithSectionListsExample />
    </ShowcaseScene>
  );
}
