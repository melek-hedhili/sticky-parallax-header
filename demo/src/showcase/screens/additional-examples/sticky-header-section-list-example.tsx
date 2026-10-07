import * as React from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StickyHeaderSectionList } from 'react-native-sticky-parallax-header';

import { SECTIONS } from '@/showcase/assets/data/paragraphs';
import { Header } from '@/showcase/components/primitive-components/header';
import { SectionFooter } from '@/showcase/components/primitive-components/section-footer';
import { SectionHeader } from '@/showcase/components/primitive-components/section-header';
import { Tabs } from '@/showcase/components/primitive-components/tabs';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { useShowcaseRefresh } from '@/showcase/hooks/use-showcase-refresh';

export const StickyHeaderSectionListExample: React.FC = () => {
  const { refreshing, onRefresh } = useShowcaseRefresh();

  return (
    <SafeAreaView style={[screenStyles.screenContainer, screenStyles.lightBackground]}>
      <StickyHeaderSectionList
        containerStyle={screenStyles.stretchContainer}
        sections={SECTIONS}
        /**
         * Refresh control is not implemented on web, which causes styles as margin or padding
         * to be duplicated - ignore it on web, it will be no-op anyway
         *
         * TODO: describe it as a web limitation
         */
        {...Platform.select({ native: { onRefresh } })}
        refreshing={refreshing}
        renderHeader={() => <Header />}
        renderSectionHeader={() => {
          return <SectionHeader />;
        }}
        renderSectionFooter={() => {
          return <SectionFooter />;
        }}
        renderTabs={() => <Tabs />}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled
      />
      <ShowcaseStatusBar backgroundColor="transparent" barStyle="dark-content" />
    </SafeAreaView>
  );
};
