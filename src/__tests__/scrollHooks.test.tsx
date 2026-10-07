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

  test.each([true, false])(
    'schedules only one reset during a positive scroll run (callback present: %s)',
    async (hasCallback) => {
      const harness = installAnimationHarness({ deferRNScheduling: true });
      const onTopReached = jest.fn();
      const hook = await renderHook(() =>
        useScroll({ onTopReached: hasCallback ? onTopReached : undefined, snapToEdge: false })
      );

      await act(() => harness.reactToSharedValues());
      expect(harness.pendingRNJobs()).toBe(1);
      await act(() => harness.flushRNQueue());
      harness.rnScheduler.mockClear();
      await act(() => {
        for (let y = 1; y <= 1000; y += 1) {
          hook.result.current.onScroll(scrollEvent(y));
          harness.reactToSharedValues();
        }
      });
      expect(harness.rnScheduler).toHaveBeenCalledTimes(1);
      expect(harness.pendingRNJobs()).toBe(1);
      await act(() => harness.flushRNQueue());
      expect(onTopReached).toHaveBeenCalledTimes(hasCallback ? 1 : 0);
    }
  );

  test('retains ordered top returns while RN delivery is delayed', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const onTopReached = jest.fn();
    const hook = await renderHook(() => useScroll({ onTopReached }));

    await act(() => {
      harness.reactToSharedValues();
      for (const y of [1, 2, 0, -1, 3, 4, -2]) {
        hook.result.current.onScroll(scrollEvent(y));
        harness.reactToSharedValues();
      }
    });
    expect(onTopReached).not.toHaveBeenCalled();
    expect(harness.rnScheduler.mock.calls.map(([, value]) => value)).toEqual([0, 1, 0, -1, 3, -2]);
    await act(() => harness.flushRNQueue(1));
    expect(onTopReached).toHaveBeenCalledTimes(1);
    await act(() => harness.flushRNQueue(1));
    expect(onTopReached).toHaveBeenCalledTimes(1);
    await act(() => harness.flushRNQueue(2));
    expect(onTopReached).toHaveBeenCalledTimes(2);
    await act(() => harness.flushRNQueue());
    expect(onTopReached).toHaveBeenCalledTimes(3);
    expect(harness.pendingRNJobs()).toBe(0);
  });

  test('queued top checks read callback replacement and removal at delivery', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const first = jest.fn();
    const next = jest.fn();
    const hook = await renderHook((props: Props) => useScroll(props), {
      initialProps: { onTopReached: first },
    });

    await act(() => harness.reactToSharedValues());
    await hook.rerender({ onTopReached: next });
    await act(() => harness.flushRNQueue());
    expect(first).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    await act(() => {
      hook.result.current.onScroll(scrollEvent(10));
      harness.reactToSharedValues();
      hook.result.current.onScroll(scrollEvent(-1));
      harness.reactToSharedValues();
    });
    await hook.rerender({});
    await act(() => harness.flushRNQueue());
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('a pending initial check can notify a callback added before delivery', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const added = jest.fn();
    const hook = await renderHook((props: Props) => useScroll(props), { initialProps: {} });

    await act(() => harness.reactToSharedValues());
    await hook.rerender({ onTopReached: added });
    expect(added).not.toHaveBeenCalled();
    await act(() => harness.flushRNQueue());
    expect(added).toHaveBeenCalledTimes(1);
  });

  test('adding a callback while already top waits for a distinct top-side offset', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const added = jest.fn();
    const replacement = jest.fn();
    const hook = await renderHook((props: Props) => useScroll(props), { initialProps: {} });

    await act(() => {
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    await hook.rerender({ onTopReached: added });
    await act(() => harness.reactToSharedValues());
    expect(harness.pendingRNJobs()).toBe(0);
    expect(added).not.toHaveBeenCalled();
    await act(() => {
      hook.result.current.onScroll(scrollEvent(-1));
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    expect(added).toHaveBeenCalledTimes(1);
    await hook.rerender({});
    await act(() => {
      hook.result.current.onScroll(scrollEvent(-2));
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    await hook.rerender({ onTopReached: replacement });
    await act(() => {
      hook.result.current.onScroll(scrollEvent(-3));
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    expect(replacement).not.toHaveBeenCalled();
    await act(() => {
      hook.result.current.onScroll(scrollEvent(1));
      harness.reactToSharedValues();
      hook.result.current.onScroll(scrollEvent(0));
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    expect(replacement).toHaveBeenCalledTimes(1);
  });

  test('a queued top-side offset can notify a callback added after the offset', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const added = jest.fn();
    const hook = await renderHook((props: Props) => useScroll(props), { initialProps: {} });

    await act(() => {
      harness.reactToSharedValues();
      harness.flushRNQueue();
      hook.result.current.onScroll(scrollEvent(-1));
      harness.reactToSharedValues();
    });
    await hook.rerender({ onTopReached: added });
    await act(() => harness.flushRNQueue());
    expect(added).toHaveBeenCalledTimes(1);
  });

  test('a throwing top callback retries on the next observed top-side offset', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const failure = new Error('Callback failed');
    const onTopReached = jest
      .fn()
      .mockImplementationOnce(() => {
        throw failure;
      })
      .mockImplementation(() => undefined);
    const hook = await renderHook(() => useScroll({ onTopReached }));

    await act(() => harness.reactToSharedValues());
    expect(() => harness.flushRNQueue()).toThrow(failure);
    await act(() => {
      hook.result.current.onScroll(scrollEvent(-1));
      harness.reactToSharedValues();
      harness.flushRNQueue();
      hook.result.current.onScroll(scrollEvent(-2));
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    expect(onTopReached).toHaveBeenCalledTimes(2);
  });

  test('raw scalar delivery suppresses signed-zero changes in both directions', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const onTopReached = jest.fn();
    const hook = await renderHook(() => useScroll({ onTopReached }));

    await act(() => {
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    harness.rnScheduler.mockClear();
    await act(() => {
      hook.result.current.onScroll(scrollEvent(-0));
      harness.reactToSharedValues();
    });
    expect(harness.pendingRNJobs()).toBe(0);
    await act(() => {
      hook.result.current.onScroll(scrollEvent(-1));
      harness.reactToSharedValues();
      hook.result.current.onScroll(scrollEvent(-0));
      harness.reactToSharedValues();
    });
    expect(harness.pendingRNJobs()).toBe(2);
    await act(() => {
      hook.result.current.onScroll(scrollEvent(0));
      harness.reactToSharedValues();
    });
    expect(harness.pendingRNJobs()).toBe(2);
    await act(() => harness.flushRNQueue());
    expect(onTopReached).toHaveBeenCalledTimes(1);
  });

  test('repeated NaN observations retain queued resets and the next top notification', async () => {
    const harness = installAnimationHarness({ deferRNScheduling: true });
    const onTopReached = jest.fn();
    const hook = await renderHook(() => useScroll({ onTopReached }));

    await act(() => {
      harness.reactToSharedValues();
      harness.flushRNQueue();
    });
    harness.rnScheduler.mockClear();
    await act(() => {
      hook.result.current.onScroll(scrollEvent(Number.NaN));
      harness.reactToSharedValues();
      hook.result.current.onScroll(scrollEvent(Number.NaN));
      harness.reactToSharedValues();
      hook.result.current.onScroll(scrollEvent(0));
      harness.reactToSharedValues();
    });
    expect(harness.pendingRNJobs()).toBe(3);
    expect(harness.rnScheduler.mock.calls.map(([, value]) => value)).toEqual([
      Number.NaN,
      Number.NaN,
      0,
    ]);
    await act(() => harness.flushRNQueue(2));
    expect(onTopReached).toHaveBeenCalledTimes(1);
    await act(() => harness.flushRNQueue());
    expect(onTopReached).toHaveBeenCalledTimes(2);
  });
});
