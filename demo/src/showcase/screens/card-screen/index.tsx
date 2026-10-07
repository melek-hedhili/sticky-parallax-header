import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { DetailsHeaderScrollView } from 'react-native-sticky-parallax-header';

import type { User } from '@/showcase/assets/data/cards';
import { CardsBlack, IconMenu, iconCloseWhite } from '@/showcase/assets/icons';
import { QuizCard } from '@/showcase/components';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { screenStyles } from '@/showcase/constants';
import { cardScreenTestIDs } from '@/showcase/screens/card-screen/test-ids';

const CardScreen: React.FC<{ user: User }> = ({ user }) => {
  const router = useRouter();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <>
      <DetailsHeaderScrollView
        title={user.author}
        titleStyle={screenStyles.text}
        titleTestID={cardScreenTestIDs.headerTitle}
        leftTopIcon={iconCloseWhite}
        leftTopIconOnPress={goBack}
        leftTopIconTestID={cardScreenTestIDs.headerLeftTopIcon}
        rightTopIcon={IconMenu}
        rightTopIconTestID={cardScreenTestIDs.headerRightTopIcon}
        tag={user.type}
        tagTestID={cardScreenTestIDs.headerTag}
        containerStyle={screenStyles.stretchContainer}
        backgroundColor={user.color}
        image={user.image}
        contentIcon={CardsBlack}
        contentIconNumber={10}
        contentIconNumberTestID={cardScreenTestIDs.headerContentIconNumber}>
        <View style={screenStyles.content}>
          {user.cards.map((data, i, arr) => (
            <QuizCard data={data} num={i} key={data.question} cardsAmount={arr.length} />
          ))}
        </View>
      </DetailsHeaderScrollView>
      <ShowcaseStatusBar barStyle="light-content" backgroundColor={user.color} translucent />
    </>
  );
};

export default CardScreen;
