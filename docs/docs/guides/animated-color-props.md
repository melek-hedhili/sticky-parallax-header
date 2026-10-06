---
sidebar_position: 6
---

# Animated color props

Header backgrounds, tab backgrounds and tab underline colors accept Reanimated
shared values. Derive a color with `interpolateColor` inside `useDerivedValue`.
The scroll callbacks run as worklets; they receive `NativeScrollEvent` directly.

This complete screen assumes your application already provides `SafeAreaProvider`.

```tsx
import { useCallback } from 'react';
import type { NativeScrollEvent } from 'react-native';
import { Text, View, useWindowDimensions } from 'react-native';
import { interpolateColor, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';

export function AnimatedColorsScreen() {
  const { width } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const scrollX = useSharedValue(0);
  const onScroll = useCallback(
    (event: NativeScrollEvent) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
    [scrollY]
  );
  const onHorizontalScroll = useCallback(
    (event: NativeScrollEvent) => {
      'worklet';
      scrollX.value = event.contentOffset.x;
    },
    [scrollX]
  );
  const background = useDerivedValue(() =>
    interpolateColor(scrollY.value, [0, 250], ['#126b5e', '#3043a2'])
  );
  const underline = useDerivedValue(() =>
    interpolateColor(scrollX.value, [0, Math.max(width, 1)], ['#ffb347', '#ffffff'])
  );

  return (
    <TabbedHeaderPager
      containerStyle={{ flex: 1 }}
      title="Animated colors"
      backgroundColor={background}
      tabsContainerBackgroundColor={background}
      tabUnderlineColor={underline}
      tabTextStyle={{ color: 'white' }}
      tabs={[{ title: 'Overview' }, { title: 'Details' }]}
      onScroll={onScroll}
      pagerProps={{ onScroll: onHorizontalScroll }}>
      <View style={{ minHeight: 1000, padding: 24 }}>
        <Text>Scroll vertically to change the background.</Text>
      </View>
      <View style={{ minHeight: 1000, padding: 24 }}>
        <Text>Swipe horizontally to change the tab underline.</Text>
      </View>
    </TabbedHeaderPager>
  );
}
```

The interpolation range uses the viewport width instead of a fixed device size.
Do not read a shared value during React rendering to create an ordinary color
prop: pass the shared value itself so updates remain animated.

The old `useInterpolateConfig`, `interpolateSharableColor` and
`useWorkletCallback` APIs belong to the historical Reanimated 2 examples. They
are replaced by the APIs shown above in the modern branch.
