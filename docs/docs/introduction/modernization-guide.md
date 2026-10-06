---
sidebar_position: 3
---

# Migrate to the modern branch

This is a breaking migration from the historical React 17 / React Native 0.68 /
Reanimated 2 stack. It preserves the sticky-header component families while
moving native integration to the New Architecture. Choose a complete dependency
pair from [installation](./installation.md) before updating application code.

## Move FlashList imports

The core package no longer exports FlashList adapters or their prop types.
Install FlashList 2 and move those imports to the optional subpath:

```tsx
import { FlashList } from '@shopify/flash-list';
import type { FlashListRef } from '@shopify/flash-list';
import { useRef } from 'react';
import { Text } from 'react-native';
import { withAvatarHeaderFlashList } from 'react-native-sticky-parallax-header/flash-list';

const AvatarFlashList = withAvatarHeaderFlashList<string>(FlashList);

export function ProfileList() {
  const listRef = useRef<FlashListRef<string>>(null);

  return (
    <AvatarFlashList
      ref={listRef}
      containerStyle={{ flex: 1 }}
      title="Reading list"
      backgroundColor="#126b5e"
      data={['Architecture', 'Animation', 'Accessibility']}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
    />
  );
}
```

The application must provide `SafeAreaProvider` above this screen. FlashList 2
uses `FlashListRef<T>` for imperative refs and measures item sizes itself. Remove
`estimatedItemSize`, `estimatedListSize` and `estimatedFirstItemOffset`. The
tabbed FlashList adapter still uses flat `data` plus `stickyHeaderIndices`; it
does not accept SectionList `sections`.

The adapter defaults `maintainVisibleContentPosition` to `{ disabled: true }`
to avoid competing with the sticky layout. An explicit caller value is preserved.

## Update worklets and animated colors

Use `react-native-worklets/plugin` in bare apps, or the supported
`babel-preset-expo` setup in Expo. Replace `useWorkletCallback` with a function
containing a `'worklet'` directive. Replace `Extrapolate` with `Extrapolation`.

Create animated colors with Reanimated's `interpolateColor` inside
`useDerivedValue`; `useInterpolateConfig` and `interpolateSharableColor` are no
longer used. See the complete [animated colors example](../guides/animated-color-props.md).

Scroll callbacks receive `NativeScrollEvent` and execute as worklets. React
state/navigation effects must cross to the JavaScript runtime deliberately, for
example with `scheduleOnRN` from `react-native-worklets`. `onTopReached` remains
a JavaScript callback and does not need that bridge from the caller.

## Update refs and layout

Use the public ref types supplied by the installed React Native and FlashList
versions. The pager's outer ref controls its vertical scrollable;
`pagerProps.ref` exposes `goToPage`. Keep tab metadata in the same order as pager
children or list sections.

Modern Android uses edge-to-edge layout. Do not rely on `StatusBar.backgroundColor`
or `StatusBar.translucent`; style the screen background and handle safe-area
insets instead. Disable `enableSafeAreaTopInset` when a navigation header already
owns that inset.

## Verify the application

Rebuild iOS and Android after the dependency migration. Exercise expanded and
collapsed headers, dragging and momentum snapping, tab presses and horizontal
swipes, forwarded refs, refresh indicators, orientation changes, and RTL. Test
FlashList separately if installed. On web, also check the documented
[snapping and refresh boundaries](./web-support.md).

The 1.0.x and 0.4.x documentation snapshots remain available in the version menu
for applications that have not migrated.
