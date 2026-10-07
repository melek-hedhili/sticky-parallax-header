import { act, renderHook } from '@testing-library/react-native';
import * as React from 'react';
import type { ViewStyle } from 'react-native';
import { Platform } from 'react-native';
import type { DerivedValue, SharedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import type * as ActualInterpolation from 'react-native-reanimated/src/interpolation';

import { usePrimitiveHeaderTranslationCandidate } from '../__fixtures__/primitivePerformanceCandidates';

const interpolation = jest.requireActual<typeof ActualInterpolation>(
  'react-native-reanimated/src/interpolation'
);

afterEach(() => {
  jest.restoreAllMocks();
});

/** Runs the candidate's real worklet bodies, without simulating native commits or timing. */
function installCandidateHarness() {
  const producers = new Set<() => void>();
  let styleUpdater: (() => ViewStyle) | undefined;

  jest.spyOn(Reanimated, 'interpolate').mockImplementation(interpolation.interpolate);
  jest.spyOn(Reanimated, 'useDerivedValue').mockImplementation(function useDerivedValue<Value>(
    updater: () => Value
  ) {
    const producer = React.useRef(updater);
    const value = React.useRef({ value: updater() });

    producer.current = updater;
    React.useEffect(() => {
      const update = () => {
        value.current.value = producer.current();
      };

      producers.add(update);

      return () => {
        producers.delete(update);
      };
    }, []);

    return value.current as DerivedValue<Value>;
  });
  jest.spyOn(Reanimated, 'useAnimatedStyle').mockImplementation((updater) => {
    styleUpdater = updater as () => ViewStyle;

    return updater() as ReturnType<typeof Reanimated.useAnimatedStyle>;
  });

  return {
    update: () => producers.forEach((producer) => producer()),
    readStyle: () => styleUpdater?.(),
  };
}

test.each(['ios', 'android', 'web'] as const)(
  'private translation candidate preserves overscroll, collapse, and changed geometry on %s',
  async (platform) => {
    jest.replaceProperty(Platform, 'OS', platform);
    const harness = installCandidateHarness();
    const scrollValue = { value: 0 } as SharedValue<number>;
    const hook = await renderHook(
      ({ height, stickyTabs }: { height: number; stickyTabs: boolean }) =>
        usePrimitiveHeaderTranslationCandidate(scrollValue, height, stickyTabs),
      { initialProps: { height: 180, stickyTabs: true } }
    );

    for (const [offset, expected] of [
      [-50, 0],
      [0, 0],
      [45, -45],
      [180, -180],
      [500, -180],
    ]) {
      await act(() => {
        scrollValue.value = offset;
        harness.update();
      });
      expect(harness.readStyle()).toEqual({ transform: [{ translateY: expected }] });
    }

    await hook.rerender({ height: 300, stickyTabs: true });
    harness.update();
    expect(harness.readStyle()).toEqual({ transform: [{ translateY: -300 }] });
    await hook.rerender({ height: 180, stickyTabs: false });
    harness.update();
    expect(harness.readStyle()).toEqual({ transform: [{ translateY: -500 }] });
    scrollValue.value = -50;
    harness.update();
    expect(harness.readStyle()).toEqual({ transform: [{ translateY: 50 }] });
    await hook.rerender({ height: 0, stickyTabs: false });
    harness.update();
    expect(harness.readStyle()).toEqual({ transform: [{ translateY: 0 }] });
  }
);
