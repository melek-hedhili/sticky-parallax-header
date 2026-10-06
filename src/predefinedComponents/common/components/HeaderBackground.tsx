import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import type { AnimatedColorProp } from '../SharedProps';
import { parseAnimatedColorProp } from '../utils/parseAnimatedColorProp';

interface HeaderBackgroundProps {
  backgroundColor?: AnimatedColorProp;
  hasBorderRadius?: boolean;
  height: number;
  scrollValue: SharedValue<number>;
}

export const HeaderBackground: React.FC<HeaderBackgroundProps> = ({
  backgroundColor,
  hasBorderRadius,
  height,
  scrollValue,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const animatedBackgroundColor = parseAnimatedColorProp(backgroundColor);

    if (!hasBorderRadius) {
      return { backgroundColor: animatedBackgroundColor, borderBottomEndRadius: 0 };
    }

    return {
      backgroundColor: animatedBackgroundColor,
      borderBottomEndRadius: interpolate(
        scrollValue.value,
        [0, height],
        [80, 0],
        Extrapolation.EXTEND
      ),
    };
  }, [backgroundColor, hasBorderRadius, scrollValue, height]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.background, animatedStyle]}
      testID="HeaderBackground"
    />
  );
};

const styles = StyleSheet.create({
  background: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: -1,
  },
});
