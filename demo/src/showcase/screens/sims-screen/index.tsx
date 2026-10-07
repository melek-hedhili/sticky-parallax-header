import * as React from 'react';
import type { ScrollView } from 'react-native';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StickyHeaderScrollView,
  useStickyHeaderScrollProps,
} from 'react-native-sticky-parallax-header';

import { Tabs } from '@/showcase/components/primitive-components/tabs';
import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { colors, screenStyles } from '@/showcase/constants';
import { text } from '@/showcase/screens/sims-screen/data';
import { Foreground } from '@/showcase/screens/sims-screen/foreground';
import { HeaderBar } from '@/showcase/screens/sims-screen/header-bar';
import { simsScreenTestIDs } from '@/showcase/screens/sims-screen/test-ids';

const PARALLAX_HEIGHT = 330;
const HEADER_BAR_HEIGHT = 92;
const SNAP_START_THRESHOLD = 50;
const SNAP_STOP_THRESHOLD = 330;

const SimsScreen: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const {
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  } = useStickyHeaderScrollProps<ScrollView>({
    parallaxHeight: PARALLAX_HEIGHT,
    snapStartThreshold: SNAP_START_THRESHOLD,
    snapStopThreshold: SNAP_STOP_THRESHOLD,
    snapToEdge: true,
  });

  return (
    <View style={screenStyles.screenContainer}>
      <View style={[styles.headerBarContainer, { width: windowWidth }]}>
        <HeaderBar scrollValue={scrollValue} />
      </View>
      <View style={screenStyles.stretchContainer}>
        <StickyHeaderScrollView
          ref={scrollViewRef}
          containerStyle={screenStyles.stretchContainer}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          renderHeader={() => {
            return (
              <View pointerEvents="box-none" style={{ height: scrollHeight }}>
                <Foreground scrollValue={scrollValue} />
              </View>
            );
          }}
          renderTabs={() => (
            <View style={styles.tabContainer}>
              <Tabs />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          style={screenStyles.stretch}>
          <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.content}>
            <Text style={screenStyles.text} testID={simsScreenTestIDs.contentTestID}>
              {text}
            </Text>
          </SafeAreaView>
        </StickyHeaderScrollView>
      </View>
      <ShowcaseStatusBar barStyle="light-content" backgroundColor={colors.black} translucent />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    alignSelf: 'stretch',
  },
  headerBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: colors.transparent,
    height: HEADER_BAR_HEIGHT,
    flex: 1,
    overflow: 'hidden',
    zIndex: 3,
  },
  tabContainer: {
    paddingTop: HEADER_BAR_HEIGHT,
  },
});

export default SimsScreen;
