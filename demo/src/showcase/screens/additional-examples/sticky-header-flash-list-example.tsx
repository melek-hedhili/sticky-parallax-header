import type { FlashListRef } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StickyHeaderFlashListProps } from 'react-native-sticky-parallax-header/flash-list';
import {
  useStickyHeaderFlashListScrollProps,
  withStickyHeaderFlashList,
} from 'react-native-sticky-parallax-header/flash-list';

import { DATA } from '@/showcase/assets/data/paragraphs';
import { Header } from '@/showcase/components/primitive-components/header';
import { Paragraph } from '@/showcase/components/primitive-components/paragraph';
import { Tabs } from '@/showcase/components/primitive-components/tabs';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { useShowcaseRefresh } from '@/showcase/hooks/use-showcase-refresh';

const data = DATA.concat(DATA)
  .concat(DATA)
  .concat(DATA)
  .concat(DATA)
  .concat(DATA)
  .concat(DATA)
  .concat(DATA)
  .concat(DATA)
  .concat(DATA);

const PARALLAX_HEIGHT = 200;
const SNAP_START_THRESHOLD = 50;
const SNAP_STOP_THRESHOLD = PARALLAX_HEIGHT;

const StickyHeaderFlashList = withStickyHeaderFlashList(FlashList) as (
  props: StickyHeaderFlashListProps<string> & React.RefAttributes<FlashListRef<string>>
) => React.ReactElement;

export const StickyHeaderFlashListExample: React.FC = () => {
  const { refreshing, onRefresh } = useShowcaseRefresh();

  const { onMomentumScrollEnd, onScroll, onScrollEndDrag, scrollHeight, scrollViewRef } =
    useStickyHeaderFlashListScrollProps({
      parallaxHeight: PARALLAX_HEIGHT,
      snapStartThreshold: SNAP_START_THRESHOLD,
      snapStopThreshold: SNAP_STOP_THRESHOLD,
      snapToEdge: true,
    });

  return (
    <SafeAreaView style={[screenStyles.screenContainer, screenStyles.lightBackground]}>
      <StickyHeaderFlashList
        ref={scrollViewRef}
        containerStyle={screenStyles.stretchContainer}
        data={data}
        decelerationRate="fast"
        keyExtractor={(_, index) => `${index}`}
        /**
         * Refresh control is not implemented on web, which causes styles as margin or padding
         * to be duplicated - ignore it on web, it will be no-op anyway
         *
         * TODO: describe it as a web limitation
         */
        {...Platform.select({ native: { onRefresh } })}
        refreshing={refreshing}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        renderHeader={() => {
          return (
            <View pointerEvents="box-none" style={[styles.center, { height: scrollHeight }]}>
              <Header />
            </View>
          );
        }}
        renderItem={({ item }) => {
          return <Paragraph text={item} />;
        }}
        renderTabs={() => <Tabs />}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
      <ShowcaseStatusBar backgroundColor="transparent" barStyle="dark-content" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
