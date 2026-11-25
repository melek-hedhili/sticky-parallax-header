import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import * as Reanimated from 'react-native-reanimated';

import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';

function deferred() {
  let resolve!: (enabled: boolean) => void;
  const promise = new Promise<boolean>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

function preferences() {
  const motion = deferred();
  const screenReader = deferred();
  const listeners = new Map<string, (enabled: boolean) => void>();
  const removals: jest.Mock[] = [];

  jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(false);
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(motion.promise);
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockReturnValue(screenReader.promise);
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((event, listener) => {
    listeners.set(event, listener as (enabled: boolean) => void);
    const remove = jest.fn();

    removals.push(remove);

    return { remove } as ReturnType<typeof AccessibilityInfo.addEventListener>;
  });

  return { motion, screenReader, listeners, removals };
}

afterEach(() => jest.restoreAllMocks());

test('uses the synchronous reduced-motion seed before initial platform queries resolve', async () => {
  const state = preferences();

  jest.mocked(Reanimated.useReducedMotion).mockReturnValue(true);
  const hook = await renderHook(useAccessibilityPreferences);

  expect(hook.result.current).toEqual({ reduceMotion: true, screenReaderEnabled: false });
  await act(async () => {
    state.motion.resolve(false);
    state.screenReader.resolve(true);
    await Promise.all([state.motion.promise, state.screenReader.promise]);
  });
  expect(hook.result.current).toEqual({ reduceMotion: false, screenReaderEnabled: true });
});

test('live changes win over stale initial queries independently for each preference', async () => {
  const state = preferences();
  const hook = await renderHook(useAccessibilityPreferences);

  await act(() => state.listeners.get('reduceMotionChanged')?.(true));
  await act(async () => {
    state.motion.resolve(false);
    state.screenReader.resolve(true);
    await Promise.all([state.motion.promise, state.screenReader.promise]);
  });
  expect(hook.result.current).toEqual({ reduceMotion: true, screenReaderEnabled: true });
  await act(() => {
    state.listeners.get('reduceMotionChanged')?.(false);
    state.listeners.get('screenReaderChanged')?.(false);
  });
  expect(hook.result.current).toEqual({ reduceMotion: false, screenReaderEnabled: false });
});

test('screen-reader events also prevent an older initial query from overwriting them', async () => {
  const state = preferences();
  const hook = await renderHook(useAccessibilityPreferences);

  await act(() => state.listeners.get('screenReaderChanged')?.(true));
  await act(async () => {
    state.screenReader.resolve(false);
    await state.screenReader.promise;
  });
  expect(hook.result.current.screenReaderEnabled).toBe(true);
});

test('removes subscriptions and ignores late query results and callbacks after unmount', async () => {
  const state = preferences();
  let renders = 0;
  const hook = await renderHook(() => {
    renders += 1;

    return useAccessibilityPreferences();
  });
  const beforeUnmount = renders;

  await hook.unmount();
  expect(state.removals).toHaveLength(2);
  state.removals.forEach((remove) => expect(remove).toHaveBeenCalledTimes(1));
  await act(async () => {
    state.motion.resolve(true);
    state.screenReader.resolve(true);
    state.listeners.get('reduceMotionChanged')?.(true);
    state.listeners.get('screenReaderChanged')?.(true);
    await Promise.all([state.motion.promise, state.screenReader.promise]);
  });
  expect(renders).toBe(beforeUnmount);
});

test('query failures retain the seed and live listeners keep working', async () => {
  const state = preferences();

  jest.mocked(Reanimated.useReducedMotion).mockReturnValue(true);
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockImplementation(() => {
    throw new Error('Unsupported query');
  });
  jest.mocked(AccessibilityInfo.isScreenReaderEnabled).mockRejectedValue(new Error('Unavailable'));
  const hook = await renderHook(useAccessibilityPreferences);

  expect(hook.result.current).toEqual({ reduceMotion: true, screenReaderEnabled: false });
  await act(() => state.listeners.get('screenReaderChanged')?.(true));
  expect(hook.result.current.screenReaderEnabled).toBe(true);
});

test('platforms without accessibility query or subscription APIs retain the seed', async () => {
  const original = {
    addEventListener: AccessibilityInfo.addEventListener,
    isReduceMotionEnabled: AccessibilityInfo.isReduceMotionEnabled,
    isScreenReaderEnabled: AccessibilityInfo.isScreenReaderEnabled,
  };

  jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true);
  Object.assign(AccessibilityInfo, {
    addEventListener: undefined,
    isReduceMotionEnabled: undefined,
    isScreenReaderEnabled: undefined,
  });
  try {
    const hook = await renderHook(useAccessibilityPreferences);

    expect(hook.result.current).toEqual({ reduceMotion: true, screenReaderEnabled: false });
    await hook.unmount();
  } finally {
    Object.assign(AccessibilityInfo, original);
  }
});
