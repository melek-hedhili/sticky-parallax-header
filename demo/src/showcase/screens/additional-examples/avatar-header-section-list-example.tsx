import { useRouter } from 'expo-router';
import * as React from 'react';
import type { SectionListData } from 'react-native';
import { StyleSheet, useColorScheme } from 'react-native';
import { AvatarHeaderSectionList } from 'react-native-sticky-parallax-header';

import { Brandon } from '@/showcase/assets/data/cards';
import { IconMenu, iconCloseWhite } from '@/showcase/assets/icons';
import { QuizCard } from '@/showcase/components';
import { SectionFooter } from '@/showcase/components/primitive-components/section-footer';
import { SectionHeader } from '@/showcase/components/primitive-components/section-header';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { avatarHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

export const AvatarHeaderSectionListExample: React.FC = () => {
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
      <AvatarHeaderSectionList
        leftTopIcon={iconCloseWhite}
        leftTopIconOnPress={goBack}
        leftTopIconTestID={avatarHeaderTestIDs.headerLeftTopIcon}
        rightTopIcon={IconMenu}
        rightTopIconTestID={avatarHeaderTestIDs.headerRightTopIcon}
        contentContainerStyle={[
          styles.content,
          isDarkTheme ? screenStyles.darkBackground : screenStyles.lightBackground,
        ]}
        containerStyle={screenStyles.stretchContainer}
        backgroundColor={Brandon.color}
        hasBorderRadius
        image={Brandon.image}
        subtitle={Brandon.about}
        subtitleTestID={avatarHeaderTestIDs.subtitle}
        title={Brandon.author}
        titleStyle={screenStyles.text}
        titleTestID={avatarHeaderTestIDs.title}
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
