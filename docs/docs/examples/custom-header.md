---
sidebar_position: 2
---

# Custom Header

The Expo Router demo contains a complete
[custom header screen](https://github.com/netguru/sticky-parallax-header/blob/master/demo/src/showcase/screens/sims-screen/index.tsx).

Use `StickyHeaderScrollView`, `StickyHeaderFlatList`, or `StickyHeaderSectionList` to supply your own `renderHeader` and `renderTabs`. Wrap another compatible scroll component with `withStickyHeader` when needed. FlashList has a [separate adapter](custom-flashlist-header.md).

## Scroll props

`useStickyHeaderScrollProps` supplies the ref, measured scroll area and handlers for snapping. Forward all three handlers and use `scrollHeight` for the header container. Here the title fades as the header collapses; the tab bar remains sticky.

```tsx
import type { ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import {
  StickyHeaderScrollView,
  useStickyHeaderScrollProps,
} from 'react-native-sticky-parallax-header';

export default function CustomHeaderScreen() {
  const {
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  } = useStickyHeaderScrollProps<ComponentRef<typeof ScrollView>>({
    parallaxHeight: 280,
    snapStartThreshold: 50,
    snapStopThreshold: 280,
    snapToEdge: true,
  });
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollValue.value, [0, 200], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <StickyHeaderScrollView
      ref={scrollViewRef}
      containerStyle={{ flex: 1 }}
      onScroll={onScroll}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollEndDrag={onScrollEndDrag}
      renderHeader={() => (
        <View style={{ height: scrollHeight, padding: 24, backgroundColor: '#22577a' }}>
          <Animated.Text style={[{ color: 'white', fontSize: 32 }, titleStyle]}>
            Explore nearby
          </Animated.Text>
        </View>
      )}
      renderTabs={() => (
        <View style={{ padding: 16, backgroundColor: '#d8f3dc' }}>
          <Text>Field notes</Text>
        </View>
      )}>
      {Array.from({ length: 30 }, (_, index) => (
        <Text key={index} style={{ padding: 24 }}>
          Trail {index + 1}
        </Text>
      ))}
    </StickyHeaderScrollView>
  );
}
```

The primitives leave safe-area layout to you; use `SafeAreaView` from `react-native-safe-area-context` around this screen when it does not sit below a navigation header. See [scroll references](../guides/scrollview-reference.md) for imperative scrolling.
