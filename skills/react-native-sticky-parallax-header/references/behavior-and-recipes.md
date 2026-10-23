# Behavior and recipes

Read only the sections relevant to the requested behavior.

## Worklet and JavaScript callbacks

These callbacks run on the UI runtime and must be worklets:

- primitive and predefined `onScroll`, `onScrollBeginDrag`, `onScrollEndDrag`, `onMomentumScrollBegin`, and `onMomentumScrollEnd`;
- the equivalent callbacks inside `TabbedHeaderPager.pagerProps`.

Use `useCallback` with a `'worklet'` directive. Access shared values directly. To invoke React state, navigation, alerts, analytics, or another ordinary JavaScript callback, use `scheduleOnRN` from `react-native-worklets`.

```tsx
import { useCallback } from 'react';
import type { NativeScrollEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

function Example({ reportCollapsed }: { reportCollapsed: () => void }) {
  const scrollY = useSharedValue(0);
  const collapsed = useSharedValue(false);
  const onScroll = useCallback(
    (event: NativeScrollEvent) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
      const nextCollapsed = event.contentOffset.y >= 280;
      if (nextCollapsed !== collapsed.value) {
        collapsed.value = nextCollapsed;
        if (nextCollapsed) scheduleOnRN(reportCollapsed);
      }
    },
    [collapsed, reportCollapsed, scrollY]
  );

  return null;
}
```

Avoid calling the JavaScript function on every frame; gate or debounce such transitions when necessary.

These callbacks already run on JavaScript and do not need a bridge: `onTopReached`, `onHeaderLayout`, `onTabsLayout`, icon presses, and `onChangeTab`.

## Animated colors

`backgroundColor`, `tabsContainerBackgroundColor`, and `tabUnderlineColor` accept ordinary React Native colors, processed colors, and read-only shared/derived values. Derive animated colors on the UI runtime:

```tsx
import { interpolateColor, useDerivedValue, useSharedValue } from 'react-native-reanimated';

const scrollY = useSharedValue(0);
const background = useDerivedValue(() =>
  interpolateColor(scrollY.value, [0, 250], ['#126b5e', '#3043a2'])
);
```

Pass `background` itself. Do not read `background.value` during React rendering. Dynamic native color objects are also valid and should not be coerced to strings.

For horizontal tab animation, update another shared value from `pagerProps.onScroll` and use the current viewport width in interpolation ranges rather than a fixed device width.

## Snapping

The custom snap hook and predefined headers use:

```ts
const scrollHeight = Math.max(parallaxHeight, headerHeight * 2);
const snapStart = snapStartThreshold ?? scrollHeight / 2;
const snapStop = snapStopThreshold ?? scrollHeight;
```

Slow releases prefer the nearest side of `snapStart`. Fast releases can continue in the gesture direction; the internal velocity cutoff is `7`. Snapping runs after momentum and, where appropriate, after a zero-velocity drag end. Disable it with `snapToEdge={false}`.

Keep `snapStartThreshold` and `snapStopThreshold` inside the actual content/collapse geometry unless the design deliberately needs another target. When using a custom foreground, size it with the hook's `scrollHeight` instead of duplicating the formula.

Native snap-to-edge behavior is not part of the web contract because web lacks the same drag/momentum event sequence. Scrolling and header translation still work.

## Expanded-header bounce

Predefined Avatar, Details, Tabbed, and predefined FlashList headers default `enableHeaderBounce` to `true`. Primitive/custom wrappers default it to `false`.

`bounces={false}` or `scrollEnabled={false}` disables the custom effect. On iOS, native negative offsets drive it. On Android, Gesture Handler provides visual pull while native refresh keeps ownership of refresh. The bounce never invokes `onRefresh`.

Set `enableHeaderBounce={false}` on an outer pager header whose children contain independently scrolling vertical lists. The outer scroll view cannot know whether an inner list is at its own top.

On Android, opaque custom scroll renderers and custom refresh-control roots keep their native behavior rather than receiving the automatic gesture wrapper. Do not replace their forwarded refs or native scroll props.

## Pull to refresh

FlatList, SectionList, and FlashList variants inherit `onRefresh` and `refreshing`. A ScrollView variant instead needs an explicit `refreshControl`:

```tsx
import { Platform, RefreshControl } from 'react-native';

const refreshControl =
  Platform.OS === 'web' ? undefined : (
    <RefreshControl style={{ zIndex: 1 }} refreshing={refreshing} onRefresh={reload} />
  );
```

The `zIndex` keeps the iOS indicator above the header overlay. Do not pass list-only `onRefresh`/`refreshing` props to `StickyHeaderScrollView`. Omit native refresh props on web and provide a button or another web interaction.

## Safe areas and navigation

Predefined bars add the top safe-area inset by default. Keep it when the sticky header draws behind a hidden or transparent navigation header. Set `enableSafeAreaTopInset={false}` when an opaque React Navigation or Expo Router header already handles the inset.

A custom `renderHeaderBar` owns its inset. Measure it consistently:

```tsx
const { top } = useSafeAreaInsets();
const headerHeight = top + 56;

<TabbedHeaderPager
  headerHeight={headerHeight}
  renderHeaderBar={() => (
    <View style={{ height: headerHeight, paddingTop: top }}>{/* bar */}</View>
  )}
/>;
```

Primitive headers add no bar-specific safe-area handling.

## Icons and accessibility

Avatar and Details action icons accept an image source or a render function. When an icon has an `OnPress` callback, supply its matching accessibility label. Preserve hit targets and accessibility roles in custom rendered icons.

Tabbed icons accept an element or `(isActive: boolean) => element`. Use the active argument to change appearance without maintaining duplicate tab state. Supply `Tab.testID` when tests need a stable tab control identifier.

## Refs

Core components forward the underlying React Native scroll ref. Infer it with `ComponentRef`:

```tsx
import { type ComponentRef, useRef } from 'react';
import { ScrollView } from 'react-native';

const ref = useRef<ComponentRef<typeof ScrollView>>(null);
```

Keep item/section generics for list refs. FlashList adapters use `FlashListRef<ItemT>`. `TabbedHeaderPager` has two independent refs: its outer `ref` for vertical scrolling and `pagerProps.ref` for `PagerMethods.goToPage`.

## Web, RTL, and responsive layout

- Web supports scroll-driven header animation but not native snap-to-edge or native pull-to-refresh.
- The web tab and pager paths debounce scroll-end detection; test interactions in a browser.
- Predefined height follows window changes. Do not hard-code current device width into pager or color calculations.
- Tabs and pager contain explicit RTL handling, but custom content and icons still need the app's RTL-aware styles.
- A bundle/export proves compilation, not smooth scrolling, gesture ownership, or accessibility.

## Focused verification

Match verification to the implemented path:

- Typecheck the consumer app and fix errors at the public API boundary rather than deep-importing internals.
- On iOS and Android, test expanded/collapsed states, slow and fast drags, momentum, safe-area placement, forwarded refs, and refresh if present.
- For tabs, test presses, swipes, active styling, content order, orientation changes, and RTL.
- For SectionList, verify empty and non-empty sections and sticky headers.
- For FlashList, verify visible destinations rather than relying on mounted accessibility nodes.
- On web, test scrolling, tab presses, pager swipes, responsive width changes, and the app's alternative refresh interaction.

