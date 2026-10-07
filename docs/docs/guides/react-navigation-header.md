---
sidebar_position: 5
---

# React Navigation header and sticky header layout

When a visible, opaque navigation header already handles the top safe area, set `enableSafeAreaTopInset={false}` to avoid adding that inset twice. Keep the default when your sticky header draws behind a hidden or transparent navigation header, unless your surrounding layout handles the inset itself.

The same rule applies to Expo Router's native Stack headers. The demo's
[SectionList tabs screen](https://github.com/netguru/sticky-parallax-header/blob/master/demo/src/showcase/screens/additional-examples/tabbed-header-with-section-lists.tsx)
uses a visible navigation header and disables the library's top inset. Other
showcase screens hide the navigation header and keep their library-owned bars.

Use this screen inside your navigation setup with `SafeAreaProvider` at the app root:

```tsx
import { Text, View } from 'react-native';
import { TabbedHeaderPager } from 'react-native-sticky-parallax-header';

export default function NotesScreen() {
  return (
    <TabbedHeaderPager
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Field notes"
      enableSafeAreaTopInset={false}
      tabs={[{ title: 'Overview' }, { title: 'Saved' }]}>
      <View style={{ minHeight: 1200, padding: 24 }}>
        <Text>Overview</Text>
      </View>
      <View style={{ minHeight: 1200, padding: 24 }}>
        <Text>Saved notes</Text>
      </View>
    </TabbedHeaderPager>
  );
}
```
