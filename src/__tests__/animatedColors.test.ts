// The cross-platform parser must preserve the opaque iOS dynamic color representation.
// eslint-disable-next-line react-native/split-platform-components
import { DynamicColorIOS, processColor } from 'react-native';
import type { DerivedValue, SharedValue } from 'react-native-reanimated';

import { parseAnimatedColorProp } from '../predefinedComponents/common/utils/parseAnimatedColorProp';

test('supports static, shared, and derived color strings', () => {
  expect(parseAnimatedColorProp()).toBeUndefined();
  expect(parseAnimatedColorProp('#ff0000')).toBe('#ff0000');
  expect(parseAnimatedColorProp({ value: 'red' } as SharedValue<string>)).toBe('red');
  expect(parseAnimatedColorProp({ value: 'blue' } as DerivedValue<string>)).toBe('blue');
});

test('normalizes processed ARGB colors including signed Android values', () => {
  expect(parseAnimatedColorProp(processColor('red') ?? undefined)).toBe('rgba(255, 0, 0, 1)');
  expect(parseAnimatedColorProp(-16711936)).toBe('rgba(0, 255, 0, 1)');
  expect(parseAnimatedColorProp({ value: 0x800000ff })).toBe(`rgba(0, 0, 255, ${128 / 255})`);
});

test('keeps native dynamic color objects intact', () => {
  const dynamicColor = DynamicColorIOS({ light: 'white', dark: 'black' });

  expect(parseAnimatedColorProp(dynamicColor)).toBe(dynamicColor);
  expect(parseAnimatedColorProp({ value: dynamicColor })).toBe(dynamicColor);
});
