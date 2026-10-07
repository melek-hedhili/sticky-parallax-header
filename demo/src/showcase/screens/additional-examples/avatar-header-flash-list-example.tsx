import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { withAvatarHeaderFlashList } from 'react-native-sticky-parallax-header/flash-list';

import type { Question } from '@/showcase/assets/data/cards';
import { Brandon } from '@/showcase/assets/data/cards';
import { IconMenu, iconCloseWhite } from '@/showcase/assets/icons';
import { QuizCard } from '@/showcase/components';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { avatarHeaderTestIDs } from '@/showcase/screens/additional-examples/test-ids';

const cards = Brandon.cards
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards)
  .concat(Brandon.cards);

const data = cards.map((card, index) => ({ ...card, id: `${index}` }));

const AvatarHeaderFlashList = withAvatarHeaderFlashList<Question & { id: string }>(FlashList);

export const AvatarHeaderFlashListExample: React.FC = () => {
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
      <AvatarHeaderFlashList
        leftTopIcon={iconCloseWhite}
        leftTopIconOnPress={goBack}
        leftTopIconTestID={avatarHeaderTestIDs.headerLeftTopIcon}
        rightTopIcon={IconMenu}
        rightTopIconTestID={avatarHeaderTestIDs.headerRightTopIcon}
        contentContainerStyle={
          isDarkTheme ? screenStyles.darkBackground : screenStyles.lightBackground
        }
        containerStyle={screenStyles.stretchContainer}
        backgroundColor={Brandon.color}
        hasBorderRadius
        image={Brandon.image}
        subtitle={Brandon.about}
        subtitleTestID={avatarHeaderTestIDs.subtitle}
        title={Brandon.author}
        titleStyle={screenStyles.text}
        titleTestID={avatarHeaderTestIDs.title}
        data={data}
        keyExtractor={(item) => item.id}
        decelerationRate="normal"
        renderItem={({ item, index }) => (
          <QuizCard
            data={item}
            num={index % Brandon.cards.length}
            cardsAmount={Brandon.cards.length}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
      <ShowcaseStatusBar barStyle="light-content" backgroundColor={Brandon.color} translucent />
    </>
  );
};
