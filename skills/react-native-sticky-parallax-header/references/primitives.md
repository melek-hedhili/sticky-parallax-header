# Primitive headers

Read this reference for custom layouts built on React Native scrollables. Prefer predefined Avatar, Details, or Tabbed APIs when they already match the requested design.

## Public primitive API

| Export | Purpose |
| --- | --- |
| `StickyHeaderScrollView` | Free-form children in a sticky `ScrollView` |
| `StickyHeaderFlatList<ItemT>` | Flat, virtualized data |
| `StickyHeaderSectionList<ItemT, SectionT>` | Sectioned, virtualized data |
| `withStickyHeader` | Decorate another compatible React Native scroll component |
| `useStickyHeaderScrollProps` | Create snap handlers, scroll shared value, measured collapse distance, and animated ref |
| `useStickyHeaderProps` | Low-level measurement and overlay layout contract for a bespoke wrapper |
| `StickyHeaderSharedProps` | Header, tabs, layout, style, bounce, and scroll callback props |
| `StickyHeaderSnapProps` | Height, threshold, top callback, and snap configuration |
| `StickyHeaderScrollViewProps` | Primitive plus animated `ScrollView` props |
| `StickyHeaderFlatListProps<ItemT>` | Primitive plus animated `FlatList` props and required `data` |
| `StickyHeaderSectionListProps<ItemT, SectionT>` | Primitive plus animated `SectionList` props and required `sections` |

All of these imports come from the package root.

## Shared props and defaults

| Prop | Behavior | Default |
| --- | --- | --- |
| `children` | ScrollView content; use `data`/`sections` and renderers for list variants | — |
| `containerStyle` | Styles the outer wrapper | — |
| `contentContainerStyle` | Styles scroll content; numeric top/bottom padding participates in header compensation | — |
| `style` | Styles the underlying scrollable; numeric top padding participates in list positioning | — |
| `renderHeader` | Renders the measured collapsing overlay | — |
| `renderTabs` | Renders the separately measured tabs below the header | — |
| `stickyTabs` | Clamps translation so tabs remain visible; `false` lets the whole overlay continue away | `true` |
| `enableHeaderBounce` | Enables custom expanded-header pull behavior | `false` for primitives |
| `onHeaderLayout` | JavaScript layout callback after header measurement | — |
| `onTabsLayout` | JavaScript layout callback after tab measurement | — |
| `onScroll` | UI-runtime worklet receiving `NativeScrollEvent` | — |
| `onScrollBeginDrag` | UI-runtime worklet | — |
| `onScrollEndDrag` | UI-runtime worklet | — |
| `onMomentumScrollBegin` | UI-runtime worklet | — |
| `onMomentumScrollEnd` | UI-runtime worklet | — |

Only numeric `paddingTop` and `paddingBottom` values can be measured for compensation. Percentage or string padding is preserved visually but is treated as zero by the layout calculation.

The wrappers default `overScrollMode` to `never` and `scrollEventThrottle` to `16`. They measure the rendered header/tabs, offset content, translate the absolute overlay, and forward refs to the underlying scroll component. Use the native ref type from the installed React Native version, normally `ComponentRef<typeof ScrollView>`, `ComponentRef<typeof FlatList<ItemT>>`, or `ComponentRef<typeof SectionList<ItemT, SectionT>>`.

## Snap props and hook contract

`useStickyHeaderScrollProps<T>(props)` accepts `StickyHeaderSharedProps & StickyHeaderSnapProps`.

| Prop | Behavior | Default |
| --- | --- | --- |
| `headerHeight` | Collapsed header-bar height used in the collapse range | `100` dp |
| `parallaxHeight` | Expanded custom-header height | 53% of viewport height |
| `snapToEdge` | Enables snapping to expanded or collapsed edge | `true` |
| `snapStartThreshold` | Offset at which the preferred edge changes | `scrollHeight / 2` |
| `snapStopThreshold` | Collapsed snap destination | `scrollHeight` |
| `onTopReached` | JavaScript callback fired once per visit to offset `<= 0` | — |

`scrollHeight` is `Math.max(parallaxHeight, headerHeight * 2)`. The hook returns:

- `onScroll`, `onScrollEndDrag`, and `onMomentumScrollEnd`: pass all three to the decorated component;
- `scrollHeight`: use it to size the custom header so visuals and snapping agree;
- `scrollValue`: a Reanimated shared value for custom animation;
- `scrollViewRef`: an animated ref for the underlying scrollable.

The returned handlers compose the corresponding callbacks supplied in the hook props. Do not replace a returned handler with a separate callback; pass the callback into the hook instead.

## Custom ScrollView example

```tsx
import type { ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import {
  StickyHeaderScrollView,
  useStickyHeaderScrollProps,
} from '@mhedhili/react-native-sticky-parallax-header';

export function ArticlesScreen() {
  const sticky = useStickyHeaderScrollProps<ComponentRef<typeof ScrollView>>({
    parallaxHeight: 280,
    snapStartThreshold: 80,
    snapStopThreshold: 280,
  });
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sticky.scrollValue.value, [0, 200], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <StickyHeaderScrollView
      ref={sticky.scrollViewRef}
      containerStyle={{ flex: 1 }}
      onScroll={sticky.onScroll}
      onScrollEndDrag={sticky.onScrollEndDrag}
      onMomentumScrollEnd={sticky.onMomentumScrollEnd}
      renderHeader={() => (
        <View style={{ height: sticky.scrollHeight, padding: 24, backgroundColor: '#22577a' }}>
          <Animated.Text style={[{ color: 'white', fontSize: 30 }, titleStyle]}>
            Articles
          </Animated.Text>
        </View>
      )}
      renderTabs={() => (
        <View style={{ padding: 16, backgroundColor: 'white' }}>
          <Text>Latest</Text>
        </View>
      )}>
      <Text style={{ minHeight: 1200, padding: 24 }}>Content</Text>
    </StickyHeaderScrollView>
  );
}
```

Primitive headers do not add a safe-area header bar. Let the screen/navigation own safe areas, or wrap the appropriate region with `SafeAreaView` from `react-native-safe-area-context`.

## `withStickyHeader`

Use `withStickyHeader(Component)` only for a compatible React Native scroll component that:

- forwards a native scroll ref;
- accepts `style` and `contentContainerStyle`;
- accepts the standard scroll lifecycle callbacks and `scrollEventThrottle`;
- reports native scroll events compatible with Reanimated.

Do not use this HOC for FlashList; use `withStickyHeaderFlashList` from `/flash-list`.

## `useStickyHeaderProps`

This is the low-level layout hook for consumers building their own wrapper instead of using `withStickyHeader`. It accepts `StickyHeaderSharedProps` and returns:

| Return value | Purpose |
| --- | --- |
| `contentContainerPaddingTop` | Numeric original top padding |
| `contentContainerPaddingBottom` | Numeric original bottom padding |
| `headerAnimatedStyle` | Translation style for the overlay |
| `headerHeight` | Measured header height |
| `listPaddingTop` | Numeric top padding from `style` |
| `onHeaderLayoutInternal` | Attach to the rendered header container |
| `onTabsLayoutInternal` | Attach to the rendered tabs container |
| `scrollHandler` | Attach as the animated scroll handler |
| `tabsHeight` | Measured tabs height |

The public layout hook deliberately does not expose the wrappers' internal gesture state. Reproduce the wrapper structure only when a custom scroll host makes the HOC insufficient; otherwise the HOC is safer and smaller.

