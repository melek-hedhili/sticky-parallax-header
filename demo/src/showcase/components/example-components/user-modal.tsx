import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

import type { User } from '@/showcase/assets/data/cards';
import { IconMenu, iconCloseWhite } from '@/showcase/assets/icons';
import QuizListElement from '@/showcase/components/example-components/quiz-list-element';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { colors, screenStyles } from '@/showcase/constants';

const UserModal: React.FC<{ user: User }> = ({ user }) => {
  const router = useRouter();

  const close = React.useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const openQuiz = React.useCallback(() => {
    router.dismissTo({
      pathname: '/showcase/card/[user-id]',
      params: { 'user-id': user.id },
    });
  }, [router, user.id]);

  return (
    <View style={styles.container}>
      <ShowcaseStatusBar backgroundColor={user.color} barStyle="light-content" />
      <AvatarHeaderScrollView
        image={user.image}
        title={user.author}
        subtitle={user.about}
        hasBorderRadius
        backgroundColor={user.color}
        leftTopIconOnPress={close}
        leftTopIcon={iconCloseWhite}
        rightTopIcon={IconMenu}>
        <View style={screenStyles.content}>
          <Text style={screenStyles.contentText}>{"Author's Quizes"}</Text>
          <QuizListElement
            elements={user.cardsAmount}
            authorName={user.author}
            mainText={user.label}
            labelText={user.type}
            imageSource={user.image}
            onPress={openQuiz}
          />
        </View>
      </AvatarHeaderScrollView>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.white } });

export default UserModal;
