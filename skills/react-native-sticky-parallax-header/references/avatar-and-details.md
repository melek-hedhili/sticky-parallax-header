# Avatar and Details headers

Read this reference for ready-made profile or content-detail headers. Choose the scroll variant from the consumer's data shape instead of converting data to fit another component.

## Public exports

| Layout | Free-form children | Flat data | Sectioned data | Exported prop types |
| --- | --- | --- | --- | --- |
| Avatar | `AvatarHeaderScrollView` | `AvatarHeaderFlatList<ItemT>` | `AvatarHeaderSectionList<ItemT, SectionT>` | `AvatarHeaderSharedProps`, `AvatarHeaderScrollViewProps`, `AvatarHeaderFlatListProps`, `AvatarHeaderSectionListProps` |
| Details | `DetailsHeaderScrollView` | `DetailsHeaderFlatList<ItemT>` | `DetailsHeaderSectionList<ItemT, SectionT>` | `DetailsHeaderSharedProps`, `DetailsHeaderScrollViewProps`, `DetailsHeaderFlatListProps`, `DetailsHeaderSectionListProps` |

Import them from the package root. The ScrollView variant accepts children, the FlatList variant requires `data` and `renderItem`, and the SectionList variant requires `sections` and its section/list renderers. Each inherits the corresponding React Native scrollable props except those owned by the sticky wrapper; rely on the installed TypeScript declarations for that inherited surface.

Use Avatar for a profile-like image, title, and subtitle. Use Details when the foreground also needs a tag and content icon/count.

## Shared predefined behavior

Both families inherit the primitive scroll and snapping props and add the following package behavior:

| Prop | Behavior | Default |
| --- | --- | --- |
| `backgroundColor` | Static, processed, shared, or derived animated color | — |
| `backgroundImage` | React Native image source behind the foreground | — |
| `headerHeight` | Collapsed header-bar height | `100` dp |
| `parallaxHeight` | Expanded foreground height | Responsive formula below |
| `renderHeaderBar` | Replaces the fixed predefined header bar | Predefined bar |
| `enableSafeAreaTopInset` | Adds top inset to the predefined bar | `true` |
| `enableHeaderBounce` | Enables elastic pull at the expanded top | `true` |
| `snapToEdge` | Snaps expanded/collapsed | `true` |
| `stickyTabs` | Keeps custom `renderTabs` visible when supplied | `true` |
| `onTopReached` | JavaScript callback, once per visit to the top | — |
| `decelerationRate` | Underlying scroll deceleration | `fast` |
| `nestedScrollEnabled` | Native nested scrolling | `true` |
| `overScrollMode` | Android overscroll setting | `never` |
| `scrollEventThrottle` | Scroll event interval | `16` |

The responsive expanded height is:

```ts
const parallaxHeight =
  windowWidth > windowHeight && windowHeight <= 414
    ? 200
    : Math.min(320, Math.max(280, Math.round(windowHeight * 0.32)));
```

It updates with window dimensions. An explicit `parallaxHeight` bypasses this calculation. The actual collapse distance remains `Math.max(parallaxHeight, headerHeight * 2)`.

The outer wrapper uses `backgroundColor`; `contentContainerStyle.backgroundColor` determines the content surface behind the foreground. Shared/derived color values stay on the UI runtime. See [behavior and recipes](behavior-and-recipes.md) for animated colors, worklets, safe areas, bounce, and refresh.

## Avatar-specific props

| Prop | Type or purpose |
| --- | --- |
| `image` | Avatar `ImageSourcePropType` |
| `title`, `subtitle` | Foreground strings |
| `titleStyle`, `subtitleStyle` | Animated-compatible text styles |
| `titleTestID`, `subtitleTestID` | Test identifiers |
| `hasBorderRadius` | Enables the rounded transition between header and content |
| `tabsContainerBackgroundColor` | Background used where custom tabs meet the header |
| `leftTopIcon`, `rightTopIcon` | Image source or render function returning a React element or `null` |
| `leftTopIconOnPress`, `rightTopIconOnPress` | JavaScript press callbacks |
| `leftTopIconAccessibilityLabel`, `rightTopIconAccessibilityLabel` | Required when the corresponding icon is interactive |
| `leftTopIconTestID`, `rightTopIconTestID` | Test identifiers |

```tsx
import { Text, View } from 'react-native';
import { AvatarHeaderScrollView } from '@mhedhili/react-native-sticky-parallax-header';

export function ProfileScreen() {
  return (
    <AvatarHeaderScrollView
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Alex Morgan"
      subtitle="Field notes"
      titleStyle={{ color: 'white' }}
      hasBorderRadius>
      <View style={{ padding: 24 }}>
        <Text style={{ minHeight: 1000 }}>Profile content</Text>
      </View>
    </AvatarHeaderScrollView>
  );
}
```

## Details-specific props

Details supports every shared icon prop above and adds:

| Prop | Type or purpose |
| --- | --- |
| `image` | Foreground `ImageSourcePropType` |
| `title`, `subtitle`, `tag` | Foreground strings |
| `titleStyle`, `subtitleStyle`, `tagStyle` | Animated-compatible text styles |
| `titleTestID`, `subtitleTestID`, `tagTestID` | Test identifiers |
| `contentIcon` | Image displayed with the content count |
| `contentIconNumber` | Numeric content count |
| `contentIconNumberStyle` | Animated-compatible count style |
| `contentIconNumberTestID` | Count test identifier |
| `hasBorderRadius` | Enables the rounded transition |
| `tabsContainerBackgroundColor` | Background around custom tabs |

```tsx
import { Text } from 'react-native';
import { DetailsHeaderFlatList } from '@mhedhili/react-native-sticky-parallax-header';

const articles = ['Layout', 'Animation', 'Accessibility'];

export function CollectionScreen() {
  return (
    <DetailsHeaderFlatList
      containerStyle={{ flex: 1 }}
      backgroundColor="#126b5e"
      tag="Guides"
      title="Sticky headers"
      subtitle="Three articles"
      contentIconNumber={articles.length}
      data={articles}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={{ padding: 24 }}>{item}</Text>}
    />
  );
}
```

## Custom bars, callbacks, and refs

`renderHeaderBar` replaces the fixed bar, not the collapsing foreground. A custom bar owns its height, top inset, actions, and accessibility. Set `headerHeight` to its actual height so the collapse geometry agrees.

`renderHeader` may replace the family's default collapsing foreground. `renderTabs` may add a custom measured tab region. Prefer primitives if most of the predefined foreground is being replaced.

Scroll callbacks (`onScroll`, drag, and momentum callbacks) run as worklets. Layout callbacks, icon presses, and `onTopReached` run on JavaScript.

Each component forwards its ref to its underlying `ScrollView`, `FlatList`, or `SectionList`. Infer the modern ref with `ComponentRef` from React, retaining item and section generics for lists. Do not use legacy `onRef` or `scrollRef` props.

