---
sidebar_position: 3
---

# Rendering icons in tabs

A tab's `icon` render function receives its active state. This example assumes `SafeAreaProvider` at the app root.

```tsx
import { Text, View } from 'react-native';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';

export default function TabIconsScreen() {
  return (
    <TabbedHeaderPager
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Field notes"
      tabs={[
        {
          title: 'Favorites',
          icon: (active) => <Text style={{ color: 'white' }}>{active ? '★' : '☆'}</Text>,
        },
        { title: 'All notes' },
      ]}>
      <View style={{ minHeight: 1200, padding: 24 }}>
        <Text>Favorite notes</Text>
      </View>
      <View style={{ minHeight: 1200, padding: 24 }}>
        <Text>All notes</Text>
      </View>
    </TabbedHeaderPager>
  );
}
```
