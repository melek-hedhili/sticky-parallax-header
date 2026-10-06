import { useMemo } from 'react';
import type { ColorValue } from 'react-native';
import { StyleSheet } from 'react-native';

import { useStickyHeaderScrollProps } from '../../../primitiveComponents/useStickyHeaderScrollProps';
import type { ScrollComponent, SharedPredefinedProps } from '../SharedProps';

import { usePredefinedHeaderHeight } from './usePredefinedHeaderHeight';

export function usePredefinedHeader<T extends ScrollComponent>(
  props: SharedPredefinedProps
): ReturnType<typeof useStickyHeaderScrollProps<T>> & {
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
  } = useStickyHeaderScrollProps<T>({ ...props, parallaxHeight });

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
