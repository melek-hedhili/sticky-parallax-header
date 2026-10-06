import * as React from 'react';
import type {
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { commonStyles } from '../../../constants';
import type { AnimatedColorProp } from '../../common/SharedProps';
import { parseAnimatedColorProp } from '../../common/utils/parseAnimatedColorProp';

interface HeaderBarProps {
  backgroundColor?: AnimatedColorProp;
  enableSafeAreaTopInset?: boolean;
  logo: ImageSourcePropType;
  logoContainerStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  logoResizeMode?: ImageResizeMode;
  logoStyle?: StyleProp<AnimatedStyle<ImageStyle>>;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  backgroundColor,
  enableSafeAreaTopInset,
  logo,
  logoResizeMode,
  logoStyle,
  logoContainerStyle,
}) => {
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

  return (
    <SafeAreaView edges={safeAreaEdges} style={commonStyles.headerBarContainer}>
      <Animated.View style={[commonStyles.headerWrapper, logoContainerStyle, wrapperAnimatedStyle]}>
        <Animated.Image
          resizeMode={logoResizeMode}
          source={logo}
          style={[commonStyles.logo, logoStyle]}
        />
      </Animated.View>
    </SafeAreaView>
  );
};
