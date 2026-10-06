import type { FlashListRef } from '@shopify/flash-list';
import { useMemo } from 'react';
import type { ColorValue } from 'react-native';
import { StyleSheet } from 'react-native';

import { useStickyHeaderFlashListScrollProps } from '../../../primitiveComponents/useStickyHeaderFlashListScrollProps';
import type { SharedPredefinedProps } from '../SharedProps';

import { usePredefinedHeaderHeight } from './usePredefinedHeaderHeight';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePredefinedFlashListHeader<T extends FlashListRef<any>>(
  props: SharedPredefinedProps
): ReturnType<typeof useStickyHeaderFlashListScrollProps<T>> & {
  contentBackgroundColor: ColorValue | undefined;
  innerScrollHeight: number;
  parallaxHeight: number;
} {
  const { contentContainerStyle, headerHeight = 100 } = props;
  const { height, parallaxHeight } = usePredefinedHeaderHeight(props.parallaxHeight);

  const {
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  } = useStickyHeaderFlashListScrollProps<T>({ ...props, parallaxHeight });

  const innerScrollHeight = Math.max(0, height - headerHeight - scrollHeight);

  const { contentBackgroundColor } = useMemo(() => {
    const contentContainerFlattenedStyle = StyleSheet.flatten(contentContainerStyle);

    return { contentBackgroundColor: contentContainerFlattenedStyle?.backgroundColor };
  }, [contentContainerStyle]);

  return {
    contentBackgroundColor,
    innerScrollHeight,
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    parallaxHeight,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  };
}
