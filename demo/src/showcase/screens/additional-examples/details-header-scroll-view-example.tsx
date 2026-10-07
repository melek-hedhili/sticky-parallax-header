import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { DetailsHeaderScrollView } from 'react-native-sticky-parallax-header';

import { Brandon } from '@/showcase/assets/data/cards';
import { CardsBlack, IconMenu, iconCloseWhite } from '@/showcase/assets/icons';
import { QuizCard } from '@/showcase/components';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { detailsHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

export const DetailsHeaderScrollViewExample: React.FC = () => {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const isDarkTheme = useColorScheme() === 'dark';

  return (
    <>
      <DetailsHeaderScrollView
        leftTopIcon={iconCloseWhite}
        leftTopIconOnPress={goBack}
        leftTopIconTestID={detailsHeaderTestIDs.headerLeftTopIcon}
        rightTopIcon={IconMenu}
        rightTopIconTestID={detailsHeaderTestIDs.headerRightTopIcon}
        contentContainerStyle={[
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
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {Brandon.cards.map((data, i, arr) => (
            <QuizCard data={data} num={i} key={data.question} cardsAmount={arr.length} />
          ))}
        </View>
      </DetailsHeaderScrollView>
      <ShowcaseStatusBar barStyle="light-content" backgroundColor={Brandon.color} translucent />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 24,
  },
});
