import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import type { AnimatedStyle, ScrollHandlerProcessed } from 'react-native-reanimated';

import type { StickyHeaderSharedProps } from './StickyHeaderProps';
import { useInternalStickyHeaderProps } from './useInternalStickyHeaderProps';

interface StickyHeaderLayout {
  contentContainerPaddingTop: number;
  contentContainerPaddingBottom: number;
  headerAnimatedStyle: AnimatedStyle<ViewStyle>;
  headerHeight: number;
  listPaddingTop: number;
  onHeaderLayoutInternal: (event: LayoutChangeEvent) => void;
  onTabsLayoutInternal: (event: LayoutChangeEvent) => void;
  scrollHandler: ScrollHandlerProcessed<Record<string, unknown>>;
  tabsHeight: number;
}

/** Public layout contract; gesture state belongs to the component wrappers. */
export function useStickyHeaderProps(props: StickyHeaderSharedProps): StickyHeaderLayout {
  const layout = useInternalStickyHeaderProps(props);

  return {
    contentContainerPaddingTop: layout.contentContainerPaddingTop,
    contentContainerPaddingBottom: layout.contentContainerPaddingBottom,
    headerAnimatedStyle: layout.headerAnimatedStyle,
    headerHeight: layout.headerHeight,
    listPaddingTop: layout.listPaddingTop,
    onHeaderLayoutInternal: layout.onHeaderLayoutInternal,
    onTabsLayoutInternal: layout.onTabsLayoutInternal,
    scrollHandler: layout.scrollHandler,
    tabsHeight: layout.tabsHeight,
  };
}
