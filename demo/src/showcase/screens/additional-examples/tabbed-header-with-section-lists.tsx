import * as React from 'react';
import type { SectionListData } from 'react-native';
import { SectionList, StyleSheet, View, useColorScheme } from 'react-native';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';

import type { Question } from '@/showcase/assets/data/cards';
import { Brandon, Ewa, Jennifer } from '@/showcase/assets/data/cards';
import { logo, photosPortraitMe } from '@/showcase/assets/images';
import { QuizCard } from '@/showcase/components';
import { TabbedSectionHeader } from '@/showcase/components/predefined-components/tabbed-section-header';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { colors, screenStyles } from '@/showcase/constants';
import { tabbedHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

const QUIZ_SECTIONS: SectionListData<Question>[] = [
  {
    data: Brandon.cards,
    key: Brandon.author,
  },
  {
    data: Ewa.cards,
    key: Ewa.author,
  },
  {
    data: Jennifer.cards,
    key: Jennifer.author,
  },
];

const QUIZ_TAB_SECTIONS = [
  {
    title: Brandon.author,
    testID: Brandon.author + 'QuizTestID',
  },
  {
    title: Ewa.author,
    testID: Ewa.author + 'QuizTestID',
  },
  {
    title: Jennifer.author,
    testID: Jennifer.author + 'QuizTestID',
  },
];

const List: React.FC<{ startIndex: number }> = ({ startIndex }) => {
  return (
    <SectionList
      sections={QUIZ_SECTIONS.slice(startIndex).concat(QUIZ_SECTIONS.slice(0, startIndex))}
      stickySectionHeadersEnabled
      renderItem={({ item, index, section }) => {
        return <QuizCard data={item} num={index} cardsAmount={section.data.length} />;
      }}
      renderSectionHeader={({ section }) => {
        return <TabbedSectionHeader tabTestID={section.key ?? ''} title={section.key ?? ''} />;
      }}
    />
  );
};

export const TabbedHeaderWithSectionListsExample: React.FC = () => {
  const isDarkTheme = useColorScheme() === 'dark';

  return (
    <>
      <TabbedHeaderPager
        contentContainerStyle={[
          isDarkTheme ? screenStyles.darkBackground : screenStyles.lightBackground,
        ]}
        backgroundColor={colors.primaryGreen}
        containerStyle={screenStyles.stretchContainer}
        foregroundImage={photosPortraitMe}
        disableScrollToPosition={true}
        enableSafeAreaTopInset={false}
        rememberTabScrollPosition={false}
        logo={logo}
        title={"Mornin' Mark! \nReady for a quiz?"}
        titleStyle={screenStyles.text}
        titleTestID={tabbedHeaderTestIDs.title}
        stickyTabs={false}
        tabs={QUIZ_TAB_SECTIONS.map((section) => ({
          title: section.title,
          testID: section.testID,
        }))}
        tabTextStyle={screenStyles.text}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <List startIndex={0} />
        </View>
        <View style={styles.content}>
          <List startIndex={1} />
        </View>
        <View style={styles.content}>
          <List startIndex={2} />
        </View>
      </TabbedHeaderPager>
      <ShowcaseStatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryGreen}
        translucent
      />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
    paddingHorizontal: 24,
  },
});
