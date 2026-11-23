import * as React from 'react';
import type {
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, commonStyles } from '../../../constants';
import { useAccessibilityPreferences } from '../../../hooks/useAccessibilityPreferences';
import type { AnimatedColorProp } from '../../common/SharedProps';
import { parseAnimatedColorProp } from '../../common/utils/parseAnimatedColorProp';

interface HeaderBarProps {
  backgroundColor?: AnimatedColorProp;
  enableSafeAreaTopInset?: boolean;
  summary?: string;
  titleStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  logo?: ImageSourcePropType;
  logoContainerStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  logoResizeMode?: ImageResizeMode;
  logoStyle?: StyleProp<AnimatedStyle<ImageStyle>>;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  summary,
  titleStyle,
  backgroundColor,
  enableSafeAreaTopInset,
  logo,
  logoResizeMode,
  logoStyle,
  logoContainerStyle,
}) => {
  const { screenReaderEnabled } = useAccessibilityPreferences();
  const hasSummary = screenReaderEnabled && !!summary;
  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      // TypeScript complains about AnimatedNode<StyleProp<ViewStyle>> from reanimated v1
      backgroundColor: parseAnimatedColorProp(backgroundColor) as string,
    };
  }, [backgroundColor]);
  const safeAreaEdges: Edge[] = ['left', 'right'];

  if (enableSafeAreaTopInset) {
    safeAreaEdges.push('top');
  }

  if (!logo && !hasSummary) {
    return <SafeAreaView edges={safeAreaEdges} style={commonStyles.stretch} />;
  }

  return (
    <SafeAreaView edges={safeAreaEdges} style={commonStyles.headerBarContainer}>
      <Animated.View style={[commonStyles.headerWrapper, logoContainerStyle, wrapperAnimatedStyle]}>
        {logo ? (
          <Animated.Image
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
            resizeMode={logoResizeMode}
            source={logo}
            style={[commonStyles.logo, logoStyle]}
          />
        ) : null}
        {hasSummary ? (
          <Animated.Text
            accessible
            accessibilityRole="header"
            accessibilityLabel={summary}
            style={[styles.title, titleStyle]}>
            {summary}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 20,
    flexShrink: 1,
    marginHorizontal: 12,
    textAlign: 'left',
  },
});
