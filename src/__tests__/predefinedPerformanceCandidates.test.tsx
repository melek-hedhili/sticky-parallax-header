import { render, renderHook } from '@testing-library/react-native';
import * as React from 'react';
import type { PlatformOSType } from 'react-native';
import * as ReactNative from 'react-native';
import { Platform } from 'react-native';
import type { DerivedValue, SharedValue } from 'react-native-reanimated';
import * as Reanimated from 'react-native-reanimated';
import type * as Interpolation from 'react-native-reanimated/src/interpolation';

import { installAnimationHarness } from '../__fixtures__/animationHarness';
import {
  getBackgroundRadiusCandidate,
  getBackgroundStyleCandidate,
  getBoundedVisualScrollCandidate,
  useBoundedVisualScrollCandidate,
} from '../__fixtures__/predefinedPerformanceCandidates';
import { HeaderBar as AvatarBar } from '../predefinedComponents/AvatarHeader/components/HeaderBar';
import { Foreground as AvatarForeground } from '../predefinedComponents/AvatarHeader/components/HeaderForeground';
import { Foreground as DetailsForeground } from '../predefinedComponents/DetailsHeader/components/HeaderForeground';
import { useDetailsHeader } from '../predefinedComponents/DetailsHeader/hooks/useDetailsHeader';
import type { AnimatedColorProp } from '../predefinedComponents/common/SharedProps';
import { HeaderBackground } from '../predefinedComponents/common/components/HeaderBackground';
import type { ScrollViewRef } from '../primitiveComponents/ScrollComponent';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// The official animation mock makes interpolate a NOOP. Use the real pure
// interpolation implementation so an equality test cannot pass on undefined.
const { interpolate: realInterpolate } = jest.requireActual<typeof Interpolation>(
  'react-native-reanimated/src/interpolation'
);

type StyleEvaluator = () => Record<string, unknown>;
const dimensions = { width: 390, height: 844, scale: 1, fontScale: 1 };

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.mocked(ReactNative.useWindowDimensions).mockReturnValue(dimensions);
  jest.spyOn(Reanimated, 'interpolate').mockImplementation(realInterpolate);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function captureStyleEvaluators() {
  const evaluators: StyleEvaluator[] = [];

  jest.spyOn(Reanimated, 'useAnimatedStyle').mockImplementation(((updater: StyleEvaluator) => {
    evaluators.push(updater);

    return updater();
  }) as unknown as typeof Reanimated.useAnimatedStyle);

  return evaluators;
}

function scrollValue(value = 0) {
  return { value } as SharedValue<number>;
}

function offsets(parallaxHeight: number, scrollHeight: number) {
  const breakpoints = [
    ...[19, 25, 27, 31, 40, 45, 50, 55, 60, 70, 75, 100].map(
      (percent) => parallaxHeight * 0.01 * percent
    ),
    scrollHeight * 0.6,
    scrollHeight * 0.9,
    scrollHeight,
  ].filter(Number.isFinite);

  return [
    -10000,
    -20,
    -0,
    0,
    ...breakpoints.flatMap((value) => [value - 0.000001, value, value + 0.000001]),
    10000,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NaN,
  ];
}

describe('private bounded visual-scroll candidate', () => {
  test.each([
    [200, 100],
    [280, 100],
    [320, 100],
    [440, 100],
    [100, 200],
    [280, 0],
    [0, 100],
    [-100, 100],
    [Number.NaN, 100],
    [Number.POSITIVE_INFINITY, 100],
    [280, Number.POSITIVE_INFINITY],
  ])(
    'preserves actual Avatar/Details style outputs at height %s and bar %s',
    async (height, bar) => {
      installAnimationHarness();
      const evaluators = captureStyleEvaluators();
      const raw = scrollValue();
      const details = await renderHook(() =>
        useDetailsHeader<ScrollViewRef>({ parallaxHeight: height, headerHeight: bar })
      );

      await render(
        <>
          <AvatarForeground height={height} scrollValue={raw} title="A long profile title" />
          <AvatarBar height={height} scrollValue={raw} title="Profile" />
          <DetailsForeground height={height} scrollValue={raw} title="Details" />
        </>
      );

      // One Details bar style, four Avatar foreground styles, three Avatar bar
      // styles (including its static color), and three Details foreground styles.
      expect(evaluators).toHaveLength(11);
      const scrollHeight = Math.max(height, bar * 2);

      for (const value of offsets(height, scrollHeight)) {
        raw.value = value;
        details.result.current.scrollValue.value = value;
        const baseline = evaluators.map((evaluate) => evaluate());
        const bounded = getBoundedVisualScrollCandidate(value, height, scrollHeight);

        raw.value = bounded;
        details.result.current.scrollValue.value = bounded;
        expect(evaluators.map((evaluate) => evaluate())).toStrictEqual(baseline);
      }
    }
  );

  test.each([
    [0, 200],
    [-1, 200],
    [Number.NaN, 200],
    [Number.POSITIVE_INFINITY, 200],
    [280, Number.NaN],
    [280, Number.POSITIVE_INFINITY],
    [280, -1],
    [280, 279],
  ])('forwards raw values unchanged for unsupported geometry %s/%s', (height, collapse) => {
    for (const value of [-100, -0, 0, 400, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(getBoundedVisualScrollCandidate(value, height, collapse)).toBe(value);
    }
  });

  test('the actual derived hook preserves raw scroll and updates geometry/source in a delivery model', async () => {
    const records = new Set<{
      shared: SharedValue<number>;
      updater: () => number;
      runs: number;
      notifications: number;
    }>();

    // This models dependency delivery and primitive equality only. It does not
    // run Reanimated's native scheduler or establish FPS/commit improvements.
    jest.spyOn(Reanimated, 'useDerivedValue').mockImplementation(((updater: () => number) => {
      const record = React.useRef({
        shared: scrollValue(updater()),
        updater,
        runs: 0,
        notifications: 0,
      });

      record.current.updater = updater;
      React.useEffect(() => {
        const current = record.current;

        records.add(current);

        return () => {
          records.delete(current);
        };
      }, []);

      return record.current.shared as DerivedValue<number>;
    }) as unknown as typeof Reanimated.useDerivedValue);

    function deliver() {
      for (const record of records) {
        record.runs += 1;
        const next = record.updater();

        if (next !== record.shared.value) {
          record.shared.value = next;
          record.notifications += 1;
        }
      }
    }

    const raw = scrollValue(-20);
    const hook = await renderHook(
      ({
        source,
        height,
        collapse,
      }: {
        source: SharedValue<number>;
        height: number;
        collapse: number;
      }) => useBoundedVisualScrollCandidate(source, height, collapse),
      { initialProps: { source: raw, height: 280, collapse: 280 } }
    );
    const initialDerived = hook.result.current;

    for (const value of [-10, 0, 10, 100, 280, ...Array.from({ length: 100 }, (_, i) => 281 + i)]) {
      raw.value = value;
      deliver();
      expect(raw.value).toBe(value);
      expect(hook.result.current.value).toBe(getBoundedVisualScrollCandidate(value, 280, 280));
    }

    // 105 modeled deliveries, three changed derived values. Built-in dependent
    // styles would receive three notifications rather than each raw change.
    expect([...records][0]).toMatchObject({ runs: 105, notifications: 3 });
    await hook.rerender({ source: raw, height: 320, collapse: 400 });
    deliver();
    expect(hook.result.current).toBe(initialDerived);
    expect(hook.result.current.value).toBe(380);

    const replacement = scrollValue(-50);

    await hook.rerender({ source: replacement, height: 320, collapse: 400 });
    deliver();
    expect(hook.result.current.value).toBe(0);
    expect(replacement.value).toBe(-50);
    await hook.rerender({ source: replacement, height: 0, collapse: 400 });
    deliver();
    expect(hook.result.current.value).toBe(-50);
    await hook.unmount();
    expect(records.size).toBe(0);
  });
});

describe('private native background-radius candidate', () => {
  test.each<PlatformOSType>(['ios', 'android', 'web', 'windows', 'macos'])(
    'preserves stock colors and effective corners on %s',
    async (platform) => {
      const evaluators = captureStyleEvaluators();
      const raw = scrollValue();
      const sharedColor = { value: 0xff00ffff };
      const dynamicColor = ReactNative.DynamicColorIOS({ light: '#ffffff', dark: '#000000' });
      const colors: (AnimatedColorProp | undefined)[] = [
        undefined,
        '#abcdef',
        0,
        0xff00ffff,
        -16711681,
        Number.NaN,
        sharedColor,
        dynamicColor,
      ];

      for (const height of [100, 200, 280, 440, 0, -100, Number.NaN, Number.POSITIVE_INFINITY]) {
        for (const hasBorderRadius of [undefined, false, true]) {
          // Color conversion is independent of geometry; exercise every color
          // shape once, then keep a mutable shared color for the full matrix.
          const geometryColors =
            height === 280 && hasBorderRadius === true ? colors : [sharedColor];

          for (const color of geometryColors) {
            const start = evaluators.length;
            const rendered = await render(
              <HeaderBackground
                backgroundColor={color}
                hasBorderRadius={hasBorderRadius}
                height={height}
                scrollValue={raw}
              />
            );
            const evaluate = evaluators[start];

            for (const value of offsets(height, height)) {
              raw.value = value;
              const baseline = evaluate();
              const candidate = getBackgroundStyleCandidate(
                color,
                hasBorderRadius,
                height,
                value,
                platform
              );
              const radius = baseline.borderBottomEndRadius as number;
              const normalize =
                (platform === 'ios' || platform === 'android') &&
                Number.isFinite(height) &&
                height > 0 &&
                Number.isFinite(radius);

              expect(candidate.backgroundColor).toBe(baseline.backgroundColor);
              expect(candidate.borderBottomEndRadius).toBe(
                normalize ? Math.max(0, radius) : radius
              );
              if (normalize) {
                // RN resolves this isolated corner by the adjacent-edge scale.
                // Compare resolved geometry, including native -0 versus +0,
                // rather than demanding equal raw radius style numbers.
                const resolvedCorner = (input: number) => {
                  const scale =
                    input > 0
                      ? Math.min(1, dimensions.width / input, Math.max(height, 200) / input)
                      : 0;

                  return input * scale;
                };

                expect(
                  resolvedCorner(candidate.borderBottomEndRadius) === resolvedCorner(radius)
                ).toBe(true);
              }
            }

            await rendered.unmount();
          }
        }
      }

      sharedColor.value = 0x80ff0000;
      expect(
        getBackgroundStyleCandidate(sharedColor, true, 280, 20, platform).backgroundColor
      ).toBe('rgba(255, 0, 0, 0.5019607843137255)');
      expect(
        getBackgroundStyleCandidate(dynamicColor, true, 280, 20, platform).backgroundColor
      ).toBe(dynamicColor);
    }
  );

  test('retains negative-offset overscroll extension and only settles deep native scrolling', () => {
    for (const platform of ['ios', 'android'] as const) {
      expect(getBackgroundRadiusCandidate(-140, 280, true, platform)).toBe(120);
      expect(getBackgroundRadiusCandidate(0, 280, true, platform)).toBe(80);
      expect(getBackgroundRadiusCandidate(140, 280, true, platform)).toBe(40);
      expect(getBackgroundRadiusCandidate(280, 280, true, platform)).toBe(0);
      expect(getBackgroundRadiusCandidate(560, 280, true, platform)).toBe(0);
    }

    expect(getBackgroundRadiusCandidate(560, 280, true, 'web')).toBe(-80);
    // An explicit short foreground can remain visible after the radius hits
    // zero; the web's original invalid-negative-value history stays untouched.
    expect(getBackgroundRadiusCandidate(150, 100, true, 'web')).toBe(-40);
  });
});
