import * as React from 'react';
import type { ImageSourcePropType, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { colors, commonStyles, constants } from '../../../constants';
import { useAccessibilityPreferences } from '../../../hooks/useAccessibilityPreferences';
import { useRTLStyles } from '../../common/hooks/useRTLStyles';
import { getForegroundImageSizes } from '../../common/utils/getForegroundImageSizes';
import { scrollPosition } from '../../common/utils/scrollPosition';

interface ForegroundProps {
  hasSummary?: boolean;
  foregroundImage?: ImageSourcePropType;
  height: number;
  scrollValue: SharedValue<number>;
  title?: string;
  titleStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  titleTestID?: string;
}

export const Foreground: React.FC<ForegroundProps> = ({
  hasSummary,
  foregroundImage,
  height,
  scrollValue,
  title,
  titleStyle,
  titleTestID = 'TabbedHeaderForegroundTitleTestID',
}) => {
  const { reduceMotion, screenReaderEnabled } = useAccessibilityPreferences();
  const hideFromAccessibility = screenReaderEnabled && hasSummary;
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const isLandscape =
    windowWidth > windowHeight && windowHeight <= constants.breakpoints.mediumPhoneShorterEdge;

  const messageStyle = [styles.message, titleStyle];
  const { startSize, endSize } = getForegroundImageSizes(windowWidth, height, 10);
  const profilePicBorderRadius = startSize / 4;
  const [startImgFade, finishImgFade] = [scrollPosition(height, 22), scrollPosition(height, 27)];
  const [startImgSize, finishImgSize] = [scrollPosition(height, 20), scrollPosition(height, 30)];
  const [startTitleFade, finishTitleFade] = [
    scrollPosition(height, 25),
    scrollPosition(height, 45),
  ];

  const imageOpacityAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: 1 };
    }

    return {
      opacity: interpolate(
        scrollValue.value,
        [0, startImgFade, finishImgFade],
        [1, 1, 0],
        Extrapolation.CLAMP
      ),
    };
  }, [reduceMotion, scrollValue, startImgFade, finishImgFade]);
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const imageSize = reduceMotion
      ? startSize
      : interpolate(
          scrollValue.value,
          [0, startImgSize, finishImgSize],
          [startSize, startSize, endSize],
          Extrapolation.CLAMP
        );

    return {
      borderRadius: profilePicBorderRadius,
      height: imageSize,
      width: imageSize,
    };
  }, [
    reduceMotion,
    scrollValue,
    startImgSize,
    finishImgSize,
    startSize,
    endSize,
    profilePicBorderRadius,
  ]);
  const titleAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: 1 };
    }

    return {
      opacity: interpolate(
        scrollValue.value,
        [0, startTitleFade, finishTitleFade],
        [1, 1, 0],
        Extrapolation.CLAMP
      ),
    };
  }, [reduceMotion, scrollValue, startTitleFade, finishTitleFade]);

  const landscapeStyle = useRTLStyles<ViewStyle>(
    commonStyles.row,
    commonStyles.rowReverse,
    commonStyles.row
  );

  return (
    <View
      accessibilityElementsHidden={hideFromAccessibility}
      importantForAccessibility={hideFromAccessibility ? 'no-hide-descendants' : 'auto'}
      aria-hidden={hideFromAccessibility}
      pointerEvents="none"
      style={
        isLandscape
          ? [commonStyles.foregroundRow, landscapeStyle]
          : [commonStyles.foreground, commonStyles.column]
      }>
      {foregroundImage ? (
        <Animated.View style={imageOpacityAnimatedStyle}>
          <Animated.Image
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
            source={foregroundImage}
            style={imageAnimatedStyle}
          />
        </Animated.View>
      ) : null}
      <Animated.View style={[commonStyles.messageContainer, titleAnimatedStyle]}>
        <Animated.Text style={messageStyle} testID={titleTestID}>
          {title}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '500',
    lineHeight: 42,
    letterSpacing: -1,
    textAlign: 'left',
  },
});
