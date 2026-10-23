# Tabbed headers

Read this reference when tabs navigate sectioned content or switch horizontal pages.

## Public exports

| Export | Contract |
| --- | --- |
| `TabbedHeaderList<ItemT, SectionT>` | One vertical `SectionList`; tabs map to sections |
| `TabbedHeaderPager` | One horizontal page per child inside a vertically collapsing header |
| `TabbedHeaderSharedProps` | Shared foreground, tabs, styling, safe-area, snap, and scroll props |
| `TabbedHeaderListProps<ItemT, SectionT>` | Shared props plus `SectionList` props |
| `TabbedHeaderPagerProps` | Shared props plus pager behavior |
| `PagerProps` | Supported props for the managed horizontal `FlatList` |
| `PagerMethods` | Imperative `{ goToPage(pageNumber) }` handle |

Import these from the package root.

## Shared header and tab props

Tabbed headers share the predefined defaults documented in [Avatar and Details](avatar-and-details.md): responsive `parallaxHeight`, `headerHeight={100}`, safe-area top inset, snap, bounce, deceleration, nested scrolling, and event throttling.

| Prop | Purpose | Default |
| --- | --- | --- |
| `title`, `titleStyle`, `titleTestID` | Foreground title | — |
| `foregroundImage` | Foreground image source | — |
| `backgroundImage`, `backgroundColor` | Background image or static/animated color | — |
| `logo` | Enables the predefined fixed logo bar | — |
| `logoContainerStyle`, `logoStyle`, `logoResizeMode` | Logo presentation | — |
| `renderHeaderBar` | Replaces the fixed bar | Safe-area spacer when there is no logo |
| `hasBorderRadius` | Rounded header/content transition | — |
| `tabs` | Tab descriptors; each may have `title`, `testID`, and an icon element or `(isActive) => element` | — |
| `tabsContainerBackgroundColor` | Static or animated tab-bar background | Falls back to `backgroundColor` |
| `tabsContainerHorizontalPadding` | Horizontal tab padding and underline origin | `20` |
| `tabsContainerStyle` | Tab row content-container style | — |
| `tabWrapperStyle` | Per-tab wrapper style | — |
| `tabTextStyle`, `tabTextActiveStyle` | Inactive and active animated-compatible text styles | — |
| `tabTextContainerStyle`, `tabTextContainerActiveStyle` | Inactive and active container styles | — |
| `tabUnderlineColor` | Enables the measured animated underline | — |

For more than three tabs, the tab strip scrolls to keep the active tab visible. The implementation responds to window-width changes and handles RTL inversion on Android and iOS.

## `TabbedHeaderList`

Use this for a single vertical `SectionList`. Keep `tabs` and `sections` in the same order and give every section a stable `key`; active-tab tracking compares the first visible item's section key.

Defaults owned by this component:

- `stickySectionHeadersEnabled={true}`;
- `viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}`;
- the general predefined defaults listed above.

When a tab is pressed, a non-empty sticky section targets its first data row so React Native can compensate for the sticky section header. Empty sections, or sections with sticky headers disabled, target the section header itself. Programmatic scrolling temporarily suppresses viewability-driven tab changes.

```tsx
import { Text } from 'react-native';
import { TabbedHeaderList } from '@mhedhili/react-native-sticky-parallax-header';

const sections = ['Trails', 'Campsites'].map((title) => ({
  key: title,
  title,
  data: Array.from({ length: 20 }, (_, index) => `${title} ${index + 1}`),
}));

export function ExploreScreen() {
  return (
    <TabbedHeaderList
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Explore nearby"
      tabs={sections.map(({ title }) => ({ title }))}
      sections={sections}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
      renderSectionHeader={({ section }) => (
        <Text style={{ padding: 16, backgroundColor: '#d8f3dc' }}>{section.title}</Text>
      )}
    />
  );
}
```

Use the forwarded ref as a modern `SectionList` ref. Do not try to control the active tab with a separate index; tab selection is derived from presses and viewability.

## `TabbedHeaderPager`

Use this when each tab is a horizontal page. Supply exactly one child for each tab and preserve the same order. Each child should provide enough vertical content or its own deliberate layout.

| Prop | Behavior | Default |
| --- | --- | --- |
| `initialPage` | Initial zero-based page | `0` |
| `onChangeTab` | JavaScript callback `(previousPage, newPage)` for presses, swipes, and imperative changes | — |
| `rememberTabScrollPosition` | Restores each page's saved vertical position | `false` |
| `disableScrollToPosition` | Stops automatic vertical repositioning when switching pages | `false` |
| `pageContainerStyle` | Style for each measured page wrapper | — |
| `pagerProps` | Props and ref for the managed horizontal pager | — |

When switching away from a nonzero vertical offset, the default target for a page without a remembered offset is the collapsed position. Saved negative iOS elasticity offsets are clamped to zero. Position changes are delayed briefly to coordinate horizontal and vertical motion.

```tsx
import { type ComponentRef, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { PagerMethods } from '@mhedhili/react-native-sticky-parallax-header';
import { TabbedHeaderPager } from '@mhedhili/react-native-sticky-parallax-header';

const tabs = [{ title: 'Overview' }, { title: 'Saved' }];

export function NotesScreen() {
  const verticalRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const pagerRef = useRef<PagerMethods>(null);

  return (
    <TabbedHeaderPager
      ref={verticalRef}
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Field notes"
      tabs={tabs}
      rememberTabScrollPosition
      pagerProps={{ ref: pagerRef }}>
      {tabs.map(({ title }) => (
        <View key={title} style={{ minHeight: 1200, padding: 24 }}>
          <Text>{title}</Text>
        </View>
      ))}
    </TabbedHeaderPager>
  );
}
```

The outer `ref` controls the vertical `ScrollView`. `pagerProps.ref` exposes `PagerMethods.goToPage`. Invalid, fractional, negative, or out-of-range page numbers are ignored.

The managed pager owns its horizontal data, renderer, paging, and core scroll callbacks. Its useful defaults include directional lock, `keyboardDismissMode="on-drag"`, no horizontal indicator, `scrollsToTop={false}`, and `scrollEventThrottle={16}`. Pager scroll callbacks supplied in `pagerProps` run as worklets.

## Nested lists and limitations

If pager pages contain independently scrolling vertical lists, set `enableHeaderBounce={false}` on the outer header. The outer zero offset cannot prove that the inner list is at its own top, so it cannot safely arbitrate vertical pull gestures.

In the current iOS Expo demo, deeply scrolling the nested SectionList pager example can settle at its first card. Treat nested vertical scrolling as a separate runtime validation target.

Web uses debounced horizontal scroll detection because the native momentum contract is unavailable. Verify tab presses, swipes, responsive widths, and RTL in a real browser; an export build is not sufficient.

