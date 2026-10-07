import { useRouter } from 'expo-router';
import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';

import type { User } from '@/showcase/assets/data/cards';
import { logo, photosPortraitMe } from '@/showcase/assets/images';
import { QuizListElement } from '@/showcase/components';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { colors, screenStyles } from '@/showcase/constants';
import { useShowcaseRefresh } from '@/showcase/hooks/use-showcase-refresh';
import { TABS, users } from '@/showcase/screens/home-screen/data';
import { EXAMPLES, ExampleLink } from '@/showcase/screens/home-screen/example-link';
import { homeScreenTestIDs } from '@/showcase/screens/home-screen/test-ids';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  const { refreshing, onRefresh } = useShowcaseRefresh();
  const [contentHeight, setContentHeight] = React.useState<{ [key: string]: number }>({});

  const calcMargin = (title: string): number => {
    let marginBottom = 50;

    if (contentHeight[title]) {
      const padding = 24;
      const isBigContent = windowHeight - contentHeight[title] < 0;

      if (isBigContent) {
        return marginBottom;
      }

      const headerHeight = 92;

      marginBottom = windowHeight - padding * 2 - headerHeight - contentHeight[title];

      return marginBottom > 0 ? marginBottom : 0;
    }

    return marginBottom;
  };

  const onLayoutContent = (title: string) => (e: LayoutChangeEvent) => {
    const newHeight = e.nativeEvent.layout.height;

    setContentHeight((prevHeight) => {
      return { ...prevHeight, [title]: newHeight };
    });
  };

  const navigateToCardScreen = React.useCallback(
    (user: User) => {
      return () => {
        router.push({ pathname: '/showcase/card/[user-id]', params: { 'user-id': user.id } });
      };
    },
    [router]
  );

  const pressUserModal = React.useCallback(
    (user: User) => {
      return () => {
        router.push({ pathname: '/showcase/author/[user-id]', params: { 'user-id': user.id } });
      };
    },
    [router]
  );

  return (
    <>
      <ShowcaseStatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryGreen}
        translucent
      />
      <TabbedHeaderPager
        containerStyle={screenStyles.stretchContainer}
        backgroundColor={colors.primaryGreen}
        tabsContainerBackgroundColor={colors.secondaryGreen}
        rememberTabScrollPosition
        logo={logo}
        title={"Mornin' Mark! \nReady for a quiz?"}
        titleStyle={screenStyles.text}
        titleTestID={homeScreenTestIDs.headerTitle}
        foregroundImage={photosPortraitMe}
        tabs={TABS.map((tab) => ({ title: tab.title, testID: tab.testID }))}
        tabTextStyle={screenStyles.text}
        // Refresh control is not implemented on web and even if provided, it will double padding top and bottom
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
        })}>
        {TABS.map((tab) => {
          const title = tab.contentTitle;
          const marginBottom = Platform.select({ ios: calcMargin(title) + 20, android: 10 });

          return (
            <View
              key={tab.testID}
              onLayout={onLayoutContent(title)}
              style={[screenStyles.content, { marginBottom }]}>
              <Text style={screenStyles.contentText} testID={tab.contentTestID}>
                {title}
              </Text>
              {users.map(
                (user) =>
                  (title === 'Popular Quizes' || title === user.type) && (
                    <QuizListElement
                      key={user.author}
                      elements={user.cardsAmount}
                      authorName={user.author}
                      mainText={user.label}
                      labelText={user.type}
                      imageSource={user.image}
                      onPress={navigateToCardScreen(user)}
                      pressUser={pressUserModal(user)}
                    />
                  )
              )}
              <Text style={screenStyles.contentText}>Check custom examples</Text>
              {EXAMPLES.map((example) => (
                <ExampleLink key={example.id} {...example} />
              ))}
            </View>
          );
        })}
      </TabbedHeaderPager>
    </>
  );
};

const styles = StyleSheet.create({
  refreshControl: {
    zIndex: 1,
  },
});

export default HomeScreen;
