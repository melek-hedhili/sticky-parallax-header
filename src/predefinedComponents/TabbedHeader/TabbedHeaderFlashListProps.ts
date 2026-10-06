import type { StickyHeaderFlashListProps } from '../../primitiveComponents/StickyHeaderFlashListProps';

import type { TabbedHeaderSharedProps } from './TabbedHeaderProps';

export interface TabbedHeaderFlashListProps<ItemT>
  extends
    Omit<TabbedHeaderSharedProps, 'contentContainerStyle'>,
    StickyHeaderFlashListProps<ItemT> {}
