import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { Platform, RefreshControl, StyleSheet } from 'react-native';
import { withTabbedHeaderFlashList } from 'react-native-sticky-parallax-header/flash-list';

import type { ItemType, SectionType } from '@/showcase/assets/data/tabbed-sections';
import { FLASHLIST_TABBED_SECTIONS } from '@/showcase/assets/data/tabbed-sections';
import { TabbedSectionHeader } from '@/showcase/components/predefined-components/tabbed-section-header';
import { TabbedSectionItem } from '@/showcase/components/predefined-components/tabbed-section-item';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { colors, screenStyles } from '@/showcase/constants';
import { useShowcaseRefresh } from '@/showcase/hooks/use-showcase-refresh';
import { tabbedHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

function isNotEmpty<T>(item: T | null): item is T {
  return item !== null;
}

function isSection(item: SectionType | ItemType): item is SectionType {
  return typeof (item as SectionType).tabTestID === 'string';
}

const data = FLASHLIST_TABBED_SECTIONS;

const stickyHeaderIndices = data
  .map((item, index) => {
    return isSection(item) ? index : null;
  })
  .filter(isNotEmpty);

const tabs = data
  .map((item) => {
    return isSection(item) ? item : null;
  })
  .filter(isNotEmpty);

const PARALLAX_HEIGHT = 100;

const TabbedHeaderFlashList = withTabbedHeaderFlashList<SectionType | ItemType>(FlashList);

export const TabbedHeaderFlashListExample: React.FC = () => {
  const { refreshing, onRefresh } = useShowcaseRefresh();

  return (
    <>
      <TabbedHeaderFlashList
        data={data}
        renderItem={({ item }) => {
          if (isSection(item)) {
            return <TabbedSectionHeader title={item.title} tabTestID={item.tabTestID} />;
          }

          return <TabbedSectionItem {...item} />;
        }}
        getItemType={(item) => {
          return isSection(item) ? 'sectionHeader' : 'row';
        }}

        stickyHeaderIndices={stickyHeaderIndices}
        decelerationRate="normal"
        {...(Platform.OS !== 'web' && {
          refreshControl: (
            <RefreshControl
              //  z Index is required on IOS, to refresh indicator be visible
              style={styles.refreshControl}
              refreshing={refreshing}
              titleColor={colors.white}
              tintColor={colors.white}
              title="Refreshing"
              onRefresh={onRefresh}
            />
          ),
        })}
        backgroundColor={colors.coralPink}
        foregroundImage={{
          uri: 'https://foodish-api.herokuapp.com/images/samosa/samosa9.jpg',
        }}
        hasBorderRadius={false}
        parallaxHeight={PARALLAX_HEIGHT}
        tabTextContainerActiveStyle={styles.tabTextContainerActiveStyle}
        tabTextStyle={screenStyles.text}
        tabsContainerBackgroundColor={colors.coralPink}
        tabs={tabs}
        title="Food delivery app"
        titleStyle={screenStyles.text}
        titleTestID={tabbedHeaderTestIDs.title}
      />
      <ShowcaseStatusBar backgroundColor="transparent" barStyle="dark-content" />
    </>
  );
};

const styles = StyleSheet.create({
  refreshControl: {
    zIndex: 1,
  },
  tabTextContainerActiveStyle: {
    backgroundColor: colors.activeOrange,
  },
});
