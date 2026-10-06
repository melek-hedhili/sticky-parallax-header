import type { FlashListProps } from '@shopify/flash-list';
import type { AnimatedProps } from 'react-native-reanimated';

import type { StickyHeaderSharedProps } from './StickyHeaderProps';

export interface StickyHeaderFlashListProps<ItemT>
  extends
    Omit<StickyHeaderSharedProps, 'contentContainerStyle' | 'style'>,
    Omit<
      AnimatedProps<FlashListProps<ItemT>>,
      | 'children'
      | 'contentContainerStyle'
      | 'data'
      | 'renderItem'
      | 'onScroll'
      | 'onScrollBeginDrag'
      | 'onScrollEndDrag'
      | 'onMomentumScrollBegin'
      | 'onMomentumScrollEnd'
      | 'onViewableItemsChanged'
      | 'stickyHeaderIndices'
      | 'style'
    >,
    Pick<
      FlashListProps<ItemT>,
      | 'contentContainerStyle'
      | 'renderItem'
      | 'onViewableItemsChanged'
      | 'stickyHeaderIndices'
      | 'style'
    > {
  data: ReadonlyArray<ItemT>;
}
