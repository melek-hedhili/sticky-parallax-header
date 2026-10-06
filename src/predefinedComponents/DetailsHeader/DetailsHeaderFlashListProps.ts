import type { StickyHeaderFlashListProps } from '../../primitiveComponents/StickyHeaderFlashListProps';

import type { DetailsHeaderSharedProps } from './DetailsHeaderProps';

export interface DetailsHeaderFlashListProps<ItemT>
  extends
    Omit<DetailsHeaderSharedProps, 'contentContainerStyle'>,
    StickyHeaderFlashListProps<ItemT> {}
