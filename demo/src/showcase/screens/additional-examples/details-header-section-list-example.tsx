import { useRouter } from 'expo-router';
import * as React from 'react';
import type { SectionListData } from 'react-native';
import { StyleSheet, useColorScheme } from 'react-native';
import { DetailsHeaderSectionList } from 'react-native-sticky-parallax-header';

import { Brandon } from '@/showcase/assets/data/cards';
import { CardsBlack, IconMenu, iconCloseWhite } from '@/showcase/assets/icons';
import { QuizCard } from '@/showcase/components';
import { SectionFooter } from '@/showcase/components/primitive-components/section-footer';
import { SectionHeader } from '@/showcase/components/primitive-components/section-header';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { detailsHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

export const DetailsHeaderSectionListExample: React.FC = () => {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const isDarkTheme = useColorScheme() === 'dark';

  const sections = React.useMemo(() => {
    const section: SectionListData<(typeof Brandon.cards)[0]> = {
      data: Brandon.cards,
      keyExtractor: (item) => item.question,
      renderItem: ({ item, index }) => (
        <QuizCard data={item} num={index} cardsAmount={Brandon.cards.length} />
      ),
    };

    return [section, section, section];
  }, []);

  return (
    <>
      <DetailsHeaderSectionList
        leftTopIcon={iconCloseWhite}
        leftTopIconOnPress={goBack}
        leftTopIconTestID={detailsHeaderTestIDs.headerLeftTopIcon}
        rightTopIcon={IconMenu}
        rightTopIconTestID={detailsHeaderTestIDs.headerRightTopIcon}
        contentContainerStyle={[
          styles.content,
          isDarkTheme ? screenStyles.darkBackground : screenStyles.lightBackground,
        ]}
        containerStyle={screenStyles.stretchContainer}
        contentIcon={CardsBlack}
        contentIconNumber={10}
        contentIconNumberTestID={detailsHeaderTestIDs.contentIconNumber}
        backgroundColor={Brandon.color}
        hasBorderRadius
        image={Brandon.image}
        tag={Brandon.type}
        tagTestID={detailsHeaderTestIDs.tag}
        title={Brandon.author}
        titleStyle={screenStyles.text}
        titleTestID={detailsHeaderTestIDs.title}
        renderSectionHeader={() => {
          return <SectionHeader />;
        }}
        renderSectionFooter={() => {
          return <SectionFooter />;
        }}
        sections={sections}
        showsVerticalScrollIndicator={false}
      />
      <ShowcaseStatusBar barStyle="light-content" backgroundColor={Brandon.color} translucent />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
  },
});
