import type { ReactElement } from 'react';
import type {
  ColorValue,
  ImageSourcePropType,
  NativeScrollEvent,
  ProcessedColorValue,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';

export type { ScrollComponent } from '../../primitiveComponents/ScrollComponent';

export type AnimatedColorProp =
  | ColorValue
  | ProcessedColorValue
  | Readonly<Pick<SharedValue<ColorValue | ProcessedColorValue>, 'value'>>;

export type ColorProp = ColorValue;

export interface IconProps {
  leftTopIcon?: (() => ReactElement | null) | ImageSourcePropType;
  leftTopIconAccessibilityLabel?: string;
  leftTopIconOnPress?: () => void;
  leftTopIconTestID?: string;
  rightTopIcon?: (() => ReactElement | null) | ImageSourcePropType;
  rightTopIconAccessibilityLabel?: string;
  rightTopIconOnPress?: () => void;
  rightTopIconTestID?: string;
}

export interface SharedPredefinedProps {
  backgroundColor?: AnimatedColorProp;
  backgroundImage?: ImageSourcePropType;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerHeight?: number;
  onMomentumScrollEnd?: (e: NativeScrollEvent) => void;
  onScroll?: (e: NativeScrollEvent) => void;
  onScrollEndDrag?: (e: NativeScrollEvent) => void;
  onTopReached?: () => void;
  parallaxHeight?: number;
  renderHeaderBar?: () => ReactElement | null;
  snapStartThreshold?: number;
  snapStopThreshold?: number;
  snapToEdge?: boolean;
}

export interface Tab {
  title?: string;
  icon?: (ReactElement | null) | ((isActive: boolean) => ReactElement | null);
  testID?: string;
}
export interface TabsConfig {
  tabTextActiveStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  tabTextContainerStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  tabTextContainerActiveStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  tabTextStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  tabUnderlineColor?: AnimatedColorProp;
  tabWrapperStyle?: StyleProp<ViewStyle>;
  tabs: Tab[];
  tabsContainerBackgroundColor?: AnimatedColorProp;
  tabsContainerHorizontalPadding?: number;
  tabsContainerStyle?: StyleProp<ViewStyle>;
}
