import type { ReactElement, RefAttributes } from 'react';
import { SectionList } from 'react-native';

import type { SectionListRef } from './ScrollComponent';
import type { StickyHeaderSectionListProps } from './StickyHeaderProps';
import { withStickyHeader } from './withStickyHeader';

type StickyHeaderSectionListType = <ItemT, SectionT>(
  props: StickyHeaderSectionListProps<ItemT, SectionT> &
    RefAttributes<SectionListRef<ItemT, SectionT>>
) => ReactElement;

export const StickyHeaderSectionList = withStickyHeader(SectionList) as StickyHeaderSectionListType;
