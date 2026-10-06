import type { FlashListRef } from '@shopify/flash-list';
import { act, renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { installAnimationHarness, scrollEvent } from '../__fixtures__/animationHarness';
import type { ScrollViewRef } from '../primitiveComponents/ScrollComponent';
import type {
  StickyHeaderSharedProps,
  StickyHeaderSnapProps,
} from '../primitiveComponents/StickyHeaderProps';
import { useStickyHeaderFlashListScrollProps } from '../primitiveComponents/useStickyHeaderFlashListScrollProps';
import { useStickyHeaderScrollProps } from '../primitiveComponents/useStickyHeaderScrollProps';

type Props = StickyHeaderSharedProps & StickyHeaderSnapProps;
const useNative = (props: Props) => useStickyHeaderScrollProps<ScrollViewRef>(props);
const useFlash = (props: Props) => useStickyHeaderFlashListScrollProps<FlashListRef<string>>(props);

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe.each([
  ['native', useNative],
  ['FlashList', useFlash],
] as const)('%s snapping', (kind, useScroll) => {
  test('keeps snap boundaries, fast gestures, and custom thresholds', async () => {
    const harness = installAnimationHarness();
    const hook = await renderHook(() => useScroll({ parallaxHeight: 400, headerHeight: 100 }));
    const scrollToOffset = jest.fn();

    if (kind === 'FlashList') {
      hook.result.current.scrollViewRef.current = {
        scrollToOffset,
      } as unknown as FlashListRef<string> & ScrollViewRef;
    }

    async function snap(y: number, velocity = 0) {
      harness.scrollTo.mockClear();
      scrollToOffset.mockClear();
      await act(() => {
        hook.result.current.onScroll(scrollEvent(y));
        hook.result.current.onMomentumScrollEnd(scrollEvent(y, velocity));
      });

      return kind === 'FlashList'
        ? scrollToOffset.mock.calls.map(([options]) => options.offset)
        : harness.scrollTo.mock.calls.map((call) => call[2]);
    }

    expect(await snap(0)).toEqual([]);
    expect(await snap(99)).toEqual([0]);
    expect(await snap(100, -7)).toEqual([400]);
    expect(await snap(199)).toEqual([0]);
    expect(await snap(200)).toEqual([400]);
    expect(await snap(400)).toEqual([]);
    expect(await snap(300, 7)).toEqual([]);
  });

  test('uses changed props and keeps platform end-drag rules', async () => {
    const harness = installAnimationHarness();
    const firstCallback = jest.fn();
    const nextCallback = jest.fn();
    const hook = await renderHook((props: Props) => useScroll(props), {
      initialProps: { parallaxHeight: 400, snapToEdge: true, onScroll: firstCallback },
    });
    const scrollToOffset = jest.fn();

    if (kind === 'FlashList') {
      hook.result.current.scrollViewRef.current = {
        scrollToOffset,
      } as unknown as FlashListRef<string> & ScrollViewRef;
    }

    await hook.rerender({ parallaxHeight: 400, snapToEdge: false, onScroll: nextCallback });
    await act(() => {
      hook.result.current.onScroll(scrollEvent(100));
      hook.result.current.onMomentumScrollEnd(scrollEvent(100));
    });
    expect(firstCallback).not.toHaveBeenCalled();
    expect(nextCallback).toHaveBeenCalledTimes(1);
    expect(harness.scrollTo).not.toHaveBeenCalled();
    expect(scrollToOffset).not.toHaveBeenCalled();
    await hook.rerender({ parallaxHeight: 600, snapStartThreshold: 50, snapStopThreshold: 250 });
    await act(() => hook.result.current.onScrollEndDrag(scrollEvent(100, 1)));
    expect(harness.scrollTo).not.toHaveBeenCalled();
    expect(scrollToOffset).not.toHaveBeenCalled();
    await act(() => hook.result.current.onScrollEndDrag(scrollEvent(100)));
    if (kind === 'FlashList') {
      expect(scrollToOffset).toHaveBeenLastCalledWith({ offset: 600, animated: true });
    } else {
      expect(harness.scrollTo).toHaveBeenLastCalledWith(
        hook.result.current.scrollViewRef,
        0,
        600,
        true
      );
    }

    harness.scrollTo.mockClear();
    scrollToOffset.mockClear();
    jest.replaceProperty(Platform, 'OS', 'android');
    await act(() => hook.result.current.onScrollEndDrag(scrollEvent(100)));
    expect(harness.scrollTo).not.toHaveBeenCalled();
    expect(scrollToOffset).not.toHaveBeenCalled();
  });

  test('reports top once per return and uses the latest callback', async () => {
    const harness = installAnimationHarness();
    const first = jest.fn();
    const next = jest.fn();
    const hook = await renderHook((props: Props) => useScroll(props), {
      initialProps: { onTopReached: first },
    });

    await act(() => {
      harness.reactToSharedValues();
      harness.reactToSharedValues();
    });
    expect(first).toHaveBeenCalledTimes(1);
    await hook.rerender({ onTopReached: next });
    await act(() => {
      hook.result.current.onScroll(scrollEvent(10));
      harness.reactToSharedValues();
      hook.result.current.onScroll(scrollEvent(-1));
      harness.reactToSharedValues();
      harness.reactToSharedValues();
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
