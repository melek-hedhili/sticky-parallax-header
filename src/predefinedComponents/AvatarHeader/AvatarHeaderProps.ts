import type { ImageSourcePropType, StyleProp, TextStyle } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';

import type {
  StickyHeaderFlatListProps,
  StickyHeaderScrollViewProps,
  StickyHeaderSectionListProps,
} from '../../primitiveComponents/StickyHeaderProps';
import type { AnimatedColorProp, IconProps, SharedPredefinedProps } from '../common/SharedProps';

export interface AvatarHeaderSharedProps extends IconProps, SharedPredefinedProps {
  enableSafeAreaTopInset?: boolean;
  hasBorderRadius?: boolean;
  image?: ImageSourcePropType;
  subtitle?: string;
  subtitleStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  subtitleTestID?: string;
  tabsContainerBackgroundColor?: AnimatedColorProp;
  title?: string;
  titleStyle?: StyleProp<AnimatedStyle<TextStyle>>;
  titleTestID?: string;
}

export interface AvatarHeaderScrollViewProps
  extends AvatarHeaderSharedProps, StickyHeaderScrollViewProps {}

export interface AvatarHeaderFlatListProps<ItemT>
  extends AvatarHeaderSharedProps, StickyHeaderFlatListProps<ItemT> {}

export interface AvatarHeaderSectionListProps<ItemT, SectionT>
  extends AvatarHeaderSharedProps, StickyHeaderSectionListProps<ItemT, SectionT> {}
