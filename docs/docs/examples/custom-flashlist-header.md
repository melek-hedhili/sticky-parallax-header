---
sidebar_position: 3
---

# Custom FlashList Header

Use the optional `/flash-list` entry to wrap FlashList 2. The primitive adapter
provides sticky layout; the accompanying hook supplies snapping handlers and a
`FlashListRef`. Install the [matching dependencies](../introduction/installation.md)
and provide `SafeAreaProvider` above the screen.

```tsx
import { FlashList } from '@shopify/flash-list';
import type { FlashListRef } from '@shopify/flash-list';
import { Text, View } from 'react-native';
import {
  useStickyHeaderFlashListScrollProps,
  withStickyHeaderFlashList,
} from 'react-native-sticky-parallax-header/flash-list';

const StickyFlashList = withStickyHeaderFlashList<string>(FlashList);
const items = Array.from({ length: 40 }, (_, index) => `Article ${index + 1}`);

export function CustomFlashListHeader() {
  const { onScroll, onScrollEndDrag, onMomentumScrollEnd, scrollHeight, scrollViewRef } =
    useStickyHeaderFlashListScrollProps<FlashListRef<string>>({
      parallaxHeight: 280,
      snapStartThreshold: 50,
      snapStopThreshold: 280,
      snapToEdge: true,
    });

  return (
    <StickyFlashList
      ref={scrollViewRef}
      containerStyle={{ flex: 1 }}
      data={items}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
      onScroll={onScroll}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollEnd={onMomentumScrollEnd}
      renderHeader={() => (
        <View style={{ height: scrollHeight, backgroundColor: '#126b5e', padding: 24 }}>
          <Text style={{ color: 'white', fontSize: 28 }}>Reading list</Text>
        </View>
      )}
      renderTabs={() => (
        <View style={{ backgroundColor: 'white', padding: 16 }}>
          <Text>Latest articles</Text>
        </View>
      )}
    />
  );
}
```

Pass the returned ref and all three event handlers to the decorated component.
Size the rendered foreground using `scrollHeight` so the configured collapse
range and visible header agree.

FlashList 2 measures items without `estimatedItemSize`. The adapter defaults
`maintainVisibleContentPosition` to `{ disabled: true }`; pass a value explicitly
only when you want FlashList's automatic position maintenance as well.

For refresh behavior, use the list's `onRefresh` and `refreshing` props on native
platforms only; see [pull to refresh](../guides/pull-to-refresh.md). For a ready
layout, use one of the [predefined FlashList adapters](../headers/flashlist-headers.md).
