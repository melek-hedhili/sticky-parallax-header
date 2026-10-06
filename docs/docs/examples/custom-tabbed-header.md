---
sidebar_position: 1
---

# Custom Tabbed Header

![Tabbed Header Gif](@site/static/img/assets/readme_yoda.gif)

## Custom scrollable tabs

Pass one `tabs` entry for each child of `TabbedHeaderPager`, in the same order. `tabTextStyle`, `tabTextActiveStyle`, `tabTextContainerStyle`, and `tabTextContainerActiveStyle` control the inactive and active tab appearances. Use `tabsContainerStyle` for the bar and `tabWrapperStyle` for each tab.

## Custom header foreground

Set `title`, `foregroundImage`, `backgroundImage`, or `backgroundColor` for the foreground and background. The image props accept React Native image sources. Use `titleStyle` to style the title.

## Custom Header component

`renderHeaderBar` supplies an overlay independent of the collapsing foreground. This example fades its title in as the foreground collapses. The `onScroll` callback runs as a worklet, so it updates a shared value without a React render on every frame.

The example assumes `SafeAreaProvider` at the app root. `useSafeAreaInsets` gives the custom bar its top inset.

```tsx
import { useCallback } from 'react';
import { type NativeScrollEvent, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';

const tabs = [{ title: 'Overview' }, { title: 'Trails' }];

export default function CustomTabsScreen() {
  const { top } = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useCallback(
    (event: NativeScrollEvent) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
    [scrollY]
  );
  const barTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [120, 220], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <TabbedHeaderPager
      containerStyle={{ flex: 1 }}
      title="Explore nearby"
      titleStyle={{ color: 'white', fontSize: 32 }}
      backgroundColor="#22577a"
      parallaxHeight={280}
      headerHeight={top + 56}
      onScroll={onScroll}
      tabs={tabs}
      tabTextStyle={{ color: 'white' }}
      tabTextActiveStyle={{ fontWeight: 'bold' }}
      tabTextContainerActiveStyle={{ backgroundColor: '#14394f' }}
      renderHeaderBar={() => (
        <View style={{ height: top + 56, paddingTop: top, paddingHorizontal: 24 }}>
          <Animated.Text style={[{ color: 'white', fontSize: 20 }, barTitleStyle]}>
            Explore nearby
          </Animated.Text>
        </View>
      )}>
      {tabs.map(({ title }) => (
        <View key={title} style={{ minHeight: 1200, padding: 24 }}>
          <Text>{title}</Text>
        </View>
      ))}
    </TabbedHeaderPager>
  );
}
```

For animated background and tab colors, see [animated color props](../guides/animated-color-props.md).
