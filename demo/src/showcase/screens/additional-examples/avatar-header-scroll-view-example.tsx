import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

import { Brandon } from '@/showcase/assets/data/cards';
import { IconMenu, iconCloseWhite } from '@/showcase/assets/icons';
import { QuizCard } from '@/showcase/components';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { avatarHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

export const AvatarHeaderScrollViewExample: React.FC = () => {
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
      <AvatarHeaderScrollView
        leftTopIcon={iconCloseWhite}
        leftTopIconOnPress={goBack}
        leftTopIconTestID={avatarHeaderTestIDs.headerLeftTopIcon}
        rightTopIcon={IconMenu}
        rightTopIconTestID={avatarHeaderTestIDs.headerRightTopIcon}
        contentContainerStyle={[
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
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {Brandon.cards.map((data, i, arr) => (
            <QuizCard data={data} num={i} key={data.question} cardsAmount={arr.length} />
          ))}
        </View>
      </AvatarHeaderScrollView>
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
