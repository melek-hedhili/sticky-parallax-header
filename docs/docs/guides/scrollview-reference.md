---
sidebar_position: 1
---

# Scroll component reference

## Handling reference to underlying `ScrollView`, `FlatList` or `SectionList`

The headers forward their ref to the underlying scroll component. Infer modern native component refs using `ComponentRef`; list refs retain their item type. This example assumes `SafeAreaProvider` at the app root.

```tsx
import { type ComponentRef, useRef } from 'react';
import { Button, ScrollView, Text } from 'react-native';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

export default function ScrollReferenceScreen() {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  return (
    <AvatarHeaderScrollView
      ref={scrollRef}
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Field notes">
      <Text style={{ minHeight: 1200, padding: 24 }}>
        Read these notes, then return to the header.
      </Text>
      <Button
        title="Back to top"
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </AvatarHeaderScrollView>
  );
}
```

`TabbedHeaderPager` exposes the vertical scroll ref at `ref`. Its horizontal pager ref belongs in `pagerProps.ref` and uses the exported `PagerMethods` type. FlashList adapters use `FlashListRef<ItemT>` from `@shopify/flash-list`, as shown in the [migration guide](../introduction/modernization-guide.md).
