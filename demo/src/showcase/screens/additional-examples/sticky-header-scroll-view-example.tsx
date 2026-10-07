import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StickyHeaderScrollView } from 'react-native-sticky-parallax-header';

import { DATA } from '@/showcase/assets/data/paragraphs';
import { Header } from '@/showcase/components/primitive-components/header';
import { Paragraph } from '@/showcase/components/primitive-components/paragraph';
import { Tabs } from '@/showcase/components/primitive-components/tabs';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';

export const StickyHeaderScrollViewExample: React.FC = () => {
  return (
    <SafeAreaView style={[screenStyles.screenContainer, screenStyles.lightBackground]}>
      <StickyHeaderScrollView
        containerStyle={screenStyles.stretchContainer}
        renderHeader={() => <Header />}
        renderTabs={() => <Tabs />}>
        {DATA.map((item, i) => (
          <Paragraph key={`${item}-${i}`} text={item} />
        ))}
      </StickyHeaderScrollView>
      <ShowcaseStatusBar backgroundColor="transparent" barStyle="dark-content" />
    </SafeAreaView>
  );
};
