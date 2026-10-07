import * as React from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StickyHeaderFlatList } from 'react-native-sticky-parallax-header';

import { DATA } from '@/showcase/assets/data/paragraphs';
import { Header } from '@/showcase/components/primitive-components/header';
import { Paragraph } from '@/showcase/components/primitive-components/paragraph';
import { Tabs } from '@/showcase/components/primitive-components/tabs';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { useShowcaseRefresh } from '@/showcase/hooks/use-showcase-refresh';

export const StickyHeaderFlatListExample: React.FC = () => {
  const { refreshing, onRefresh } = useShowcaseRefresh();

  return (
    <SafeAreaView style={[screenStyles.screenContainer, screenStyles.lightBackground]}>
      <StickyHeaderFlatList
        containerStyle={screenStyles.stretchContainer}
        data={DATA}
        keyExtractor={(item) => item}
        /**
         * Refresh control is not implemented on web, which causes styles as margin or padding
         * to be duplicated - ignore it on web, it will be no-op anyway
         *
         * TODO: describe it as a web limitation
         */
        {...Platform.select({ native: { onRefresh } })}
        refreshing={refreshing}
        renderHeader={() => <Header />}
        renderItem={({ item }) => {
          return <Paragraph text={item} />;
        }}
        renderTabs={() => <Tabs />}
        scrollEventThrottle={16}
      />
      <ShowcaseStatusBar backgroundColor="transparent" barStyle="dark-content" />
    </SafeAreaView>
  );
};
