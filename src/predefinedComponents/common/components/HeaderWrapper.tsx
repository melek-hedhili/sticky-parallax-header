import * as React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, useWindowDimensions } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { colors } from '../../../constants';
import { useHeaderElasticity } from '../../../primitiveComponents/ElasticHeaderContext';
import type { AnimatedColorProp } from '../SharedProps';
import { parseAnimatedColorProp } from '../utils/parseAnimatedColorProp';

import { HeaderBackground } from './HeaderBackground';
import { HeaderBackgroundImage } from './HeaderBackgroundImage';

interface HeaderWrapperProps {
  backgroundColor?: AnimatedColorProp;
  backgroundImage?: ImageSourcePropType;
  contentBackgroundColor?: AnimatedColorProp;
  hasBorderRadius?: boolean;
  parallaxHeight: number;
  scrollHeight: number;
  scrollValue: SharedValue<number>;
  tabsContainerBackgroundColor?: AnimatedColorProp;
}

export const HeaderWrapper: React.FC<React.PropsWithChildren<HeaderWrapperProps>> = ({
  backgroundColor,
  backgroundImage,
  children,
  contentBackgroundColor,
  hasBorderRadius,
  parallaxHeight,
  scrollHeight,
  scrollValue,
  tabsContainerBackgroundColor,
}) => {
  const { width } = useWindowDimensions();
  const { displacement } = useHeaderElasticity();
  const hasBackgroundImage = !!backgroundImage;
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const pull = scrollHeight > 0 ? Math.max(0, displacement.value) : 0;

    // The overlay moves down with the pull; extend its backdrop back to the original top.
    return {
      transform: [{ translateY: -pull / 2 }, { scaleY: 1 + pull / Math.max(scrollHeight, 1) }],
    };
  }, [displacement, scrollHeight]);
  const contentAnimatedStyle = useAnimatedStyle(() => {
    // TypeScript complains about AnimatedNode<StyleProp<ViewStyle>> from reanimated v1
    return { backgroundColor: parseAnimatedColorProp(contentBackgroundColor) as string };
  }, [contentBackgroundColor]);
  const foregroundAnimatedStyle = useAnimatedStyle(() => {
    if (hasBackgroundImage) {
      return { backgroundColor: colors.transparent };
    }

    return {
      backgroundColor: parseAnimatedColorProp(tabsContainerBackgroundColor),
    };
  }, [hasBackgroundImage, tabsContainerBackgroundColor]);

  return (
    <Animated.View pointerEvents="box-none" style={contentAnimatedStyle}>
      <Animated.View
        pointerEvents="none"
        style={[styles.headerStyle, { height: scrollHeight, width }, backdropAnimatedStyle]}
        testID="HeaderBackdrop">
        {backgroundImage ? (
          <HeaderBackgroundImage
            background={
              <HeaderBackground
                backgroundColor={backgroundColor}
                hasBorderRadius={hasBorderRadius}
                height={parallaxHeight}
                scrollValue={scrollValue}
              />
            }
            backgroundHeight={scrollHeight}
            backgroundImage={backgroundImage}
          />
        ) : (
          <HeaderBackground
            backgroundColor={backgroundColor}
            hasBorderRadius={hasBorderRadius}
            height={parallaxHeight}
            scrollValue={scrollValue}
          />
        )}
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={[
          {
            height: scrollHeight,
          },
          foregroundAnimatedStyle,
        ]}
        testID="HeaderForeground">
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
});
