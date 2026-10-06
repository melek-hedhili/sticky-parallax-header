---
sidebar_position: 2
---

# Pull to refresh

`FlatList`, `SectionList` and FlashList headers inherit the list's `onRefresh`
and `refreshing` props. A `ScrollView` header instead takes an explicit
`refreshControl` element. Do not pass list-only refresh props to
`StickyHeaderScrollView`.

```tsx
import { useCallback, useState } from 'react';
import { Platform, RefreshControl, Text } from 'react-native';
import { StickyHeaderScrollView } from 'react-native-sticky-parallax-header';

export function RefreshableHeader() {
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(() => new Date().toLocaleTimeString());
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      setUpdatedAt(new Date().toLocaleTimeString());
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <StickyHeaderScrollView
      containerStyle={{ flex: 1 }}
      renderHeader={() => <Text style={{ height: 200, padding: 24 }}>Updates</Text>}
      refreshControl={
        Platform.OS === 'web' ? undefined : (
          <RefreshControl style={{ zIndex: 1 }} refreshing={refreshing} onRefresh={onRefresh} />
        )
      }>
      <Text style={{ minHeight: 1000, padding: 24 }}>Updated at {updatedAt}</Text>
    </StickyHeaderScrollView>
  );
}
```

Keep the refresh indicator above the header overlay on iOS with the shown
`zIndex`. The sample delays briefly to demonstrate the refreshing state; replace
that asynchronous operation with your application's data reload.

## Web

Native pull-to-refresh is not part of the web compatibility contract. Omit
`refreshControl` on web; for list components, omit `onRefresh` there as well.
The legacy web implementation could duplicate list padding. Use a separate
refresh button for a web-specific interaction.
