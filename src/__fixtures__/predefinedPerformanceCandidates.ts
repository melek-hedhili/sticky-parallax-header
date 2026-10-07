import type { PlatformOSType } from 'react-native';
import type { DerivedValue, SharedValue } from 'react-native-reanimated';
import { Extrapolation, interpolate, useDerivedValue } from 'react-native-reanimated';

import type { AnimatedColorProp } from '../predefinedComponents/common/SharedProps';
import { parseAnimatedColorProp } from '../predefinedComponents/common/utils/parseAnimatedColorProp';

/**
 * Private benchmark candidates, deliberately disconnected from production.
 * Numerical equivalence does not prove native frame timing or pixel equivalence.
 */
export function getBoundedVisualScrollCandidate(
  scroll: number,
  parallaxHeight: number,
  scrollHeight: number
): number {
  'worklet';

  if (
    !Number.isFinite(scroll) ||
    !Number.isFinite(parallaxHeight) ||
    parallaxHeight <= 0 ||
    !Number.isFinite(scrollHeight) ||
    scrollHeight < parallaxHeight
  ) {
    // Preserve legacy outputs for nonfinite scroll and degenerate geometry.
    return scroll;
  }

  return Math.min(Math.max(scroll, 0), scrollHeight);
}

/** Raw scroll must still drive callbacks, snapping, colors and EXTEND styles. */
export function useBoundedVisualScrollCandidate(
  rawScrollValue: SharedValue<number>,
  parallaxHeight: number,
  scrollHeight: number
): DerivedValue<number> {
  return useDerivedValue(
    () => getBoundedVisualScrollCandidate(rawScrollValue.value, parallaxHeight, scrollHeight),
    [rawScrollValue, parallaxHeight, scrollHeight]
  );
}

export function getBackgroundRadiusCandidate(
  scroll: number,
  height: number,
  hasBorderRadius: boolean | undefined,
  platform: PlatformOSType
): number {
  'worklet';

  if (!hasBorderRadius) {
    return 0;
  }

  const radius = interpolate(scroll, [0, height], [80, 0], Extrapolation.EXTEND);

  if (
    (platform === 'ios' || platform === 'android') &&
    Number.isFinite(height) &&
    height > 0 &&
    Number.isFinite(radius)
  ) {
    // Only the native effective zero corner is normalized. Negative-offset
    // overscroll still extends above 80; web keeps its original CSS history.
    return Math.max(0, radius);
  }

  return radius;
}

export function getBackgroundStyleCandidate(
  backgroundColor: AnimatedColorProp | undefined,
  hasBorderRadius: boolean | undefined,
  height: number,
  scroll: number,
  platform: PlatformOSType
) {
  'worklet';

  return {
    backgroundColor: parseAnimatedColorProp(backgroundColor),
    borderBottomEndRadius: getBackgroundRadiusCandidate(scroll, height, hasBorderRadius, platform),
  };
}
