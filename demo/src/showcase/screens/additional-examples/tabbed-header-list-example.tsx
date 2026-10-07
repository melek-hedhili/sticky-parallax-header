import * as React from 'react';
import { TabbedHeaderList } from 'react-native-sticky-parallax-header';

import { TABBED_SECTIONS } from '@/showcase/assets/data/tabbed-sections';
import { TabbedSectionHeader } from '@/showcase/components/predefined-components/tabbed-section-header';
import {
  TABBED_SECTION_ITEM_HEIGHT,
  TabbedSectionItem,
} from '@/showcase/components/predefined-components/tabbed-section-item';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { colors, screenStyles } from '@/showcase/constants';
import { tabbedHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

export const TabbedHeaderListExample: React.FC = () => {
  return (
    <>
      <TabbedHeaderList
        contentContainerStyle={{ backgroundColor: colors.coralPink }}
        containerStyle={screenStyles.stretchContainer}
        backgroundColor={colors.coralPink}
        title="Food delivery app"
        titleStyle={screenStyles.text}
        titleTestID={tabbedHeaderTestIDs.title}
        foregroundImage={{ uri: 'https://foodish-api.herokuapp.com/images/samosa/samosa9.jpg' }}
        parallaxHeight={100}
        tabs={TABBED_SECTIONS.map(({ title, tabTestID }) => ({ title, testID: tabTestID }))}
        tabTextStyle={screenStyles.text}
        sections={TABBED_SECTIONS}
        tabTextContainerActiveStyle={{ backgroundColor: colors.activeOrange }}
        keyExtractor={(_, i) => `${i}`}
        renderItem={({ item }) => <TabbedSectionItem {...item} />}
        renderSectionHeader={({ section }) => (
          <TabbedSectionHeader title={section.title} tabTestID={section.tabTestID} />
        )}
        getItemLayout={(_, index) => ({
          length: TABBED_SECTION_ITEM_HEIGHT,
          offset: TABBED_SECTION_ITEM_HEIGHT * index,
          index,
        })}
        updateCellsBatchingPeriod={100}
        showsVerticalScrollIndicator={false}
      />
      <ShowcaseStatusBar barStyle="light-content" backgroundColor={colors.coralPink} translucent />
    </>
  );
};
