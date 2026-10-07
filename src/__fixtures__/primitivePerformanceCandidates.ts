import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyle, SharedValue } from 'react-native-reanimated';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

/**
 * Private benchmark candidate only. Production retains its existing mapper until
 * physical-device release measurements establish a benefit through the collapse.
 */
export function usePrimitiveHeaderTranslationCandidate(
  scrollValue: SharedValue<number>,
  headerHeight: number,
  stickyTabs = true
): AnimatedStyle<ViewStyle> {
  const translation = useDerivedValue(
    () =>
      interpolate(
        scrollValue.value,
        [0, headerHeight],
        [0, -headerHeight],
        stickyTabs ? Extrapolation.CLAMP : Extrapolation.EXTEND
      ),
    // Native tracks the worklet closure; web without the plugin needs these inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Platform.OS === 'web' ? [scrollValue, headerHeight, stickyTabs] : undefined
  );

  return useAnimatedStyle(
    () => ({ transform: [{ translateY: translation.value }] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Platform.OS === 'web' ? [translation] : undefined
  );
}
