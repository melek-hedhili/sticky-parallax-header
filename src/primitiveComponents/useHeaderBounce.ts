import * as React from 'react';
import { Platform } from 'react-native';
import type { NativeScrollEvent, ViewStyle } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import type { AnimatedStyle, DerivedValue } from 'react-native-reanimated';
import {
  ReduceMotion,
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { HeaderElasticity } from './ElasticHeaderContext';
import {
  getPullLimit,
  readBooleanProp,
  readInsetTop,
  recoverPullDistance,
  resistHeaderPull,
} from './elasticHeaderUtils';

interface HeaderBounceOptions {
  bounces?: unknown;
  contentInsetTop?: unknown;
  enableHeaderBounce?: boolean;
  hasRefreshControl: boolean;
  headerHeight: number;
  nativeGestureSupported: boolean;
  refreshing?: unknown;
  scrollEnabled?: unknown;
}

/** Use peer barrels so declaration consumers never depend on private package paths. */
export interface HeaderBounceState {
  contextValue: HeaderElasticity;
  contentAnimatedStyle: AnimatedStyle<ViewStyle>;
  displacement: DerivedValue<number>;
  nativeGesture: ReturnType<typeof Gesture.Native>;
  onBeginDrag: (event: NativeScrollEvent) => void;
  onEndDrag: () => void;
  onScroll: (event: NativeScrollEvent) => void;
  pullGesture: ReturnType<typeof Gesture.Pan>;
  containerGesture: ReturnType<typeof Gesture.Pan> | ReturnType<typeof Gesture.Tap>;
  supported: boolean;
  limit: number;
}

const TOUCH_SLOP = 8;
const TOP_TOLERANCE = 1;
const RETURN_SPRING = {
  mass: 1,
  stiffness: 220,
  damping: 22,
  reduceMotion: ReduceMotion.System,
};

export function useHeaderBounce({
  bounces,
  contentInsetTop,
  enableHeaderBounce = false,
  hasRefreshControl,
  headerHeight,
  nativeGestureSupported,
  refreshing,
  scrollEnabled,
}: HeaderBounceOptions): HeaderBounceState {
  const pull = useSharedValue(0);
  const nativeOffset = useSharedValue(0);
  const nativeTop = useSharedValue(0);
  const previousInsetTop = useSharedValue(0);
  const observedOffset = useSharedValue(false);
  const dragging = useSharedValue(false);
  const suppressed = useSharedValue(false);
  const tracking = useSharedValue(false);
  const owned = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const initialDistance = useSharedValue(0);
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const canBounce = useDerivedValue(
    () =>
      enableHeaderBounce &&
      headerHeight > 0 &&
      (isIOS || (isAndroid && nativeGestureSupported)) &&
      readBooleanProp(bounces, true) &&
      readBooleanProp(scrollEnabled, true) &&
      (!isAndroid || !readBooleanProp(refreshing, false)),
    [
      bounces,
      enableHeaderBounce,
      headerHeight,
      isAndroid,
      isIOS,
      nativeGestureSupported,
      refreshing,
      scrollEnabled,
    ]
  );
  const displacement = useDerivedValue(() => {
    if (!canBounce.value || suppressed.value) {
      return 0;
    }

    return isIOS ? Math.max(0, nativeTop.value - nativeOffset.value) : Math.max(-4, pull.value);
  });

  const reset = React.useCallback(() => {
    'worklet';
    cancelAnimation(pull);
    pull.value = 0;
    tracking.value = false;
    owned.value = false;
    suppressed.value = true;
  }, [owned, pull, suppressed, tracking]);

  const finishPull = React.useCallback(() => {
    'worklet';
    tracking.value = false;
    owned.value = false;
    if (!suppressed.value && canBounce.value) {
      pull.value = withSpring(0, RETURN_SPRING);
    } else {
      cancelAnimation(pull);
      pull.value = 0;
    }
  }, [canBounce, owned, pull, suppressed, tracking]);

  useAnimatedReaction(
    () => canBounce.value,
    (enabled, previous) => {
      if (!enabled) {
        reset();
      } else if (previous === false && !dragging.value) {
        suppressed.value = false;
      }
    },
    [reset]
  );

  React.useEffect(() => {
    reset();
    observedOffset.value = false;
    suppressed.value = false;

    return reset;
  }, [hasRefreshControl, headerHeight, observedOffset, reset, suppressed]);

  const onScroll = React.useCallback(
    (event: NativeScrollEvent) => {
      'worklet';
      const offset = event.contentOffset.y;
      // UIRefreshControl temporarily adds its spinner height to the native inset.
      // That changes the body offset, not the caller's resting header position.
      const insetTop =
        isIOS && hasRefreshControl
          ? -readInsetTop(contentInsetTop)
          : -Math.max(0, event.contentInset?.top ?? 0);

      if (!observedOffset.value) {
        // The first native offset also includes automatically adjusted safe areas.
        nativeTop.value =
          isIOS && hasRefreshControl && readBooleanProp(refreshing, false)
            ? insetTop
            : Math.min(insetTop, offset);
        previousInsetTop.value = insetTop;
        observedOffset.value = true;
      } else if (insetTop !== previousInsetTop.value) {
        nativeTop.value += insetTop - previousInsetTop.value;
        previousInsetTop.value = insetTop;
      }

      nativeOffset.value = offset;
      if (offset >= nativeTop.value - TOP_TOLERANCE && !dragging.value) {
        suppressed.value = false;
      }

      if (isAndroid && offset > nativeTop.value + TOP_TOLERANCE && tracking.value) {
        finishPull();
      }
    },
    [
      dragging,
      contentInsetTop,
      finishPull,
      hasRefreshControl,
      isAndroid,
      isIOS,
      nativeOffset,
      nativeTop,
      observedOffset,
      previousInsetTop,
      refreshing,
      suppressed,
      tracking,
    ]
  );
  const onBeginDrag = React.useCallback(
    (event: NativeScrollEvent) => {
      'worklet';
      if (!observedOffset.value) {
        const insetTop =
          isIOS && hasRefreshControl
            ? -readInsetTop(contentInsetTop)
            : -Math.max(0, event.contentInset?.top ?? 0);

        nativeTop.value =
          isIOS && hasRefreshControl && readBooleanProp(refreshing, false)
            ? insetTop
            : Math.min(insetTop, event.contentOffset.y);
        nativeOffset.value = event.contentOffset.y;
        previousInsetTop.value = insetTop;
        observedOffset.value = true;
      }

      dragging.value = true;
      if (nativeOffset.value >= nativeTop.value - TOP_TOLERANCE) {
        suppressed.value = false;
      }
    },
    [
      contentInsetTop,
      dragging,
      hasRefreshControl,
      isIOS,
      nativeOffset,
      nativeTop,
      observedOffset,
      previousInsetTop,
      refreshing,
      suppressed,
    ]
  );
  const onEndDrag = React.useCallback(() => {
    'worklet';
    dragging.value = false;
  }, [dragging]);

  const nativeGesture = React.useMemo(() => {
    const native = Gesture.Native()
      .enabled(enableHeaderBounce)
      .shouldActivateOnStart(false)
      .shouldCancelWhenOutside(false)
      .disallowInterruption(hasRefreshControl);

    if (hasRefreshControl) {
      // Observe the refresh host itself. An active Pan would cancel SwipeRefreshLayout.
      native
        .onTouchesDown((event) => {
          'worklet';
          const touch = event.allTouches[0];

          tracking.value =
            !!touch &&
            event.numberOfTouches === 1 &&
            canBounce.value &&
            nativeOffset.value <= nativeTop.value + TOP_TOLERANCE;
          suppressed.value = false;
          if (touch) {
            startX.value = touch.absoluteX;
            startY.value = touch.absoluteY;
            initialDistance.value = recoverPullDistance(pull.value, headerHeight);
          }
        })
        .onTouchesMove((event) => {
          'worklet';
          const touch = event.allTouches[0];

          if (!tracking.value || !touch) {
            return;
          }

          const dx = touch.absoluteX - startX.value;
          const dy = touch.absoluteY - startY.value;

          if (
            event.numberOfTouches !== 1 ||
            !canBounce.value ||
            nativeOffset.value > nativeTop.value + TOP_TOLERANCE ||
            (Math.abs(dx) > TOUCH_SLOP && Math.abs(dx) >= Math.abs(dy))
          ) {
            finishPull();

            return;
          }

          if (dy > TOUCH_SLOP || pull.value > 0) {
            cancelAnimation(pull);
            pull.value = resistHeaderPull(initialDistance.value + dy - TOUCH_SLOP, headerHeight);
          }
        })
        .onTouchesUp(finishPull)
        .onTouchesCancelled(finishPull)
        .onFinalize(finishPull);
    }

    return native;
  }, [
    canBounce,
    enableHeaderBounce,
    finishPull,
    hasRefreshControl,
    headerHeight,
    initialDistance,
    nativeOffset,
    nativeTop,
    pull,
    startX,
    startY,
    suppressed,
    tracking,
  ]);

  const pullGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(enableHeaderBounce && !hasRefreshControl)
        .manualActivation(true)
        .shouldCancelWhenOutside(false)
        .blocksExternalGesture(nativeGesture)
        .onTouchesDown((event, manager) => {
          'worklet';
          const touch = event.allTouches[0];

          if (
            !touch ||
            event.numberOfTouches !== 1 ||
            !canBounce.value ||
            nativeOffset.value > nativeTop.value + TOP_TOLERANCE
          ) {
            manager.fail();

            return;
          }

          tracking.value = true;
          owned.value = false;
          suppressed.value = false;
          startX.value = touch.absoluteX;
          startY.value = touch.absoluteY;
          initialDistance.value = recoverPullDistance(pull.value, headerHeight);
        })
        .onTouchesMove((event, manager) => {
          'worklet';
          const touch = event.allTouches[0];

          if (!tracking.value || !touch || event.numberOfTouches !== 1 || !canBounce.value) {
            manager.fail();

            return;
          }

          const dx = touch.absoluteX - startX.value;
          const dy = touch.absoluteY - startY.value;

          if (!owned.value) {
            if (dy < -TOUCH_SLOP || (Math.abs(dx) > TOUCH_SLOP && Math.abs(dx) >= Math.abs(dy))) {
              manager.fail();

              return;
            }

            if (dy <= TOUCH_SLOP || dy <= Math.abs(dx) * 1.2) {
              return;
            }

            manager.activate();
            owned.value = true;
            cancelAnimation(pull);
          }

          pull.value = resistHeaderPull(initialDistance.value + dy - TOUCH_SLOP, headerHeight);
        })
        .onFinalize(finishPull),
    [
      canBounce,
      enableHeaderBounce,
      finishPull,
      hasRefreshControl,
      headerHeight,
      initialDistance,
      nativeGesture,
      nativeOffset,
      nativeTop,
      owned,
      pull,
      startX,
      startY,
      suppressed,
      tracking,
    ]
  );
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: isAndroid ? displacement.value : 0 }],
  }));
  const contextValue = React.useMemo<HeaderElasticity>(
    () => ({ displacement, reset }),
    [displacement, reset]
  );
  // A disabled placeholder preserves the native subtree when refresh mode changes.
  const inactiveGesture = React.useMemo(() => Gesture.Tap().enabled(false), []);

  return {
    contextValue,
    contentAnimatedStyle,
    displacement,
    nativeGesture,
    onBeginDrag,
    onEndDrag,
    onScroll,
    pullGesture,
    containerGesture: hasRefreshControl ? inactiveGesture : pullGesture,
    supported: isAndroid && nativeGestureSupported,
    limit: getPullLimit(headerHeight),
  };
}
