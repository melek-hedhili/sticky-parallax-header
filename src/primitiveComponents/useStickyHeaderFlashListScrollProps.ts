import type { FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useRef } from 'react';
import type { NativeScrollEvent } from 'react-native';
import { Platform } from 'react-native';
import { useAnimatedReaction, useAnimatedRef, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useResponsiveSize } from '../hooks/useResponsiveSize';

import type { StickyHeaderSharedProps, StickyHeaderSnapProps } from './StickyHeaderProps';

const VELOCITY_THRESHOLD = 7;

// FIXME: unknown does not work here :/

export function useStickyHeaderFlashListScrollProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends FlashListRef<any> = FlashListRef<any>,
>(props: StickyHeaderSharedProps & StickyHeaderSnapProps) {
  const { responsiveHeight } = useResponsiveSize();

  const {
    headerHeight = 100,
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    onTopReached,
    parallaxHeight = responsiveHeight(53),
    snapStartThreshold,
    snapStopThreshold,
    snapToEdge = true,
  } = props;

  const scrollValue = useSharedValue(0);

  const scrollViewRef = useAnimatedRef<T>();

  const onTopReachedRef = useRef(onTopReached);
  const onTopReachedWasCalled = useRef(false);

  useEffect(() => {
    onTopReachedRef.current = onTopReached;
  }, [onTopReached]);

  const maybeTopReached = useCallback((value: number) => {
    if (value <= 0) {
      if (!onTopReachedWasCalled.current && onTopReachedRef.current) {
        onTopReachedRef.current();
        onTopReachedWasCalled.current = true;
      }
    } else {
      onTopReachedWasCalled.current = false;
    }
  }, []);

  useAnimatedReaction(
    () => scrollValue.value,
    (value, previous) => {
      // Positive offsets only reset the RN latch. Keep every top-side check so
      // callbacks added while already at the top still run on the next offset.
      if (value > 0 && previous !== null && previous > 0) {
        return;
      }

      scheduleOnRN(maybeTopReached, value);
    },
    [maybeTopReached, scrollValue]
  );

  const scrollHeight = Math.max(parallaxHeight, headerHeight * 2);

  const snapToTop = useCallback(() => {
    scrollViewRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [scrollViewRef]);

  const snapToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToOffset({ animated: true, offset: scrollHeight });
  }, [scrollHeight, scrollViewRef]);

  const onSnapToEdge = useCallback(
    (e: NativeScrollEvent) => {
      'worklet';
      const scrollToHeight = snapStopThreshold ?? scrollHeight;
      const snapToEdgeThreshold = snapStartThreshold ?? scrollHeight / 2;

      const currentVal = scrollValue.value;
      const velocity = e.velocity?.y ?? 0;

      const dragsToTop = velocity >= 0;
      const dragsToBottom = !dragsToTop;
      const dragsQuickToBottom = dragsToBottom && velocity <= -VELOCITY_THRESHOLD;
      const dragsQuickToTop = dragsToTop && velocity >= VELOCITY_THRESHOLD;

      const isUnderSnapToEdgeThresholdAndDragIsSlow =
        currentVal > 0 && currentVal < snapToEdgeThreshold && !dragsQuickToBottom;
      const isUnderSnapToEdgeThresholdAndDragIsQuick =
        currentVal >= snapToEdgeThreshold / 2 &&
        currentVal < snapToEdgeThreshold &&
        dragsQuickToBottom;
      const isOverSnapToEdgeThresholdAndDragIsSlow =
        currentVal >= snapToEdgeThreshold && currentVal < scrollToHeight && !dragsQuickToTop;
      const isOverSnapToEdgeThresholdAndDragIsQuick =
        currentVal >= snapToEdgeThreshold && currentVal < scrollToHeight / 2 && dragsQuickToTop;

      if (snapToEdge) {
        // TODO: when react-native-web will support onMomentumScrollEnd & onScrollEndDrag events
        // handle web snap scroll
        if (isUnderSnapToEdgeThresholdAndDragIsSlow || isOverSnapToEdgeThresholdAndDragIsQuick) {
          scheduleOnRN(snapToTop);
        } else if (
          isOverSnapToEdgeThresholdAndDragIsSlow ||
          isUnderSnapToEdgeThresholdAndDragIsQuick
        ) {
          scheduleOnRN(snapToBottom);
        }
      }
    },
    [
      snapStartThreshold,
      snapStopThreshold,
      snapToBottom,
      snapToTop,
      snapToEdge,
      scrollHeight,
      scrollValue,
    ]
  );

  const onMomentumScrollEndInternal = useCallback(
    (e: NativeScrollEvent) => {
      'worklet';
      onMomentumScrollEnd?.(e);
      onSnapToEdge(e);
    },
    [onMomentumScrollEnd, onSnapToEdge]
  );

  const onScrollEndDragInternal = useCallback(
    (e: NativeScrollEvent) => {
      'worklet';
      onScrollEndDrag?.(e);
      if (Platform.OS === 'android' || Math.abs(e.velocity?.y ?? 0) > 0) {
        return;
      }

      onSnapToEdge(e);
    },
    [onScrollEndDrag, onSnapToEdge]
  );

  const onScrollInternal = useCallback(
    (e: NativeScrollEvent) => {
      'worklet';
      scrollValue.value = e.contentOffset.y;
      onScroll?.(e);
    },
    [onScroll, scrollValue]
  );

  return {
    onMomentumScrollEnd: onMomentumScrollEndInternal,
    onScroll: onScrollInternal,
    onScrollEndDrag: onScrollEndDragInternal,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  };
}
