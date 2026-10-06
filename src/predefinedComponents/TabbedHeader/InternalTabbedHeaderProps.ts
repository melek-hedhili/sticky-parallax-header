import type { StyleProp, ViewStyle } from 'react-native';
import type { AnimatedRef } from 'react-native-reanimated';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';

import type { ScrollViewRef } from '../../primitiveComponents/ScrollComponent';

export interface InternalPagerProps {
  disableScrollToPosition?: boolean;
  initialPage?: number;
  minScrollHeight: number;
  onChangeTab?: (previousPage: number, newPage: number) => void;
  page: number;
  pageContainerStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  rememberTabScrollPosition?: boolean;
  scrollHeight: number;
  scrollRef: AnimatedRef<ScrollViewRef>;
  scrollValue: SharedValue<number>;
  swipedPage?: (index: number) => void;
}
