/* eslint-disable no-bitwise -- Packed native ARGB values require byte extraction. */
import type { AnimatedColorProp, ColorProp } from '../SharedProps';

export function parseAnimatedColorProp(
  animatedColorProp?: AnimatedColorProp
): ColorProp | undefined {
  'worklet';

  const color =
    animatedColorProp !== null &&
    typeof animatedColorProp === 'object' &&
    'value' in animatedColorProp
      ? animatedColorProp.value
      : animatedColorProp;

  // React Native's processed numeric colors use ARGB on both platforms (signed
  // on Android). Animated styles in both supported Reanimated versions accept strings.
  if (typeof color === 'number') {
    const argb = color >>> 0;

    return `rgba(${(argb >>> 16) & 255}, ${(argb >>> 8) & 255}, ${argb & 255}, ${(argb >>> 24) / 255})`;
  }

  return color;
}
