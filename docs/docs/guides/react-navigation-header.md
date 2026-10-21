---
sidebar_position: 5
---

# React Navigation header and sticky header layout

When a visible, opaque navigation header already handles the top safe area, set `enableSafeAreaTopInset={false}` to avoid adding that inset twice. Keep the default when your sticky header draws behind a hidden or transparent navigation header, unless your surrounding layout handles the inset itself.

The same rule applies to Expo Router's native Stack headers. The demo's
[SectionList tabs screen](https://github.com/melek-hedhili/sticky-parallax-header/blob/master/demo/src/showcase/screens/additional-examples/tabbed-header-with-section-lists.tsx)
uses a visible navigation header and disables the library's top inset. Other
showcase screens hide the navigation header and keep their library-owned bars.

In the current iOS Expo demo, deep scrolling in this nested-list showcase can
settle at the first card. This also reproduces in the pre-bounce checkout; verify
nested scrolling separately from the navigation header and safe-area placement.

Use this screen inside your navigation setup with app-owned gesture and safe-area
roots, as shown in the [installation guide](../introduction/installation.md#gesture-handling-and-safe-areas):

```tsx
import { Text, View } from 'react-native';
import { TabbedHeaderPager } from '@mhedhili/react-native-sticky-parallax-header';

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
