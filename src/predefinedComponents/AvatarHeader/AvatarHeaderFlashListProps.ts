import type { StickyHeaderFlashListProps } from '../../primitiveComponents/StickyHeaderFlashListProps';

import type { AvatarHeaderSharedProps } from './AvatarHeaderProps';

export interface AvatarHeaderFlashListProps<ItemT>
  extends
    Omit<AvatarHeaderSharedProps, 'contentContainerStyle'>,
    StickyHeaderFlashListProps<ItemT> {}
