import type { FlashListRef } from '@shopify/flash-list';
import { act, renderHook } from '@testing-library/react-native';
import * as React from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Platform } from 'react-native';
import type { GestureStateManager, GestureTouchEvent } from 'react-native-gesture-handler';
import { PointerType, State } from 'react-native-gesture-handler';
import type { DerivedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import type * as Interpolation from 'react-native-reanimated/src/interpolation';

import { installAnimationHarness, scrollEvent } from '../__fixtures__/animationHarness';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';
import type { ScrollViewRef } from '../primitiveComponents/ScrollComponent';
import { useHeaderBounce } from '../primitiveComponents/useHeaderBounce';
import { useInternalStickyHeaderProps } from '../primitiveComponents/useInternalStickyHeaderProps';
import { useStickyHeaderFlashListScrollProps } from '../primitiveComponents/useStickyHeaderFlashListScrollProps';
import { useStickyHeaderScrollProps } from '../primitiveComponents/useStickyHeaderScrollProps';

jest.mock('../hooks/useAccessibilityPreferences');

const { interpolate } = jest.requireActual<typeof Interpolation>(
  'react-native-reanimated/src/interpolation'
);

function installMotionHarness() {
  const harness = installAnimationHarness();

  jest.spyOn(Reanimated, 'interpolate').mockImplementation(interpolate);
  jest.spyOn(Reanimated, 'useDerivedValue').mockImplementation(function useDerivedValue<Value>(
    updater: () => Value
  ) {
    const current = React.useRef(updater);
    const derived = React.useRef({
      get value() {
        return current.current();
      },
    });

    current.current = updater;

    return derived.current as DerivedValue<Value>;
  });
  jest
    .spyOn(Reanimated, 'useAnimatedStyle')
    .mockImplementation(((updater: () => Record<string, unknown>) =>
      updater()) as unknown as typeof Reanimated.useAnimatedStyle);

  return { ...harness, withSpring: jest.spyOn(Reanimated, 'withSpring') };
}

function touch(y: number): GestureTouchEvent {
  const point = { id: 1, x: 100, y, absoluteX: 100, absoluteY: y };

  return {
    handlerTag: 1,
    numberOfTouches: 1,
    state: State.BEGAN,
    eventType: 1,
    allTouches: [point],
    changedTouches: [point],
    pointerType: PointerType.TOUCH,
  };
}

function manager(): GestureStateManager {
  return { handlerTag: 1, begin: jest.fn(), activate: jest.fn(), fail: jest.fn(), end: jest.fn() };
}

function translation(style: unknown): number {
  return (style as { transform: { translateY: number }[] }).transform[0].translateY;
}

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.mocked(useAccessibilityPreferences).mockReturnValue({
    reduceMotion: false,
    screenReaderEnabled: false,
  });
});
afterEach(() => jest.restoreAllMocks());

describe.each([
  ['native', () => useStickyHeaderScrollProps<ScrollViewRef>],
  ['FlashList', () => useStickyHeaderFlashListScrollProps<FlashListRef<string>>],
] as const)('%s reduced-motion scrolling', (kind, getHook) => {
  test('suppresses automatic snaps live while preserving callbacks, offsets, refs and normal snaps', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const onScroll = jest.fn();
    const onScrollEndDrag = jest.fn();
    const onMomentumScrollEnd = jest.fn();
    const hook = await renderHook(() =>
      getHook()({ parallaxHeight: 400, onScroll, onScrollEndDrag, onMomentumScrollEnd })
    );
    const scrollToOffset = jest.fn();
    const ref = hook.result.current.scrollViewRef;

    if (kind === 'FlashList') {
      ref.current = { scrollToOffset } as unknown as FlashListRef<string> & ScrollViewRef;
    }

    const event = scrollEvent(100);

    await act(() => {
      hook.result.current.onScroll(event);
      hook.result.current.onMomentumScrollEnd(event);
    });
    if (kind === 'FlashList') {
      expect(scrollToOffset).not.toHaveBeenCalled();
      expect(harness.pendingRNJobs()).toBe(1);
      await act(() => harness.flushRNQueue());
      expect(scrollToOffset).toHaveBeenLastCalledWith({ offset: 0, animated: true });
    } else {
      expect(harness.scrollTo).toHaveBeenLastCalledWith(ref, 0, 0, true);
      expect(harness.pendingRNJobs()).toBe(0);
    }

    harness.scrollTo.mockClear();
    scrollToOffset.mockClear();
    jest.mocked(useAccessibilityPreferences).mockReturnValue({
      reduceMotion: true,
      screenReaderEnabled: false,
    });
    await hook.rerender(undefined);
    await act(() => {
      hook.result.current.onScroll(event);
      hook.result.current.onScrollEndDrag(event);
      hook.result.current.onMomentumScrollEnd(event);
    });
    expect(hook.result.current.scrollValue.value).toBe(100);
    expect(hook.result.current.scrollViewRef).toBe(ref);
    expect(onScroll).toHaveBeenLastCalledWith(event);
    expect(onScrollEndDrag).toHaveBeenLastCalledWith(event);
    expect(onMomentumScrollEnd).toHaveBeenLastCalledWith(event);
    expect(harness.scrollTo).not.toHaveBeenCalled();
    expect(scrollToOffset).not.toHaveBeenCalled();
    expect(harness.pendingRNJobs()).toBe(0);

    await act(() => hook.result.current.onScroll(scrollEvent(-40)));
    expect(hook.result.current.scrollValue.value).toBe(-40);
    expect(onScroll).toHaveBeenLastCalledWith(scrollEvent(-40));
  });
});

test.each([false, true])(
  'reduced motion stops Android pull/rebound without changing the refresh %s gesture hierarchy',
  async (hasRefreshControl) => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const harness = installMotionHarness();
    const hook = await renderHook(
      (reduceMotion: boolean) =>
        useHeaderBounce({
          enableHeaderBounce: true,
          hasRefreshControl,
          headerHeight: 320,
          nativeGestureSupported: true,
          reduceMotion,
        }),
      { initialProps: false }
    );
    const state = manager();
    const pull = () => {
      if (hasRefreshControl) {
        hook.result.current.nativeGesture.handlers.onTouchesDown?.(touch(400), state);
        hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(560), state);
      } else {
        hook.result.current.pullGesture.handlers.onTouchesDown?.(touch(400), state);
        hook.result.current.pullGesture.handlers.onTouchesMove?.(touch(560), state);
      }
    };
    const containerType = hook.result.current.containerGesture.constructor;
    const enabled = hook.result.current.pullGesture.config.enabled;

    await act(pull);
    expect(hook.result.current.displacement.value).toBeGreaterThan(0);
    await hook.rerender(true);
    await act(() => harness.reactToSharedValues());
    expect(hook.result.current.displacement.value).toBe(0);
    expect(hook.result.current.supported).toBe(true);
    expect(hook.result.current.containerGesture.constructor).toBe(containerType);
    expect(hook.result.current.pullGesture.config.enabled).toBe(enabled);
    await act(() => {
      pull();
      hook.result.current.nativeGesture.handlers.onTouchesUp?.(touch(560), state);
      hook.result.current.onEndDrag();
    });
    expect(hook.result.current.displacement.value).toBe(0);
    expect(harness.withSpring).not.toHaveBeenCalled();
    if (!hasRefreshControl) {
      expect(state.fail).toHaveBeenCalled();
    }
  }
);

test.each([false, true])(
  'reduced motion clamps nonsticky negative header input with custom bounce %s and retains collapse',
  async (enableHeaderBounce) => {
    const harness = installMotionHarness();
    const onScroll = jest.fn();

    jest.mocked(useAccessibilityPreferences).mockReturnValue({
      reduceMotion: true,
      screenReaderEnabled: false,
    });
    const hook = await renderHook(() =>
      useInternalStickyHeaderProps({ enableHeaderBounce, stickyTabs: false, onScroll }, true)
    );

    await act(() =>
      hook.result.current.onHeaderLayoutInternal({
        nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 320 } },
      } as LayoutChangeEvent)
    );
    await act(() => {
      const callbacks = harness.scrollHandlers[0].current;

      callbacks.onScroll?.(scrollEvent(0));
      callbacks.onBeginDrag?.(scrollEvent(0));
      callbacks.onScroll?.(scrollEvent(-80));
    });
    await hook.rerender(undefined);
    expect(hook.result.current.elasticity.displacement.value).toBe(0);
    expect(translation(hook.result.current.headerAnimatedStyle)).toBe(0);
    expect(onScroll).toHaveBeenLastCalledWith(scrollEvent(-80));
    await act(() => harness.scrollHandlers[0].current.onScroll?.(scrollEvent(80)));
    await hook.rerender(undefined);
    expect(translation(hook.result.current.headerAnimatedStyle)).toBe(-80);
  }
);
