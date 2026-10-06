import type { ReactElement, RefAttributes } from 'react';
import { ScrollView } from 'react-native';

import type { ScrollViewRef } from './ScrollComponent';
import type { StickyHeaderScrollViewProps } from './StickyHeaderProps';
import { withStickyHeader } from './withStickyHeader';

type StickyHeaderScrollViewType = (
  props: StickyHeaderScrollViewProps & RefAttributes<ScrollViewRef>
) => ReactElement;

export const StickyHeaderScrollView = withStickyHeader(ScrollView) as StickyHeaderScrollViewType;
