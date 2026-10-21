import { useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import type { StickyHeaderSharedProps } from './StickyHeaderProps';
import { useHeaderBounce } from './useHeaderBounce';

export function useInternalStickyHeaderProps(
  props: StickyHeaderSharedProps,
  nativeGestureSupported = false
) {
  const {
    contentContainerStyle,
    enableHeaderBounce = false,
    onHeaderLayout,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onTabsLayout,
    stickyTabs = true,
    style,
  } = props;

  const [headerHeight, setHeaderHeight] = useState(0);
  const [tabsHeight, setTabsHeight] = useState(0);

  const scrollValue = useSharedValue(0);
  const nativeProps = props as StickyHeaderSharedProps & {
    bounces?: unknown;
    contentInset?: { top?: unknown };
    onRefresh?: unknown;
    refreshControl?: { props?: { refreshing?: unknown } } | null;
    refreshing?: unknown;
    scrollEnabled?: unknown;
  };
  const elasticity = useHeaderBounce({
    bounces: nativeProps.bounces,
    contentInsetTop: nativeProps.contentInset?.top,
    enableHeaderBounce: props.enableHeaderBounce,
    hasRefreshControl: !!nativeProps.refreshControl || !!nativeProps.onRefresh,
    headerHeight,
    nativeGestureSupported,
    refreshing: nativeProps.refreshControl?.props?.refreshing ?? nativeProps.refreshing,
    scrollEnabled: nativeProps.scrollEnabled,
  });
  const {
    displacement,
    onBeginDrag: onElasticBeginDrag,
    onEndDrag: onElasticEndDrag,
    onScroll: onElasticScroll,
  } = elasticity;

  function onHeaderLayoutInternal(e: LayoutChangeEvent) {
    setHeaderHeight(e.nativeEvent.layout.height);
    onHeaderLayout?.(e);
  }

  function onTabsLayoutInternal(e: LayoutChangeEvent) {
    setTabsHeight(e.nativeEvent.layout.height);
    onTabsLayout?.(e);
  }

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: (e) => {
      onElasticBeginDrag(e);
      onScrollBeginDrag?.(e);
    },
    onEndDrag: (e) => {
      onElasticEndDrag();
      onScrollEndDrag?.(e);
    },
    onMomentumBegin: (e) => {
      onMomentumScrollBegin?.(e);
    },
    onMomentumEnd: (e) => {
      onMomentumScrollEnd?.(e);
    },
    onScroll: (e) => {
      onElasticScroll(e);
      scrollValue.value = e.contentOffset.y;
      onScroll?.(e);
    },
  });

  const contentContainerPaddingTop = useMemo(() => {
    const paddingTop = StyleSheet.flatten(contentContainerStyle)?.paddingTop;

    if (typeof paddingTop === 'number') {
      return paddingTop;
    }

    // We do not support string values
    return 0;
  }, [contentContainerStyle]);

  const contentContainerPaddingBottom = useMemo(() => {
    const paddingBottom = StyleSheet.flatten(contentContainerStyle)?.paddingBottom;

    if (typeof paddingBottom === 'number') {
      return paddingBottom;
    }

    // We do not support string values
    return 0;
  }, [contentContainerStyle]);

  const listPaddingTop = useMemo(() => {
    const paddingTop = StyleSheet.flatten(style)?.paddingTop;

    if (typeof paddingTop === 'number') {
      return paddingTop;
    }

    // We do not support string values
    return 0;
  }, [style]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY:
            interpolate(
              enableHeaderBounce ? Math.max(0, scrollValue.value) : scrollValue.value,
              [0, headerHeight],
              [0, -headerHeight],
              stickyTabs ? Extrapolation.CLAMP : Extrapolation.EXTEND
            ) + displacement.value,
        },
      ],
    };
  }, [scrollValue, headerHeight, stickyTabs, displacement, enableHeaderBounce]);

  return {
    contentContainerPaddingTop,
    contentContainerPaddingBottom,
    elasticity,
    headerAnimatedStyle: headerAnimatedStyle as AnimatedStyle<ViewStyle>,
    headerHeight,
    listPaddingTop,
    onHeaderLayoutInternal,
    onTabsLayoutInternal,
    scrollHandler,
    tabsHeight,
  };
}
