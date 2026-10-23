# FlashList integration

Read this reference only when the consumer uses `@shopify/flash-list`. FlashList support is optional, requires FlashList 2 and the New Architecture, and never comes from the package root.

## Install and import

Let Expo select its compatible version:

```sh
npx expo install @shopify/flash-list
```

For the repository's bare React Native target:

```sh
yarn add @shopify/flash-list@2.3.3
```

Every integration import uses the optional entrypoint:

```ts
import {
  withAvatarHeaderFlashList,
  type AvatarHeaderFlashListProps,
} from '@mhedhili/react-native-sticky-parallax-header/flash-list';
```

Core-only code must not import this entrypoint or require FlashList.

## Public exports

| Export | Purpose |
| --- | --- |
| `withStickyHeaderFlashList` | Custom sticky header/tabs over FlashList |
| `useStickyHeaderFlashListScrollProps` | FlashList snap handlers, shared value, collapse distance, and animated ref |
| `withAvatarHeaderFlashList` | Ready Avatar foreground and bar |
| `withDetailsHeaderFlashList` | Ready Details foreground and bar |
| `withTabbedHeaderFlashList` | Tabs mapped to sticky indices in flat data |
| `StickyHeaderFlashListProps<ItemT>` | Custom adapter props |
| `AvatarHeaderFlashListProps<ItemT>` | Avatar adapter props |
| `DetailsHeaderFlashListProps<ItemT>` | Details adapter props |
| `TabbedHeaderFlashListProps<ItemT>` | Tabbed adapter props |

The consumer supplies the FlashList component to each HOC. Type the item generic at decoration time when possible:

```tsx
import { FlashList } from '@shopify/flash-list';
import { withDetailsHeaderFlashList } from '@mhedhili/react-native-sticky-parallax-header/flash-list';

const DetailsFlashList = withDetailsHeaderFlashList<string>(FlashList);
```

The result forwards `FlashListRef<ItemT>`, accepts required flat `data` and `renderItem`, and otherwise inherits the allowed FlashList 2 props plus its header family's props. FlashList 2 measures items itself; do not add the removed `estimatedItemSize`, `estimatedListSize`, or `estimatedFirstItemOffset` props.

## Shared adapter behavior

- Primitive FlashList bounce defaults to `false`; predefined Avatar, Details, and Tabbed adapters default it to `true`.
- Predefined adapters share the same responsive `parallaxHeight`, safe-area, snap, and header defaults as their core equivalents.
- `maintainVisibleContentPosition` defaults to `{ disabled: true }` only when omitted. Preserve an explicit consumer value.
- `FlashListRef<ItemT>` is the imperative ref type. The FlashList component value is not its ref type.
- The sticky wrapper owns scroll lifecycle handlers needed for layout and snapping. Pass consumer callbacks through the relevant hook or predefined props so they can be composed.
- Custom scroll renderers and custom refresh roots retain their native behavior on Android instead of receiving an automatic gesture wrapper.

## Predefined example

```tsx
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native';
import { withDetailsHeaderFlashList } from '@mhedhili/react-native-sticky-parallax-header/flash-list';

const DetailsFlashList = withDetailsHeaderFlashList<string>(FlashList);
const articles = ['Layout', 'Scrolling', 'Animation'];

export function ReadingList() {
  return (
    <DetailsFlashList
      containerStyle={{ flex: 1 }}
      title="Reading list"
      subtitle="Three articles"
      backgroundColor="#126b5e"
      data={articles}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
    />
  );
}
```

Use `withAvatarHeaderFlashList` or `withDetailsHeaderFlashList` exactly as their core flat-list equivalents. Their family-specific props are documented in [Avatar and Details](avatar-and-details.md).

## Tabbed FlashList

`withTabbedHeaderFlashList` uses flat `data`, not SectionList `sections`. Provide one tab per `stickyHeaderIndices` entry, in the same ascending order. Each sticky index marks the data item that starts the corresponding tab section.

The adapter tracks the first visible item against those indices and uses `scrollToIndex` for tab presses. It owns the tab synchronization callback and defaults `viewabilityConfig` to `{ itemVisiblePercentThreshold: 50 }`.

```tsx
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native';
import { withTabbedHeaderFlashList } from '@mhedhili/react-native-sticky-parallax-header/flash-list';

type Row = { id: string; label: string; heading?: boolean };

const data: Row[] = [
  { id: 'recent', label: 'Recent', heading: true },
  { id: 'recent-1', label: 'First note' },
  { id: 'saved', label: 'Saved', heading: true },
  { id: 'saved-1', label: 'Saved note' },
];
const TabbedFlashList = withTabbedHeaderFlashList<Row>(FlashList);

export function LibraryScreen() {
  return (
    <TabbedFlashList
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Library"
      tabs={[{ title: 'Recent' }, { title: 'Saved' }]}
      stickyHeaderIndices={[0, 2]}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Text style={{ padding: 20, fontWeight: item.heading ? 'bold' : 'normal' }}>
          {item.label}
        </Text>
      )}
    />
  );
}
```

In the current iOS Expo demo, jumping to a later tab can remain at the first section with the first tab selected; the equivalent Android case reaches the destination. Offscreen accessibility nodes do not prove the visible scroll succeeded. Verify the visible destination on iOS when using tabbed FlashList.

## Custom FlashList header

Pair `withStickyHeaderFlashList` with `useStickyHeaderFlashListScrollProps`. The hook has the same inputs and return names as the core snap hook, but uses `FlashListRef` and schedules `scrollToOffset` on JavaScript for snapping.

```tsx
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Text, View } from 'react-native';
import {
  useStickyHeaderFlashListScrollProps,
  withStickyHeaderFlashList,
} from '@mhedhili/react-native-sticky-parallax-header/flash-list';

const StickyFlashList = withStickyHeaderFlashList<string>(FlashList);
const items = Array.from({ length: 40 }, (_, index) => `Article ${index + 1}`);

export function CustomFlashHeader() {
  const sticky = useStickyHeaderFlashListScrollProps<FlashListRef<string>>({
    parallaxHeight: 280,
  });

  return (
    <StickyFlashList
      ref={sticky.scrollViewRef}
      containerStyle={{ flex: 1 }}
      data={items}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
      onScroll={sticky.onScroll}
      onScrollEndDrag={sticky.onScrollEndDrag}
      onMomentumScrollEnd={sticky.onMomentumScrollEnd}
      renderHeader={() => (
        <View style={{ height: sticky.scrollHeight, padding: 24, backgroundColor: '#126b5e' }}>
          <Text style={{ color: 'white', fontSize: 28 }}>Reading list</Text>
        </View>
      )}
    />
  );
}
```

Pass the returned ref and all three returned handlers. Size the foreground with `scrollHeight`.

## Refresh

Use FlashList's `onRefresh` and `refreshing` props only on native platforms. Native refresh and the visual header bounce are separate: bounce does not call `onRefresh`. On web, omit native refresh props and provide another interaction.

