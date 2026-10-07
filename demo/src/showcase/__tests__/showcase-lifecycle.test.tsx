import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { act, render, renderHook, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { StatusBar } from 'react-native';

import { ShowcaseStatusBar } from '@/showcase/components/showcase-status-bar';
import { useShowcaseRefresh } from '@/showcase/hooks/use-showcase-refresh';

let mockFocused = true;

jest.mock(
  'expo-router',
  () => ({
    useFocusEffect(effect: () => void | (() => void)) {
      const { useEffect } = require('react');
      const focused = mockFocused;

      useEffect(() => (focused ? effect() : undefined), [effect, focused]);
    },
  }),
  { virtual: true }
);

jest.mock('expo-router/react-navigation', () => ({ useIsFocused: () => mockFocused }), {
  virtual: true,
});

beforeEach(() => {
  mockFocused = true;
  jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('refresh stays active for two seconds and then completes', async () => {
  const hook = await renderHook(useShowcaseRefresh);

  await act(() => hook.result.current.onRefresh());
  expect(hook.result.current.refreshing).toBe(true);
  await act(() => jest.advanceTimersByTime(1999));
  expect(hook.result.current.refreshing).toBe(true);
  await act(() => jest.advanceTimersByTime(1));
  expect(hook.result.current.refreshing).toBe(false);
});

test('a new refresh cannot be completed by an older pending refresh', async () => {
  const hook = await renderHook(useShowcaseRefresh);

  await act(() => hook.result.current.onRefresh());
  await act(() => jest.advanceTimersByTime(1000));
  await act(() => hook.result.current.onRefresh());
  await act(() => jest.advanceTimersByTime(1000));
  expect(hook.result.current.refreshing).toBe(true);
  await act(() => jest.advanceTimersByTime(1000));
  expect(hook.result.current.refreshing).toBe(false);
});

test('leaving a route cancels refresh while preserving its mounted page state', async () => {
  const hook = await renderHook(() => {
    const [answer, setAnswer] = useState<string | null>(null);

    return { ...useShowcaseRefresh(), answer, setAnswer };
  });

  await act(() => {
    hook.result.current.setAnswer('A');
    hook.result.current.onRefresh();
  });
  mockFocused = false;
  await hook.rerender(undefined);
  expect(hook.result.current.refreshing).toBe(false);
  expect(jest.getTimerCount()).toBe(0);
  mockFocused = true;
  await hook.rerender(undefined);
  expect(hook.result.current.answer).toBe('A');
  expect(hook.result.current.refreshing).toBe(false);
});

test('unmounting a route releases its refresh timer', async () => {
  const hook = await renderHook(useShowcaseRefresh);

  await act(() => hook.result.current.onRefresh());
  await hook.unmount();
  expect(jest.getTimerCount()).toBe(0);
});

test('inactive routes release their status bar override and restore it on focus', async () => {
  const push = jest.spyOn(StatusBar, 'pushStackEntry');
  const pop = jest.spyOn(StatusBar, 'popStackEntry');

  await render(<ShowcaseStatusBar barStyle="light-content" />);
  expect(push).toHaveBeenCalledWith({ barStyle: 'light-content' });
  mockFocused = false;
  await screen.rerender(<ShowcaseStatusBar barStyle="light-content" />);
  const entry = push.mock.results[0].value as ReturnType<typeof StatusBar.pushStackEntry>;

  expect(pop).toHaveBeenCalledWith(entry);
  mockFocused = true;
  await screen.rerender(<ShowcaseStatusBar barStyle="light-content" />);
  expect(push).toHaveBeenCalledTimes(2);
});
