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
import {
  getPullLimit,
  recoverPullDistance,
  resistHeaderPull,
} from '../primitiveComponents/elasticHeaderUtils';
import { useHeaderBounce } from '../primitiveComponents/useHeaderBounce';
import { useInternalStickyHeaderProps } from '../primitiveComponents/useInternalStickyHeaderProps';

type Options = Parameters<typeof useHeaderBounce>[0];
type Bounce = ReturnType<typeof useHeaderBounce>;
const initialOptions: Options = {
  enableHeaderBounce: true,
  hasRefreshControl: false,
  headerHeight: 320,
  nativeGestureSupported: true,
};
const { interpolate } = jest.requireActual<typeof Interpolation>(
  'react-native-reanimated/src/interpolation'
);

// Execute real callback bodies with current scalar dependencies. This models
// neither native recognizer arbitration nor spring frames/UI-runtime commits.
function installBounceHarness() {
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
  jest.spyOn(Reanimated, 'useAnimatedStyle').mockImplementation(((
    updater: () => Record<string, unknown>
  ) => {
    const current = React.useRef(updater);

    current.current = updater;

    return new Proxy({}, { get: (_, key) => current.current()[key as string] });
  }) as unknown as typeof Reanimated.useAnimatedStyle);
  const cancelAnimation = jest.spyOn(Reanimated, 'cancelAnimation');
  const withSpring = jest.spyOn(Reanimated, 'withSpring');

  return { ...harness, cancelAnimation, withSpring };
}

function manager() {
  return {
    handlerTag: 1,
    begin: jest.fn(),
    activate: jest.fn(),
    fail: jest.fn(),
    end: jest.fn(),
  } satisfies GestureStateManager;
}

function touch(
  y: number,
  x = 100,
  numberOfTouches = 1,
  eventType: GestureTouchEvent['eventType'] = 1
): GestureTouchEvent {
  const allTouches = Array.from({ length: numberOfTouches }, (_, id) => ({
    id,
    x,
    y,
    absoluteX: x,
    absoluteY: y,
  }));

  return {
    handlerTag: 1,
    numberOfTouches,
    state: State.BEGAN,
    eventType,
    allTouches,
    changedTouches: allTouches,
    pointerType: PointerType.TOUCH,
  };
}

function endEvent() {
  return {
    handlerTag: 1,
    numberOfPointers: 0,
    state: State.END,
    oldState: State.ACTIVE,
    pointerType: PointerType.TOUCH,
    x: 100,
    y: 400,
    absoluteX: 100,
    absoluteY: 400,
    translationX: 0,
    translationY: 0,
    velocityX: 0,
    velocityY: 0,
  };
}

function translation(style: unknown): number {
  return (style as { transform: { translateY: number }[] }).transform[0].translateY;
}

async function bounce(options: Partial<Options> = {}) {
  return renderHook((props: Options) => useHeaderBounce(props), {
    initialProps: { ...initialOptions, ...options },
  });
}

async function pull(current: Bounce, state = manager()) {
  await act(() => {
    current.pullGesture.handlers.onTouchesDown?.(touch(400), state);
    current.pullGesture.handlers.onTouchesMove?.(touch(560, 100, 1, 2), state);
  });

  return state;
}

let harness: ReturnType<typeof installBounceHarness>;

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'android');
  harness = installBounceHarness();
});
afterEach(() => {
  jest.restoreAllMocks();
});

test.each([0, 40, 280, 320, 2000])(
  'pull resistance is finite, monotonic and bounded for header height %s',
  (height) => {
    const distances = [-100, 0, 0.5, 8, 80, 800, 1e9, Infinity];
    const values = distances.map((distance) => resistHeaderPull(distance, height));
    const limit = getPullLimit(height);

    expect(Number.isFinite(limit)).toBe(true);
    expect(limit).toBeGreaterThanOrEqual(0);
    expect(limit).toBeLessThanOrEqual(96);
    expect(values[0]).toBe(0);
    expect(values[values.length - 1]).toBe(limit);
    for (let index = 0; index < values.length; index += 1) {
      expect(Number.isFinite(values[index])).toBe(true);
      expect(values[index]).toBeGreaterThanOrEqual(index ? values[index - 1] : 0);
      expect(values[index]).toBeLessThanOrEqual(limit);
    }
  }
);

test('invalid dimensions/distance cannot poison transforms and interrupted pulls recover continuously', () => {
  expect(getPullLimit(Number.NaN)).toBe(0);
  expect(resistHeaderPull(Number.NaN, 320)).toBe(0);
  expect(resistHeaderPull(80, Number.NaN)).toBe(0);
  expect(resistHeaderPull(Infinity, 320)).toBe(getPullLimit(320));
  expect(recoverPullDistance(Number.NaN, 320)).toBe(0);
  for (const distance of [0, 10, 80, 300]) {
    const displacement = resistHeaderPull(distance, 320);

    expect(recoverPullDistance(displacement, 320)).toBeCloseTo(distance);
  }

  expect(Number.isFinite(recoverPullDistance(Infinity, 320))).toBe(true);
});

test.each([0, 44])(
  'iOS accounts for native top inset %s without translating the body again',
  async (inset) => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const hook = await bounce();
    const event = scrollEvent(-44);
    const atTop = { ...event, contentInset: { ...event.contentInset, top: inset } };

    await act(() => hook.result.current.onScroll(atTop));
    expect(hook.result.current.displacement.value).toBe(0);
    await act(() => {
      hook.result.current.onBeginDrag(atTop);
      hook.result.current.onScroll({ ...atTop, contentOffset: { x: 0, y: -124 } });
    });
    expect(hook.result.current.displacement.value).toBe(80);
    expect(translation(hook.result.current.contentAnimatedStyle)).toBe(0);
    expect(harness.scrollTo).not.toHaveBeenCalled();
    await act(() => {
      hook.result.current.onScroll(atTop);
      hook.result.current.onEndDrag();
    });
    expect(hook.result.current.displacement.value).toBe(0);
  }
);

test('iOS refresh-control inset changes do not subtract native pull from the foreground', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const hook = await bounce({ hasRefreshControl: true });
  const event = scrollEvent(-140);
  const refreshingPull = { ...event, contentInset: { ...event.contentInset, top: 60 } };

  await act(() => {
    hook.result.current.onScroll(scrollEvent(0));
    hook.result.current.onScroll(refreshingPull);
  });
  expect(hook.result.current.displacement.value).toBe(140);
  expect(translation(hook.result.current.contentAnimatedStyle)).toBe(0);
});

test('nonsticky tabs receive one iOS overlay translation while the native body supplies its own pull', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const hook = await renderHook(() =>
    useInternalStickyHeaderProps({ enableHeaderBounce: true, stickyTabs: false }, true)
  );
  const layout = {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 320 } },
  } as LayoutChangeEvent;

  await act(() => hook.result.current.onHeaderLayoutInternal(layout));
  await act(() => {
    const callbacks = harness.scrollHandlers[0].current;

    callbacks.onScroll?.(scrollEvent(0));
    callbacks.onBeginDrag?.(scrollEvent(0));
    callbacks.onScroll?.(scrollEvent(-80));
  });
  expect(hook.result.current.elasticity.displacement.value).toBe(80);
  expect(translation(hook.result.current.headerAnimatedStyle)).toBe(80);
  expect(translation(hook.result.current.elasticity.contentAnimatedStyle)).toBe(0);
});

test.each([
  [44, 0],
  [0, 44],
])(
  'iOS top baseline follows inset changes from %s to %s without a pull dead zone',
  async (before, after) => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const hook = await bounce();
    const first = scrollEvent(-before);
    const next = scrollEvent(-after);
    const firstTop = { ...first, contentInset: { ...first.contentInset, top: before } };
    const nextTop = { ...next, contentInset: { ...next.contentInset, top: after } };

    await act(() => {
      hook.result.current.onScroll(firstTop);
      hook.result.current.onScroll(nextTop);
    });
    expect(hook.result.current.displacement.value).toBe(0);
    await act(() => {
      hook.result.current.onBeginDrag(nextTop);
      hook.result.current.onScroll({ ...nextTop, contentOffset: { x: 0, y: -after - 30 } });
    });
    expect(hook.result.current.displacement.value).toBe(30);
    expect(translation(hook.result.current.contentAnimatedStyle)).toBe(0);
  }
);

test('touchdown at a positive Android scroll offset cannot capture a pull', async () => {
  const hook = await bounce();
  const state = manager();

  await act(() => hook.result.current.onScroll(scrollEvent(60)));
  await pull(hook.result.current, state);
  expect(state.fail).toHaveBeenCalled();
  expect(state.activate).not.toHaveBeenCalled();
  expect(hook.result.current.displacement.value).toBe(0);
});

test.each([
  ['bounce disabled', { enableHeaderBounce: false }],
  ['native bounce disabled', { bounces: false }],
  ['scroll disabled', { scrollEnabled: false }],
  ['unsupported custom scroll host', { nativeGestureSupported: false }],
  ['no measured header', { headerHeight: 0 }],
] as const)('Android rejects %s', async (_, options) => {
  const hook = await bounce(options);
  const state = await pull(hook.result.current);

  expect(state.fail).toHaveBeenCalled();
  expect(state.activate).not.toHaveBeenCalled();
  expect(hook.result.current.displacement.value).toBe(0);
});

test.each([
  ['horizontal movement', touch(412, 180, 1, 2)],
  ['upward movement', touch(370, 100, 1, 2)],
  ['another pointer', touch(560, 100, 2, 2)],
] as const)('Android yields before ownership for %s', async (_, move) => {
  const hook = await bounce();
  const state = manager();

  await act(() => {
    hook.result.current.pullGesture.handlers.onTouchesDown?.(touch(400), state);
    hook.result.current.pullGesture.handlers.onTouchesMove?.(move, state);
  });
  expect(state.fail).toHaveBeenCalledTimes(1);
  expect(state.activate).not.toHaveBeenCalled();
  expect(hook.result.current.displacement.value).toBe(0);
});

test('owned reversal drains to zero but retains ownership until release', async () => {
  const hook = await bounce();
  const state = await pull(hook.result.current);

  expect(state.activate).toHaveBeenCalledTimes(1);
  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  expect(hook.result.current.displacement.value).toBeLessThanOrEqual(hook.result.current.limit);
  await act(() =>
    hook.result.current.pullGesture.handlers.onTouchesMove?.(touch(380, 100, 1, 2), state)
  );
  expect(hook.result.current.displacement.value).toBe(0);
  expect(state.fail).not.toHaveBeenCalled();
  expect(state.end).not.toHaveBeenCalled();
  await act(() => hook.result.current.pullGesture.handlers.onFinalize?.(endEvent(), true));
  expect(harness.withSpring).toHaveBeenCalledWith(
    0,
    expect.objectContaining({ reduceMotion: Reanimated.ReduceMotion.System })
  );
  expect(harness.scrollTo).not.toHaveBeenCalled();
});

test('elastic callbacks change geometry without fabricating native scroll callbacks or commands', async () => {
  const onScroll = jest.fn();
  const onScrollBeginDrag = jest.fn();
  const onScrollEndDrag = jest.fn();
  const hook = await renderHook(() =>
    useInternalStickyHeaderProps(
      {
        enableHeaderBounce: true,
        onScroll,
        onScrollBeginDrag,
        onScrollEndDrag,
      },
      true
    )
  );
  const layout = {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 320 } },
  } as LayoutChangeEvent;

  await act(() => hook.result.current.onHeaderLayoutInternal(layout));
  await pull(hook.result.current.elasticity);
  expect(hook.result.current.elasticity.displacement.value).toBeGreaterThan(0);
  expect(onScroll).not.toHaveBeenCalled();
  expect(onScrollBeginDrag).not.toHaveBeenCalled();
  expect(onScrollEndDrag).not.toHaveBeenCalled();
  expect(harness.scrollTo).not.toHaveBeenCalled();
  const event = scrollEvent(0);

  await act(() => {
    const callbacks = harness.scrollHandlers[0].current;

    callbacks.onScroll?.(event);
    callbacks.onBeginDrag?.(event);
    callbacks.onEndDrag?.(event);
  });
  expect(onScroll).toHaveBeenCalledWith(event);
  expect(onScrollBeginDrag).toHaveBeenCalledWith(event);
  expect(onScrollEndDrag).toHaveBeenCalledWith(event);
});

test('refresh native touch observation never activates a manual manager and stops at a positive offset', async () => {
  const hook = await bounce({ hasRefreshControl: true });
  const state = manager();

  await act(() => {
    hook.result.current.nativeGesture.handlers.onTouchesDown?.(touch(400), state);
    hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(560, 100, 1, 2), state);
  });
  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  expect(state.activate).not.toHaveBeenCalled();
  expect(state.fail).not.toHaveBeenCalled();
  await act(() => {
    hook.result.current.onScroll(scrollEvent(30));
    hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(650, 100, 1, 2), state);
  });
  expect(hook.result.current.displacement.value).toBe(0);
  expect(harness.scrollTo).not.toHaveBeenCalled();
});

test('native refresh observation follows reversal back to the origin without retaining stale stretch', async () => {
  const hook = await bounce({ hasRefreshControl: true });
  const state = manager();

  await act(() => {
    hook.result.current.nativeGesture.handlers.onTouchesDown?.(touch(400), state);
    hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(560, 100, 1, 2), state);
  });
  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  await act(() =>
    hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(400, 100, 1, 2), state)
  );
  expect(hook.result.current.displacement.value).toBe(0);
  expect(state.activate).not.toHaveBeenCalled();
  expect(state.fail).not.toHaveBeenCalled();
});

test('refreshing and disable changes clear an ongoing pull and reject stale movement', async () => {
  const hook = await bounce({ hasRefreshControl: true });
  const state = manager();

  await act(() => {
    harness.reactToSharedValues();
    hook.result.current.nativeGesture.handlers.onTouchesDown?.(touch(400), state);
    hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(560, 100, 1, 2), state);
  });
  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  await hook.rerender({ ...initialOptions, hasRefreshControl: true, refreshing: true });
  await act(() => harness.reactToSharedValues());
  expect(hook.result.current.displacement.value).toBe(0);
  await hook.rerender({ ...initialOptions, hasRefreshControl: true, refreshing: false });
  await act(() => {
    harness.reactToSharedValues();
    hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(700, 100, 1, 2), state);
  });
  expect(hook.result.current.displacement.value).toBe(0);
  await act(() => {
    hook.result.current.nativeGesture.handlers.onTouchesDown?.(touch(400), state);
    hook.result.current.nativeGesture.handlers.onTouchesMove?.(touch(560, 100, 1, 2), state);
  });
  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  await hook.rerender({ ...initialOptions, hasRefreshControl: true, enableHeaderBounce: false });
  await act(() => harness.reactToSharedValues());
  expect(hook.result.current.displacement.value).toBe(0);
});

test('shared scroll-enabled changes cancel a pull without requiring a React render', async () => {
  const scrollEnabled = { value: true };
  const hook = await bounce({ scrollEnabled });
  const state = await pull(hook.result.current);

  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  await act(() => {
    harness.reactToSharedValues();
    scrollEnabled.value = false;
    harness.reactToSharedValues();
  });
  expect(hook.result.current.displacement.value).toBe(0);
  await act(() => {
    scrollEnabled.value = true;
    harness.reactToSharedValues();
    hook.result.current.pullGesture.handlers.onTouchesMove?.(touch(700, 100, 1, 2), state);
  });
  expect(hook.result.current.displacement.value).toBe(0);
});

test('reset and unmount clear a pull and reject an outstanding touch update', async () => {
  const hook = await bounce();
  const state = await pull(hook.result.current);

  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  harness.cancelAnimation.mockClear();
  await act(() => hook.result.current.contextValue.reset());
  expect(hook.result.current.displacement.value).toBe(0);
  expect(harness.cancelAnimation).toHaveBeenCalledTimes(1);
  await pull(hook.result.current, state);
  expect(hook.result.current.displacement.value).toBeGreaterThan(0);
  const previous = hook.result.current;

  harness.cancelAnimation.mockClear();
  await hook.unmount();
  await act(() => previous.pullGesture.handlers.onTouchesMove?.(touch(700, 100, 1, 2), state));
  expect(previous.displacement.value).toBe(0);
  expect(harness.cancelAnimation).toHaveBeenCalledTimes(1);
});
