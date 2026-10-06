import type { ReactElement, RefAttributes } from 'react';
import { FlatList } from 'react-native';

import type { FlatListRef } from './ScrollComponent';
import type { StickyHeaderFlatListProps } from './StickyHeaderProps';
import { withStickyHeader } from './withStickyHeader';

type StickyHeaderFlatListType = <ItemT>(
  props: StickyHeaderFlatListProps<ItemT> & RefAttributes<FlatListRef<ItemT>>
) => ReactElement;

export const StickyHeaderFlatList = withStickyHeader(FlatList) as StickyHeaderFlatListType;
