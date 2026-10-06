---
sidebar_position: 6
---

# FlashList Headers

FlashList 2 integration is optional and requires the New Architecture. Import
all its adapters, hook and prop types from
`react-native-sticky-parallax-header/flash-list`. Import core components from the
main entry as usual; applications using only core components do not need
`@shopify/flash-list` installed.

## Predefined layouts

- `withAvatarHeaderFlashList` adds the [Avatar layout](./avatar-header.md).
- `withDetailsHeaderFlashList` adds the [Details layout](./details-header.md).
- `withTabbedHeaderFlashList` adds a tabbed header over flat FlashList data.

```tsx
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native';
import { withDetailsHeaderFlashList } from 'react-native-sticky-parallax-header/flash-list';

const DetailsFlashList = withDetailsHeaderFlashList<string>(FlashList);

export function ReadingList() {
  return (
    <DetailsFlashList
      containerStyle={{ flex: 1 }}
      title="Reading list"
      subtitle="Three articles"
      backgroundColor="#126b5e"
      data={['Layout', 'Scrolling', 'Animation']}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
    />
  );
}
```

As with other predefined headers, provide `SafeAreaProvider` at the app root.

Predefined FlashList adapters use the same compact `parallaxHeight` defaults as
their core header families: 200 dp for short phone landscape windows, otherwise
280–320 dp based on window height. See the exact formula and explicit-height
guidance in [Avatar](./avatar-header.md#expanded-header-height),
[Details](./details-header.md#expanded-header-height) or
[Tabbed Header List](./tabbed-header-list.md#expanded-header-height). Explicit
`parallaxHeight` values bypass that default calculation; `headerHeight` remains
100 dp by default and scroll height remains
`Math.max(parallaxHeight, headerHeight * 2)`.

## Props and refs

The adapters accept the relevant [FlashList props](https://shopify.github.io/flash-list/docs/usage/)
and the shared props of their header family. Sticky layout replaces the list's
scroll lifecycle handlers with worklet callbacks receiving `NativeScrollEvent`;
header/tab layout and container styling are provided by the adapter.

Use `FlashListRef<ItemT>` from `@shopify/flash-list` for forwarded refs. FlashList
2 is a function component; its component value is not the instance/ref type.
`estimatedItemSize`, `estimatedListSize` and `estimatedFirstItemOffset` are not
part of the modern API.

`maintainVisibleContentPosition` defaults to `{ disabled: true }` when omitted,
so FlashList's position maintenance does not compete with header scrolling. An
explicit caller value passes through.

### Tabbed FlashList

`withTabbedHeaderFlashList` uses flat `data` and `stickyHeaderIndices`. Supply
one tab per sticky index in ascending order. It does **not** accept SectionList
`sections`; use `TabbedHeaderList` for a SectionList data model. The tab selection
tracks the visible range, and pressing a tab scrolls to its corresponding index.

## Custom layout

For a custom foreground and tabs, use `withStickyHeaderFlashList` with
`useStickyHeaderFlashListScrollProps`. See the complete
[custom FlashList example](../examples/custom-flashlist-header.md).
