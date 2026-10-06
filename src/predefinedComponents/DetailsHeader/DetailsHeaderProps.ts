import type { ImageSourcePropType, StyleProp, TextStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';

import type {
  StickyHeaderFlatListProps,
  StickyHeaderScrollViewProps,
  StickyHeaderSectionListProps,
} from '../../primitiveComponents/StickyHeaderProps';
import type { AnimatedColorProp, IconProps, SharedPredefinedProps } from '../common/SharedProps';

export interface DetailsHeaderSharedProps extends IconProps, SharedPredefinedProps {
  contentIcon?: ImageSourcePropType;
  contentIconNumber?: number;
  contentIconNumberStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  contentIconNumberTestID?: string;
  enableSafeAreaTopInset?: boolean;
  hasBorderRadius?: boolean;
  image?: ImageSourcePropType;
  tabsContainerBackgroundColor?: AnimatedColorProp;
  subtitle?: string;
  subtitleStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  subtitleTestID?: string;
  tag?: string;
  tagStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  tagTestID?: string;
  title?: string;
  titleStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  titleTestID?: string;
}

export interface DetailsHeaderScrollViewProps
  extends DetailsHeaderSharedProps, StickyHeaderScrollViewProps {}

export interface DetailsHeaderFlatListProps<ItemT>
  extends DetailsHeaderSharedProps, StickyHeaderFlatListProps<ItemT> {}

export interface DetailsHeaderSectionListProps<ItemT, SectionT>
  extends DetailsHeaderSharedProps, StickyHeaderSectionListProps<ItemT, SectionT> {}
